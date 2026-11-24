// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '每日簽到獎勵';
const title = '🍤 蝦蝦果園' + caption;
const version = 'v20240201';
let showNotification = true;
let needLastNotify = true;
let showLog = true;
let config = null;
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

function cookieToString(cookieObject) {
  let string = '';
  for (const [key, value] of Object.entries(cookieObject)) {
    string += `${key}=${value};`
  }
  return string;
}

async function preCheck() {
  return new Promise((resolve, reject) => {
    const shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
    if (isEmptyObject(shopeeInfo)) {
      return reject(['檢查失敗 ‼️', '沒有新版 token']);
    }
    const shopeeHeaders = {
      'Cookie': cookieToString(shopeeInfo.tokenAll),
    }
    config = {
      shopeeInfo: shopeeInfo,
      shopeeHeaders: shopeeHeaders,
    }
    return resolve();
  });
}

async function getSignInBundleList() {
  return new Promise((resolve, reject) => {
    try {
      const request = {
        url: `https://games.shopee.tw/farm/api/sign_in_bundle/list?t=${new Date().getTime()}`,
        headers: config.shopeeHeaders,
      };
      $httpClient.get(request, function (error, response, data) {
        if (error) {
          return reject(['取得列表失敗 ‼️', '連線錯誤']);
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            const day = obj.data.day;
            const claimed = obj.data.signInBundlePrizes[day - 1].claimed;
            if (claimed) {
              showNotification = false;

              try {
                let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
                let tsn = 'farm' + 's';
                let tsid = 'SB';
                let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
                let tasks = JSON.parse(rs);
                let ts = {}, s = {};
                if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
                if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
                s.f = true;
                ts[tsid] = s;
                tasks[tsn] = ts;
                $persistentStore.write(JSON.stringify(tasks), dataName);
              } catch (e) { console.log(e); }


              return reject(['取得列表失敗 ‼️', '今日已簽到']);
            }

            claimSignInBundleRequest = {
              url: `https://games.shopee.tw/farm/api/sign_in_bundle/claim?t=${new Date().getTime()}`,
              headers: config.shopeeHeaders,
              body: {
                'day': day,
                'forceClaim': true
              }
            };

            return resolve();
          } else {
            return reject(['取得列表失敗 ‼️', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['取得列表失敗 ‼️', error]);
    }
  })
}

function claimSignInBundle() {
  return new Promise((resolve, reject) => {
    try {
      $httpClient.post(claimSignInBundleRequest, function (error, response, data) {
        if (error) {
          return reject(['簽到失敗 ‼️', '請重新登入']);
        } else {
          if (response.status === 200) {
            const obj = JSON.parse(data);
            if (obj.msg === 'success') {
              const day = obj.data.day;
              const prize = obj.data.signInBundlePrizes[day - 1];
              let prizeName = '';
              if (prize.prizeDetail) {
                prizeName = prize.prizeDetail.prizeName;
              }
              else {
                prizeName = prize.prizeNum + ' 滴水 💧';
              }
              return resolve(prizeName);
            }
            else {
              return reject(['簽到失敗 ‼️', `錯誤代號：${obj.code}，訊息：${obj.msg}`]);
            }
          } else {
            return reject(['簽到失敗 ‼️', response.status]);
          }
        }
      });
    } catch (error) {
      return reject(['簽到失敗 ‼️', error]);
    }
  });
}

(async () => {
  console.log('ℹ️ 蝦蝦果園每日簽到獎勵 v20230115.1');
  try {
    await preCheck();
    console.log('✅ 檢查成功');
    await getSignInBundleList();
    console.log('✅ 取得列表成功');
    const reward = await claimSignInBundle();
    console.log('✅ 領取簽到獎勵成功');
    console.log(`ℹ️ 獲得 ${reward}`);

    try {
      let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
      let tsn = 'farm' + 's';
      let tsid = 'SB';
      let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
      let tasks = JSON.parse(rs);
      let ts = {}, s = {};
      if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
      if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
      s.c++;
      s.f = true;
      s.d.push(`🔆${reward}`);
      ts[tsid] = s;
      tasks[tsn] = ts;
      $persistentStore.write(JSON.stringify(tasks), dataName);
    } catch (e) { console.log(e); }

    loonNotify(
      '簽到成功 ✅',
      `獲得 ${reward}`
    );
  } catch (error) {
    handleError(error);
  }
  $done();
})();
