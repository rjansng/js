let argd = '';
try {
  if ($argument) { argd = $argument; }
} catch (e) { console.log(e); }

let NotSet = false;
let ShopeeUserID2 = '';
let UserNickname = '';
try {
  if (argd != '') {
    if (argd == '0') {
      NotSet = true;
    }
    else if (argd.includes(';')) {
      let ds = argd.split(';');
      ShopeeUserID2 = ds[0].trim();
      UserNickname = ds[1].trim();
    }
    else {
      ShopeeUserID2 = argd;
    }
  }
} catch (e) { console.log(e); }

// ver 20230702
let UseUserId = $persistentStore.read('UseUserId') || '';
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
if (ShopeeUserID2 != '') { ShopeeUserID = ShopeeUserID2; UseUserId = '1'; }
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

let NotAutoCheckIn = $persistentStore.read('手動簽到') || '';
if (NotAutoCheckIn == '是') { NotAutoCheckIn = true; } else { NotAutoCheckIn = false; }

let AutoCheckIn = $persistentStore.read('自動簽到') || '';
if (AutoCheckIn == '是') { AutoCheckIn = true; } else { AutoCheckIn = false; }

if (NotAutoCheckIn) { AutoCheckIn = false; $persistentStore.write(null, '自動簽到'); $persistentStore.write(null, '手動簽到'); }
if (AutoCheckIn) { $persistentStore.write(null, '手動簽到'); }

let UseUA = $persistentStore.read('簽到UA') || '';
if (UseUA == '是') { UseUA = true; } else { UseUA = false; }

try {
  let vv = $loon.split(' ');
  if (vv.length >= 3) {
    if (vv[2].match(/^(\d+)\.(\d+)\.(\d+)/)) {
      let vv2 = vv[2].match(/^(\d+)\.(\d+)\.(\d+)/);
      let v1 = parseInt(vv2[1]);
      let v2 = parseInt(vv2[2]);
      let v3 = parseInt(vv2[3]);
      if (v1 > 3 || v1 == 3 && (v2 > 1 || v2 == 1 && v3 > 0)) { UseUA = true; }
      //console.log(`${v1} ${v2} ${v3}`);
    } else { UseUA = false; }
  } else { UseUA = true; }
} catch (error) { UseUA = true; }

let title = '🍤 蝦皮每日簽到';
const version = 'v20240305';

let showNotification = true;
let showLog = true;
let config = null;
const NotShowNotification = $persistentStore.read('NotShowNotification'); if (NotShowNotification) { showNotification = false; }
const NotShowLog = $persistentStore.read('ShowLog'); if (NotShowLog) { showLog = false; }
function loonNotifyArray(m) { if (Array.isArray(m)) { loonNotify(m[0], m[1]); } else { loonNotify(m); } };
function loonNotify(subtitle = '', message = '', url = 'shopeetw://') {
  if (($persistentStore.read('TelegramUrl') || '') != '') {
    if (showNotification) { telegramNotify(title, subtitle, message); }
  }
  else {
    if (showNotification) { $notification.post(title, subtitle, message, { 'openUrl': url }); }
  }
  if (showLog) { console.log(`${title}\t${subtitle}\t${message}`); }
};
function telegramNotify(title, subtitle = '', message = '') {
  let TelegramUrl = $persistentStore.read('TelegramUrl') || '';
  if (TelegramUrl != '') {
    let telegramData = { url: TelegramUrl + encodeURIComponent(title + (subtitle != '' ? '\n' : '') + subtitle + (message != '' ? '\n' : '') + message) };
    // 已移除外部 Telegram 通知傳送
  }
}

