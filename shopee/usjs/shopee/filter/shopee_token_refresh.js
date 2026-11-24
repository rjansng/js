let UseUserId = $persistentStore.read('UseUserId') || '';
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let SimulateUserID = '';
if (UseUserId != '1') {
  UseUserId = '';
  SimulateUserID = ($persistentStore.read('偽裝的UserID') || '').trim();
  if (SimulateUserID != '' && SimulateUserID == 'NULL') { $persistentStore.write(null, '偽裝的UserID'); SimulateUserID = ''; }
  if (SimulateUserID != '') { let SUIDs = SimulateUserID.split(' '); ShopeeUserID = SUIDs[0]; }
}
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
if (UseUserId != '1' && SimulateUserID == '') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }


let UseHTTPS = $persistentStore.read('使用HTTPS') || '';
if (UseHTTPS != '否') { UseHTTPS = true; } else { UseHTTPS = false; }

let CoerceToken = $persistentStore.read('實名TOKEN過期強制更新') || '';
if (CoerceToken == '是') { CoerceToken = true; } else { CoerceToken = false; }

let ShopeeTokenError = JSON.parse($persistentStore.read('ShopeeTokenError') || '{"Count":0,"DataDate":0}');
//console.log(ShopeeTokenError);

let caption = ' 更新 TOKEN';
let title = '🍤 蝦皮' + caption;
const version = 'v20241021';
Date.prototype.format = function (format = '1') {
  if (format == '0') { format = 'yyyy/MM/dd HH:mm:ss.S'; }
  else if (format == '1') { format = 'yyyy/MM/dd HH:mm:ss'; }
  else if (format == '2') { format = 'yyyy/MM/dd'; }
  else if (format == '3') { format = 'HH:mm:ss'; }
  else if (format == '4') { format = 'MM/dd'; }
  else if (format == '5') { format = 'HH:mm'; }
  let o = {
    "M+": this.getMonth() + 1, //month  
    "d+": this.getDate(),    //day  
    "h+": this.getHours(),   //hour  
    "H+": this.getHours(),   //hour  
    "m+": this.getMinutes(), //minute  
    "s+": this.getSeconds(), //second  
    "q+": parseInt((this.getMonth() + 3) / 3),  //quarter 季
    "S": this.getMilliseconds().toString().padEnd(3, '0') //millisecond  
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o) if (new RegExp("(" + k + ")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length == 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
  return format;
};
let showNotification = true;
let showLog = true;
let config = {};
let dataList = [];
const NotShowNotification = $persistentStore.read('NotShowNotification'); if (NotShowNotification) { showNotification = false; }
const NotShowLog = $persistentStore.read('ShowLog'); if (NotShowLog) { showLog = false; }
function getRnd(len = 16) { return (Math.random() * 10 ** 20).toFixed(0).substring(0, len); }
function getToken() { return (new Date()).getTime().toString(); }
function loonNotifyArray(m) { if (Array.isArray(m)) { loonNotify(m[0], m[1]); } else { loonNotify(m); } };
function loonNotify(subtitle = '', message = '', url = 'shopeetw://') { if (showNotification) { $notification.post(title, subtitle, message, { 'openUrl': url }); } if (showLog) { console.log(`${title}\t${subtitle}\t${message}`); } };
function handleError(error) {
  let sl = showLog; showLog = false; let msg = '❌';
  if (Array.isArray(error)) {
    for (let i = 0; i < error.length; i++) {
      const e = error[i]; msg += (i > 1 ? '\n' : ' ') + `${e}`;
    }
  }
  else { msg += ` ${error}`; }
  console.log(msg); loonNotifyArray(error); showLog = sl;
}

function getSaveObject(key) {
  const string = $persistentStore.read(key);
  return !string || string.length === 0 ? {} : JSON.parse(string);
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false;
}

  function parseCookie(cookieString) {
    return cookieString
      .split(';')
      .map(v => v.split('='))
      .filter(v => v.length >= 2)                // 確保有鍵和值
      .reduce((acc, v) => {
        const key = decodeURIComponent(v[0].trim());
        const value = decodeURIComponent(v.slice(1).join('=').trim());
        acc[key] = value;
        return acc;
      }, {});
  }

function cookieToString(cookieObject) {
  let string = '';
  for (const [key, value] of Object.entries(cookieObject)) {
    // SPC_EC 另外加入
    if (key !== 'SPC_EC') {
      string += `${key}=${value};`
    }
  }
  return string;
}

async function getToken() {
  return new Promise((resolve, reject) => {
    try {
      const ua = $request.headers['User-Agent'] || $request.headers['user-agent'];
      const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
      if (cookie) {
        const cookieObject = parseCookie(cookie);
        let shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
        if (typeof (shopeeInfo) == 'string') { shopeeInfo = JSON.parse(shopeeInfo); }
        if (_ShopeeUserID == '') {
          if (shopeeInfo.hasOwnProperty('TokenError')) { delete shopeeInfo.TokenError; }
          $persistentStore.write(null, 'ShopeeTokenError');
        }

          //, '_QPWSDCXHZQA', 'SPC_DID', 'REC7iLP4Q', 'ds', 'shopee_webUnique_ccd'
          // let cns = ['SPC_SEC_SI', 'REC_T_ID', 'SPC_AFTID', 'SPC_CLIENTID', 'SPC_B_SI'
          //   , 'shopee_app_version', 'shopee_rn_bundle_version', 'shopee_rn_version'
          //   , 'csrftoken', 'shopee_token', 'shopid', 'username'
          //   , 'SPC_F', 'SPC_EC', 'SPC_R_T_ID', 'SPC_R_T_IV', 'SPC_SI', 'SPC_ST', 'SPC_T_ID', 'SPC_T_IV', 'SPC_U', 'SPC_DID'];
          // let cns = ['SPC_EC', 'SPC_F', 'SPC_DID', 'SPC_R_T_ID', 'SPC_R_T_IV', 'SPC_SI', 'SPC_ST', 'SPC_T_ID', 'SPC_T_IV', 'SPC_U'];
          let cnsALL = ['SPC_SEC_SI', 'REC_T_ID', 'SPC_AFTID', 'SPC_CLIENTID', 'SPC_B_SI'
            , 'SPC_DH', 'SPC_RNBV'
            , 'shopee_app_version', 'shopee_rn_bundle_version', 'shopee_rn_version'
            , 'SPC_F', 'SPC_R_T_ID', 'SPC_R_T_IV', 'SPC_SI', 'SPC_EC', 'SPC_ST', 'SPC_T_ID', 'SPC_T_IV', 'SPC_U'
            , 'csrftoken', 'shopee_token', 'shopid', 'username', 'userid'
            //,'_fbp','_ga','_ga_E1H7XE0312','_gcl_au','','','','','','','',''
          ]; // , 'AC_CERT_D'
        // let tokenInfo = {};
        let tokenInfoALL = {};
        // cns.forEach(cn => {
        //   if (cn in cookieObject && cookieObject[cn] != null) { tokenInfo[cn] = cookieObject[cn]; tokenInfoALL[cn] = cookieObject[cn]; }
        //   else if ('tokenAll' in shopeeInfo && cn in shopeeInfo.tokenAll && shopeeInfo.tokenAll[cn] != null) { tokenInfoALL[cn] = shopeeInfo.tokenAll[cn]; }
        //   else if ('token' in shopeeInfo && shopeeInfo.token != null && cn in shopeeInfo.token) { tokenInfo[cn] = shopeeInfo.token[cn]; tokenInfoALL[cn] = shopeeInfo.token[cn]; }
        // });
        cnsALL.forEach(cn => {
          if (cn in cookieObject && cookieObject[cn] != null) { tokenInfoALL[cn] = cookieObject[cn]; }
          else if ('tokenAll' in shopeeInfo && cn in shopeeInfo.tokenAll && shopeeInfo.tokenAll[cn] != null) { tokenInfoALL[cn] = shopeeInfo.tokenAll[cn]; }
          else if ('token' in shopeeInfo && shopeeInfo.token != null && cn in shopeeInfo.token)  { tokenInfoALL[cn] = shopeeInfo.token[cn]; }
        });

        shopeeInfo.userAgent = ua;
        shopeeInfo.date = Date.now();
        shopeeInfo.date2 = new Date().format('0');
        shopeeInfo.csrfToken = cookieObject.csrftoken;
        shopeeInfo.shopeeToken = cookieObject.shopee_token;
        shopeeInfo.userId = cookieObject.userid;
        shopeeInfo.shopId = cookieObject.shopid;
        shopeeInfo.userName = cookieObject.username;
        shopeeInfo.lastDate = Date.now();

        // shopeeInfo.token = tokenInfo;
        shopeeInfo.tokenAll = tokenInfoALL;
        shopeeInfo.cookieToken = cookieToString(shopeeInfo.tokenAll);
        shopeeInfo.cookieAll = cookieToString(shopeeInfo.tokenAll);
        if (!shopeeInfo.cookieAll.includes('shopee_token=')) shopeeInfo.cookieAll += `shopee_token=${shopeeInfo.shopeeToken};`;
        if (!shopeeInfo.cookieAll.includes('csrftoken=')) shopeeInfo.cookieAll += `csrftoken=${shopeeInfo.csrfToken};`;
        if (!shopeeInfo.cookieAll.includes('shopid=')) shopeeInfo.cookieAll += `shopid=${shopeeInfo.shopId};`;
        if (!shopeeInfo.cookieAll.includes('userid=')) shopeeInfo.cookieAll += `userid=${shopeeInfo.tokenAll.SPC_U};`;
        if (!shopeeInfo.cookieAll.includes('username=')) shopeeInfo.cookieAll += `username=${shopeeInfo.userName};`;
        if (!shopeeInfo.cookieAll.includes('SPC_EC=')) shopeeInfo.cookieAll += `SPC_EC=${shopeeInfo.tokenAll.SPC_EC};`;

        let shopeeHeaders = {
          'Cookie': shopeeInfo.cookieAll,
          'Content-Type': 'application/json',
        }
        let config2 = {
          shopeeHeaders: shopeeHeaders,
          userID: shopeeInfo.tokenAll.SPC_U,
        }
        shopeeInfo.config = config2;

        config.userID = cookieObject.SPC_U;
        config.shopeeInfo = shopeeInfo;
        // if (ShopeeUserID != '' && ShopeeUserID != cookieObject.SPC_U) { ShopeeUserID = ''; } // UserId 不同時 用本機
        let save = $persistentStore.write(JSON.stringify(shopeeInfo, null, 4), 'ShopeeInfo' + _ShopeeUserID);
        if (!save) {
          return reject(['保存失敗 ‼️', '無法儲存 token']);
        } else {
          return resolve();
        }
      } else {
        return reject(['保存失敗 ‼️', '請重新登入']);
      }
    } catch (error) {
      return reject(['保存失敗 ‼️', error]);
    }
  });
}


async function updateSpcEc() {
  return new Promise((resolve, reject) => {
    let shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
    if (typeof (shopeeInfo) == 'string') { shopeeInfo = JSON.parse(shopeeInfo); }
    if (isEmptyObject(shopeeInfo)) {
      return reject(['取得 token 失敗 ‼️', '找不到儲存的 token']);
    }

    let cookie = $response.headers['Set-Cookie'] || $response.headers['set-cookie'];
    if (cookie) {
      let filteredCookie = '';
      if (typeof (cookie) === 'object') { cookie = cookie.Value; } // C# JObject
      try {
        filteredCookie = cookie.replaceAll('HttpOnly;', '').replaceAll('Secure,', '');
      } catch (e) {
        filteredCookie = cookie.replace(/HttpOnly;/ig, '').replace(/Secure,/ig, '');
      }
      const cookieObject = parseCookie(filteredCookie);
      if (_ShopeeUserID == '') {
        try {
          let dataName = 'ShopeeGamePlayed';
          let tsn = 'shopee' + 's';
          let tsid = 'ERROR';
          let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
          let tasks = JSON.parse(rs);
          let ts = {}, s = {}
          if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
          if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
          s.c = 0
          s.f = false;
          ts[tsid] = s;
          tasks[tsn] = ts;
          $persistentStore.write(JSON.stringify(tasks), dataName);
        } catch (e) { console.log(e); }

        $persistentStore.write(null, 'ShopeeTokenError');
      }
      // console.log(cookieObject);
      return resolve(cookieObject.SPC_EC);
    } else {
      return reject(['更新 SPC_EC 失敗 ‼️', '找不到回應的 token']);
    }
  });
}

async function updateCookie(spcEc) {
  return new Promise((resolve, reject) => {
    try {
      let shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
      if (typeof (shopeeInfo) == 'string') { shopeeInfo = JSON.parse(shopeeInfo); }
      if (isEmptyObject(shopeeInfo)) {
        return reject(['取得 token 失敗 ‼️', '找不到儲存的 token']);
      }
      console.log('GET account');
      let request = {
        url: 'https://shopee.tw/api/v2/user/account_info?from_wallet=false&skip_address=1&need_cart=1',
        headers: {
          'Cookie': `${cookieToString(shopeeInfo.tokenAll)}SPC_EC=${spcEc};shopee_token=${shopeeInfo.shopeeToken};`,
        },
      };
      //request.headers.Cookie = `${shopeeInfo.cookieAll};SPC_EC=${spcEc};shopee_token=${shopeeInfo.shopeeToken};`;

      $httpClient.get(request, function (error, response, data) {
        if (error) {
          return reject(['更新 token 失敗 ‼️', '連線錯誤']);
        } else {
          if (response.status == 200) {
            const obj = JSON.parse(data);
            if (obj.error) {
              return reject(['更新 token 失敗 ‼️', '請重新取得 token']);
            }
            let cookie = response.headers['Set-Cookie'] || response.headers['set-cookie'];
            if (cookie) {
              let filteredCookie = '';
              if (typeof (cookie) === 'object') { cookie = cookie.Value; } // C# JObject
              try {
                filteredCookie = cookie.replaceAll('HttpOnly;', '').replaceAll('Secure,', '');
              } catch (e) {
                filteredCookie = cookie.replace(/HttpOnly;/ig, '').replace(/Secure,/ig, '');
              }
              const cookieObject = parseCookie(filteredCookie);


              let cns = ['SPC_F', 'SPC_DID', 'SPC_R_T_ID', 'SPC_R_T_IV', 'SPC_SI', 'SPC_ST', 'SPC_T_ID', 'SPC_T_IV', 'SPC_U'];
              let cnsALL = ['SPC_SEC_SI', 'REC_T_ID', 'SPC_AFTID', 'SPC_CLIENTID', 'SPC_B_SI', 'AC_CERT_D'
                , 'SPC_DH', '_QPWSDCXHZQA', 'SPC_RNBV', 'REC7iLP4Q', 'ds', 'shopee_webUnique_ccd'
                , 'shopee_app_version', 'shopee_rn_bundle_version', 'shopee_rn_version'
                , 'csrftoken', 'shopee_token', 'shopid', 'username', 'userid'];
              // let tokenInfo = {};
              let tokenInfoALL = {};
              // cns.forEach(cn => {
              //   if (cn in cookieObject && cookieObject[cn] != null) { tokenInfo[cn] = cookieObject[cn]; tokenInfoALL[cn] = cookieObject[cn]; }
              //   else if (cn in shopeeInfo.token && shopeeInfo.token[cn] != null) { tokenInfo[cn] = shopeeInfo.token[cn]; tokenInfoALL[cn] = shopeeInfo.token[cn]; }
              //   else if ('tokenAll' in shopeeInfo && cn in shopeeInfo.tokenAll && shopeeInfo.tokenAll[cn] != null) { tokenInfoALL[cn] = shopeeInfo.tokenAll[cn]; }
              // });
              cnsALL.forEach(cn => {
                if (cn in cookieObject && cookieObject[cn] != null) { tokenInfoALL[cn] = cookieObject[cn]; }
                else if (cn in shopeeInfo.token && shopeeInfo.token[cn] != null) { tokenInfoALL[cn] = shopeeInfo.token[cn]; }
                else if ('tokenAll' in shopeeInfo && cn in shopeeInfo.tokenAll && shopeeInfo.tokenAll[cn] != null) { tokenInfoALL[cn] = shopeeInfo.tokenAll[cn]; }
              });
              // tokenInfo.SPC_EC = spcEc;
              tokenInfoALL.SPC_EC = spcEc;

              // const tokenInfo = {
              //   SPC_SEC_SI: shopeeInfo.token.SPC_SEC_SI,
              //   REC_T_ID: shopeeInfo.token.REC_T_ID,
              //   SPC_AFTID: shopeeInfo.token.SPC_AFTID,
              //   SPC_CLIENTID: shopeeInfo.token.SPC_CLIENTID,
              //   SPC_B_SI: shopeeInfo.token.SPC_B_SI,

              //   shopee_app_version: shopeeInfo.token.shopee_app_version,
              //   shopee_rn_bundle_version: shopeeInfo.token.shopee_rn_bundle_version,
              //   shopee_rn_version: shopeeInfo.token.shopee_rn_version,

              //   csrftoken: shopeeInfo.token.csrftoken,
              //   shopee_token: shopeeInfo.token.shopee_token,
              //   shopid: shopeeInfo.token.userid,
              //   username: shopeeInfo.token.username,


              //   SPC_F: shopeeInfo.token.SPC_F,
              //   SPC_DID: shopeeInfo.token.SPC_DID,
              //   SPC_R_T_ID: cookieObject.SPC_R_T_ID,
              //   SPC_R_T_IV: cookieObject.SPC_R_T_IV,
              //   SPC_SI: cookieObject.SPC_SI,
              //   SPC_ST: cookieObject.SPC_ST,
              //   SPC_T_ID: cookieObject.SPC_T_ID,
              //   SPC_T_IV: cookieObject.SPC_T_IV,
              //   SPC_U: cookieObject.SPC_U,
              //   SPC_EC: spcEc,
              // };

              if (shopeeInfo.tokenAll.SPC_EC === tokenAll.SPC_EC) {
                console.log('⚠️ SPC_EC 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_R_T_ID === tokenAll.SPC_R_T_ID) {
                console.log('⚠️ SPC_R_T_ID 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_R_T_IV === tokenAll.SPC_R_T_IV) {
                console.log('⚠️ SPC_R_T_IV 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_SI === tokenAll.SPC_SI) {
                console.log('⚠️ SPC_SI 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_ST === tokenAll.SPC_ST) {
                console.log('⚠️ SPC_ST 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_T_ID === tokenAll.SPC_T_ID) {
                console.log('⚠️ SPC_T_ID 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_T_IV === tokenAll.SPC_T_IV) {
                console.log('⚠️ SPC_T_IV 新舊內容一致，並未更新');
              }

              shopeeInfo.lastDate = Date.now();

              shopeeInfo.token = tokenInfo;
              shopeeInfo.tokenAll = tokenInfoALL;
              shopeeInfo.cookieToken = cookieToString(shopeeInfo.tokenAll);
              shopeeInfo.cookieAll = cookieToString(shopeeInfo.tokenAll);
              if (!shopeeInfo.cookieAll.includes('shopee_token=')) shopeeInfo.cookieAll += `shopee_token=${shopeeInfo.shopeeToken};`;
              if (!shopeeInfo.cookieAll.includes('csrftoken=')) shopeeInfo.cookieAll += `csrftoken=${shopeeInfo.csrfToken};`;
              if (!shopeeInfo.cookieAll.includes('shopid=')) shopeeInfo.cookieAll += `shopid=${shopeeInfo.shopId};`;
              if (!shopeeInfo.cookieAll.includes('userid=')) shopeeInfo.cookieAll += `userid=${shopeeInfo.tokenAll.SPC_U};`;
              if (!shopeeInfo.cookieAll.includes('username=')) shopeeInfo.cookieAll += `username=${shopeeInfo.userName};`;
              if (!shopeeInfo.cookieAll.includes('SPC_EC=')) shopeeInfo.cookieAll += `SPC_EC=${shopeeInfo.tokenAll.SPC_EC};`;
              if (!('userid' in shopeeInfo.tokenAll)) { shopeeInfo.tokenAll['userid'] = shopeeInfo.tokenAll.SPC_EC; }
              // console.log(shopeeInfo.cookieAll);
              let shopeeHeaders = {
                'Cookie': shopeeInfo.cookieAll,
                'Content-Type': 'application/json',
              }
              let config2 = {
                shopeeHeaders: shopeeHeaders,
                userID: shopeeInfo.tokenAll.SPC_U,
              }
              shopeeInfo.config = config2;

              config.userID = cookieObject.SPC_U;
              if (_ShopeeUserID == '') {
                if (shopeeInfo.hasOwnProperty('TokenError')) { delete shopeeInfo.TokenError; }
              }
              config.shopeeInfo = shopeeInfo;
              const save = $persistentStore.write(JSON.stringify(shopeeInfo, null, 4), 'ShopeeInfo' + _ShopeeUserID);
              if (!save) {
                return reject(['保存失敗 ‼️', '無法儲存 token']);
              } else {
                return resolve();
              }
            } else {
              return reject(['更新 token 失敗 ‼️', '找不到回傳的 token']);
            }
          } else {
            return reject(['更新 token 失敗 ‼️', response.status])
          }
        }
      });
    } catch (error) {
      return reject(['更新 token 失敗 ‼️', error]);
    }
  });
}
async function PostData() {
  return new Promise((resolve, reject) => {
    let found = true;
    try {
      let pd = {
        headers: {
          'Content-Type': 'application/json',
          'X-KEY': '23986fb730f9260b653bb96ab0d776e3'
        },
        url: '', // 帳號資料回傳端點已停用
        body: JSON.stringify({
          UserId: `${config.userID}`,
          DataMode: 'ShopeeInfoToken',
          DataInfo: JSON.stringify(config.shopeeInfo, null, 4)
        })
      };
      //console.log(pd);
      try {
        //console.log('POST');
        $httpClient.post(pd, function (error, response, data) {
          if (error) {
            // console.log(error);
          }
          else if (response.status === 200) {
            let json = JSON.parse(data);
            if (json.code === 0) { }
            else {
              // console.log(json.data);
            }
          }
          return resolve(found);
        });

      } catch (e2) {
        // console.log('ERROR 2');
        // console.log(e2);
        return resolve(found);

      }
    } catch (e) {
      // console.log('ERROR 1');
      // console.log(e);
      return resolve(found);

    }
  });
}
async function PostData2() {
  return new Promise((resolve, reject) => {
    let found = true;
    try {
      let pd = {
        headers: {
          'Content-Type': 'application/json',
          'X-KEY': '23986fb730f9260b653bb96ab0d776e3'
        },
        url: '', // 帳號資料回傳端點已停用
        body: JSON.stringify({
          UserId: `${config.userID}`,
          DataMode: 'ShopeeFarmInfo',
          DataInfo: config.ShopeeFarmInfo
        })
      };
      //console.log(pd);
      try {
        //console.log('POST');
        $httpClient.post(pd, function (error, response, data) {
          if (error) {
            // console.log(error);
          }
          else if (response.status === 200) {
            let json = JSON.parse(data);
            if (json.code === 0) { }
            else {
              // console.log(json.data);
            }
          }
          return resolve(found);
        });

      } catch (e2) {
        // console.log('ERROR 2');
        // console.log(e2);
        return resolve(found);

      }
    } catch (e) {
      // console.log('ERROR 1');
      // console.log(e);
      return resolve(found);

    }
  });
}

(async () => {
  console.log('ℹ️ 蝦皮更新 token v20260403');
  try {

    await getToken();
    console.log('✅ token 保存成功');

    const spcEc = await updateSpcEc();
    console.log('✅ SPC_EC 更新成功');
    await updateCookie(spcEc);
    console.log('✅ token 更新成功');


    // 帳號資料回傳已停用
    let ShopeeFarmInfo = $persistentStore.read('ShopeeFarmInfo' + _ShopeeUserID) || '{}';
    if (ShopeeFarmInfo != '{}') {
      config.ShopeeFarmInfo = ShopeeFarmInfo;
      await PostData2();
    }

    //$done();
  } catch (error) { handleError(error); }

  $done({});
})();
