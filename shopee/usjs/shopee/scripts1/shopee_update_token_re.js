// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

let UseHTTPS = $persistentStore.read('使用HTTPS') || '';
if (UseHTTPS != '否') { UseHTTPS = true; } else { UseHTTPS = false; }

let caption = ' 更新 token 依需要而執行 (來源 澆水、餵食、洗澡)';
let title = '🍤 蝦皮' + caption;
const version = 'v20240115';
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

async function updateSpcEc() {
  return new Promise((resolve, reject) => {
    let shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
    if (isEmptyObject(shopeeInfo)) {
      return reject(['取得 token 失敗 ‼️', '找不到儲存的 token']);
    }

    const request = {
      url: 'https://mall.shopee.tw/api/v4/client/refresh',
      headers: {
        'Cookie': `shopee_token=${shopeeInfo.shopeeToken};`,
        'Content-Type': 'application/json',
      },
    };

    try {
      $httpClient.get(request, function (error, response, data) {
        if (error) {
          return reject(['更新 SPC_EC 失敗 ‼️', '連線錯誤']);
        } else {
          if (response.status == 200) {
            const obj = JSON.parse(data);
            if (obj.error) {
              return reject(['更新 SPC_EC 失敗 ‼️', '請重新取得 token']);
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
              return resolve(cookieObject.SPC_EC);
            } else {
              return reject(['更新 SPC_EC 失敗 ‼️', '找不到回應的 token']);
            }
          } else {
            return reject(['更新 SPC_EC 失敗 ‼️', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['更新 SPC_EC 失敗 ‼️', error]);
    }
  });
}

async function updateCookie(spcEc) {
  return new Promise((resolve, reject) => {
    try {
      let shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
      if (isEmptyObject(shopeeInfo)) {
        return reject(['取得 token 失敗 ‼️', '找不到儲存的 token']);
      }

      const request = {
        url: 'https://shopee.tw/api/v2/user/account_info?from_wallet=false&skip_address=1&need_cart=1',
        headers: {
          'Cookie': `${cookieToString(shopeeInfo.tokenAll)}SPC_EC=${spcEc};shopee_token=${shopeeInfo.shopeeToken};`,
        },
      };

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
              const tokenInfo = {
                SPC_SEC_SI: shopeeInfo.tokenAll.SPC_SEC_SI,
                REC_T_ID: shopeeInfo.tokenAll.REC_T_ID,
                SPC_AFTID: shopeeInfo.tokenAll.SPC_AFTID,
                SPC_CLIENTID: shopeeInfo.tokenAll.SPC_CLIENTID,
                SPC_B_SI: shopeeInfo.tokenAll.SPC_B_SI,

                SPC_DH: shopeeInfo.tokenAll.SPC_DH,
                _QPWSDCXHZQA: shopeeInfo.tokenAll._QPWSDCXHZQA,
                SPC_RNBV: shopeeInfo.tokenAll.SPC_RNBV,
                REC7iLP4Q: shopeeInfo.tokenAll.REC7iLP4Q,
                ds: shopeeInfo.tokenAll.ds,
                shopee_webUnique_ccd: shopeeInfo.tokenAll.shopee_webUnique_ccd,

                shopee_app_version: shopeeInfo.tokenAll.shopee_app_version,
                shopee_rn_bundle_version: shopeeInfo.tokenAll.shopee_rn_bundle_version,
                shopee_rn_version: shopeeInfo.tokenAll.shopee_rn_version,

                csrftoken: shopeeInfo.tokenAll.csrftoken,
                shopee_token: shopeeInfo.tokenAll.shopee_token,
                shopid: shopeeInfo.tokenAll.userid,
                username: shopeeInfo.tokenAll.username,

                SPC_EC: spcEc,
                SPC_F: shopeeInfo.tokenAll.SPC_F,
                SPC_R_T_ID: cookieObject.SPC_R_T_ID,
                SPC_R_T_IV: cookieObject.SPC_R_T_IV,
                SPC_SI: cookieObject.SPC_SI,
                SPC_ST: cookieObject.SPC_ST,
                SPC_T_ID: cookieObject.SPC_T_ID,
                SPC_T_IV: cookieObject.SPC_T_IV,
                SPC_U: cookieObject.SPC_U,
                SPC_DID: shopeeInfo.tokenAll.SPC_DID,
              };
              if (shopeeInfo.tokenAll.SPC_EC === tokenInfo.SPC_EC) {
                console.log('⚠️ SPC_EC 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_R_T_ID === tokenInfo.SPC_R_T_ID) {
                console.log('⚠️ SPC_R_T_ID 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_R_T_IV === tokenInfo.SPC_R_T_IV) {
                console.log('⚠️ SPC_R_T_IV 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_SI === tokenInfo.SPC_SI) {
                console.log('⚠️ SPC_SI 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_ST === tokenInfo.SPC_ST) {
                console.log('⚠️ SPC_ST 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_T_ID === tokenInfo.SPC_T_ID) {
                console.log('⚠️ SPC_T_ID 新舊內容一致，並未更新');
              }
              if (shopeeInfo.tokenAll.SPC_T_IV === tokenInfo.SPC_T_IV) {
                console.log('⚠️ SPC_T_IV 新舊內容一致，並未更新');
              }

              shopeeInfo.lastDate = Date.now();

              shopeeInfo.token = tokenInfo;
              // shopeeInfo.userName = cookieObject.username;
              // shopeeInfo.userId = cookieObject.SPC_U;
              shopeeInfo.cookieAll = cookieToString(shopeeInfo.tokenAll);
              if (!shopeeInfo.cookieAll.includes('shopee_token=')) shopeeInfo.cookieAll += `shopee_token=${shopeeInfo.shopeeToken};`;
              if (!shopeeInfo.cookieAll.includes('csrftoken=')) shopeeInfo.cookieAll += `csrftoken=${shopeeInfo.csrfToken};`;
              if (!shopeeInfo.cookieAll.includes('shopid=')) shopeeInfo.cookieAll += `shopid=${shopeeInfo.shopId};`;
              if (!shopeeInfo.cookieAll.includes('userid=')) shopeeInfo.cookieAll += `userid=${shopeeInfo.tokenAll.SPC_U};`;
              if (!shopeeInfo.cookieAll.includes('username=')) shopeeInfo.cookieAll += `username=${shopeeInfo.userName};`;
              if (!shopeeInfo.cookieAll.includes('SPC_EC=')) shopeeInfo.cookieAll += `SPC_EC=${shopeeInfo.tokenAll.SPC_EC};`;
              // shopeeInfo.cookieToken = shopeeInfo.cookieAll;
              // shopeeInfo.cookieShopeeToken = shopeeInfo.cookieAll;

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

async function checkShopeeInfoReUpdate() {
  return new Promise((resolve, reject) => {
    let shopeeInfoReUpdate = getSaveObject('ShopeeInfoReUpdate');
    if (!isEmptyObject(shopeeInfoReUpdate)) {
      if (shopeeInfoReUpdate.hasOwnProperty('NeedUpdate') && shopeeInfoReUpdate.NeedUpdate) {
        resolve(true);
      }
    }
    resolve(false);
  });
}

(async () => {
  console.log(`ℹ️ ${title} ${version}`);
  try {
    if (await checkShopeeInfoReUpdate()) {
      const spcEc = await updateSpcEc();
      console.log('✅ SPC_EC 更新成功');
      await updateCookie(spcEc);
      console.log('✅ token 更新成功');

      try {
        let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
        let tsn = 'shopee' + 's';
        let tsid = 'TU';
        let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
        let tasks = JSON.parse(rs);
        let ts = {}, s = {};
        if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
        if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
        s.c++;
        s.f = true;
        ts[tsid] = s;
        tasks[tsn] = ts;
        $persistentStore.write(JSON.stringify(tasks), dataName);
      } catch (e) { console.log(e); }

      loonNotify('Token 更新成功');
      $persistentStore.write(null, 'ShopeeInfoReUpdate');

      // 帳號資料回傳已停用

    }
    else {
      console.log('目前不用更新。');
    }

    $done();
  } catch (error) {
    handleError(error);
  }
  $done();
})();