function handleError(error) {
  if (AutoCheckIn) { showNotification = true; }
  if (Array.isArray(error)) {
    console.log(`❌ ${error[0]} ${error[1]} A`);
    // console.log(`❌ ${showNotification} ${AutoCheckIn}`);
    if (error.length > 2) { console.log(error[2]); }
    if (showNotification) {
      loonNotify(error[0], error[1]);
    }
  } else {
    console.log(`❌ ${error}`);
    //console.log(`❌ ${showNotification} ${AutoCheckIn}`);
    if (showNotification) {
      loonNotify(error);
    }
  }
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
    let shopeeHeaders = {
      'Cookie': cookieToString(shopeeInfo.tokenAll),
      'Content-Type': 'application/json',
    }
    let UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15.7.2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7.2 Mobile/15E148 Safari/604.1';
    shopeeHeaders['User-Agent'] = UA;

    // if (UseUA) {
    //   let UA = 'iOS app iPhone Shopee appver=31208 language=zh-Hant app_type=1 Cronet/102.0.5005.61';
    //   UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15.7.2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7.2 Mobile/15E148 Safari/604.1';
    //   // UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=31208 appver=31208 rnver=1698306827 shopee_rn_bundle_version=5096001 Shopee language=zh-Hant app_type=1';

    //   // try {
    //   //   let ua1 = JSON.parse($persistentStore.read('ShopeeUserAgent') || '{"DataDate":"","UA":""}');
    //   //   if (ua1.UA != '') { UA = ua1.UA; }
    //   // } catch (error) { }

    //   shopeeHeaders['User-Agent'] = UA;
    //   shopeeHeaders['x-csrftoken'] = shopeeInfo.csrfToken;
    //   shopeeHeaders['referer'] = 'https://games-dailycheckin.shopee.tw/mkt/coins/api/';
    //   //      shopeeHeaders['Cookie'] = `${shopeeInfo.cookieAll}SPC_EC=${shopeeInfo.tokenAll.SPC_EC}`;
    //   shopeeHeaders['Cookie'] = `${shopeeInfo.cookieAll}`;
    //   // shopeeHeaders['accept-encoding'] = 'gzip, deflate';
    //   // shopeeHeaders['accept-language'] = 'en-US,en';
    //   // shopeeHeaders['x-shopee-client-timezone'] = 'Asia/Taipei';
    //   // shopeeHeaders['x-api-source'] = 'rn';
    //   // shopeeHeaders['dci-version'] = '2004000';

    // }

    config = {
      shopeeInfo: shopeeInfo,
      shopeeHeaders: shopeeHeaders,
    }
    // console.log(config);
    return resolve();
  });
}

async function checkin() {
  return new Promise((resolve, reject) => {
    try {
      if (!config.shopeeInfo.checkinPayload) {
        return reject(['簽到失敗 ‼️', '請先手動簽到一次']);
      }

      const request = {
        url: 'https://games-dailycheckin.shopee.tw/mkt/coins/api/v2/checkin_new',
        headers: config.shopeeHeaders,
        body: config.shopeeInfo.checkinPayload
      };
console.log(request);
      $httpClient.post(request, function (error, response, data) {
        if (error) {
          return reject(['簽到失敗 ‼️', '連線錯誤']);
        } else {
          if (response.status === 200) {
            // console.log('200');
            console.log(data);
            const obj = JSON.parse(data);
            if (obj.data.success) {

              try {
                let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
                let tsn = 'shopee' + 's';
                let tsid = 'CI';
                let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
                let tasks = JSON.parse(rs);
                let ts = {}, s = {};
                if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
                if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
                s.c++;
                s.f = true;
                s.r = `🔆${obj.data.increase_coins} 蝦幣，第 ${obj.data.check_in_day} 天。`;
                s.d.push(s.r.replace(/\n/g, ''));
                s.r = '';
                ts[tsid] = s;
                tasks[tsn] = ts;
                $persistentStore.write(JSON.stringify(tasks), dataName);
              } catch (e) { console.log(e); }


              return resolve({
                checkInDay: obj.data.check_in_day,
                coins: obj.data.increase_coins,
              });
            } else {
              showNotification = false;
              console.log(obj);
              return reject(['簽到失敗 ‼️', '本日已簽到']);
            }
          } else {
            // console.log(data);
            return reject(['簽到失敗 ‼️', response.status, data]);
          }
        }
      });
    } catch (error) {
      return reject(['簽到失敗 ‼️', error]);
    }
  });
}

(async () => {
  console.log('ℹ️ 蝦皮每日簽到 v20231004.1');
  if (!AutoCheckIn) { console.log('\n您未指定了「自動簽到」，請在蝦皮App中，手動簽到。'); }
  else {
    try {
      await preCheck();
      console.log('✅ 檢查成功');
      const result = await checkin();
      console.log('✅ 簽到成功');
      console.log(`ℹ️ 目前已連續簽到 ${result.checkInDay} 天，今日已領取 ${result.coins}`);
      loonNotify(
        `簽到成功，目前已連續簽到 ${result.checkInDay} 天`,
        `今日已領取 ${result.coins} 💰💰💰`
      );
    } catch (error) {
      handleError(error);
    }
  }
  $done();
})();
