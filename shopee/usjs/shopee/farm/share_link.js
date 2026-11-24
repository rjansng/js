let title = '蝦蝦果園取得站外澆水資訊。';
let version = 'v20240118';

// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

console.log('蝦蝦果園取得站外澆水資訊。');
function sleep(seconds) {
  console.log(`\t\t\t\t\t\t\t⏰ 等待 ${seconds} 秒`);
  const waitUntil = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() < waitUntil) true;
}


function cookieToString(cookieObject) {
  let string = '';
  for (const [key, value] of Object.entries(cookieObject)) {
    if (key !== 'SPC_EC') { string += `${key}=${value};`; }
  }
  return string;
}
const ShopeeInfo = $persistentStore.read('ShopeeInfo' + _ShopeeUserID);
let shopeeInfo = !ShopeeInfo || ShopeeInfo.length === 0 ? {} : JSON.parse(ShopeeInfo);
const shopeeCookie = `${cookieToString(shopeeInfo.tokenAll)}shopee_token=${shopeeInfo.shopeeToken};`;
const shopeeCSRFToken = shopeeInfo.csrfToken;

function telegramNotify(title, subtitle = '', message = '') {
  let TelegramUrl = $persistentStore.read('TelegramUrl') || '';
  if (TelegramUrl != '') {
    let telegramData = { url: TelegramUrl + encodeURIComponent(title + (subtitle != '' ? '\n' : '') + subtitle + (message != '' ? '\n' : '') + message) };
    // 已移除外部 Telegram 通知傳送
  }
}
function shopeeNotify(subtitle = '', message = '', url = '') {
  var title = '🍤 蝦蝦果園 Share Link';

  if (蝦蝦果園站外澆水LinkTG && ($persistentStore.read('TelegramUrl') || '') != '') {
    telegramNotify(title, subtitle, message);
  }
  else {
    $notification.post(title, subtitle, message, { 'openUrl': url });
    // console.log(title + '\t' + subtitle + '\t' + message);
  }
};

let 蝦蝦果園站外澆水Link = $persistentStore.read('蝦蝦果園站外澆水Link') || '0';
if (蝦蝦果園站外澆水Link == '預設:0') { 蝦蝦果園站外澆水Link = '0'; }
蝦蝦果園站外澆水Link = parseInt(蝦蝦果園站外澆水Link);
let 蝦蝦果園站外澆水LinkTG = ($persistentStore.read('蝦蝦果園站外澆水LinkTG') || '') != '否';

var skey = '';
var urlShare = 'https://games.shopee.tw/farm/share.html?skey={skey}';

// let UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15.7.2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7.2 Mobile/15E148 Safari/604.1';
const shopeeHeaders = {
  'Content-Type': 'application/json',
  'Cookie': shopeeCookie,
  // 'User-Agent': UA
};
const dataRequest = {
  url: 'https://games.shopee.tw/farm/api/friend/share_link/get?params=%5Bobject%20Object%5D',
  headers: shopeeHeaders,
};
function getInfo1() {
  console.log('\n取得資訊...');
  $httpClient.get(dataRequest, function (error, response, data) {
    if (error) {
      console.log(error);
      console.log(data);
      $done({});
    } else {
      if (response.status === 200) {
        try {
          const json = JSON.parse(data);
          //console.log(json);
          if (json.code === 0) {
            console.log('取得資訊' + '成功。');
            skey = json.data.shareKey;
            var slink = urlShare.replace('{skey}', skey) + '&schannel=copyLink';
            console.log('\n' + slink);
            //console.log(skey);
            //$persistentStore.write(slink, 'ShopeeFarmLink' + _ShopeeUserID);

            if (蝦蝦果園站外澆水Link == 1) {
              shopeeNotify('站外澆水 Link', slink, slink);
              $done({});
            }
            else if (蝦蝦果園站外澆水Link == 3) {
              console.log(蝦蝦果園站外澆水Link);
              postData1();
            }
            else {
              postData1();
            }
          }
          else {
            console.log('取得資訊' + '失敗。' + json.msg);
            console.log(data);
            $done({});
          }
        } catch (error) {
          console.log('ERR:' + error);
          console.log(data);
          $done({});
        }
      } else {
        console.log(response.status);
        console.log(data);
        $done({});
      }
    }
  });
}
function getInfo2() {
  sleep(1.0);
  delete shopeeHeaders['Content-Length'];
  delete shopeeHeaders['Content-Type'];

  const dataRequest2 = {
    url: 'https://games.shopee.tw/farm/api/orchard/resource/get',
    headers: shopeeHeaders,
  };

  console.log('\n取得資訊...');
  $httpClient.get(dataRequest2, function (error, response, data) {
    if (error) {
      console.log(error);
      console.log(data);
      $done({});
    } else {
      if (response.status === 200) {
        try {
          const json = JSON.parse(data);
          //console.log(json);
          if (json.code === 0) {
            console.log('取得資訊' + '成功。');
            console.log(json);

            $done({});

          }
          else {
            console.log('取得資訊' + '失敗。' + json.msg);
            console.log(data);
            $done({});
          }
        } catch (error) {
          console.log('ERR:' + error);
          console.log(data);
          $done({});
        }
      } else {
        console.log(response.status);
        console.log(data);
        $done({});
      }
    }
  });
}

function postData1() {
  sleep(1.0);
  let formData = 'https://games.shopee.tw/shareplatform?title=%E8%9D%A6%E8%9D%A6%E6%9E%9C%E5%9C%92&desc=%E8%9D%A6%E8%9D%A6%E6%9E%9C%E5%9C%92%E5%85%A8%E6%96%B0%E7%A8%AE%E5%AD%90%EF%BC%8C%E5%A4%A9%E5%A4%A9%E6%BE%86%E6%B0%B4%20%E6%94%B6%E6%88%90%240%E5%A5%BD%E7%A6%AE%EF%BC%81%E5%BF%AB%E4%BE%86%E6%8F%AA%E6%9C%8B%E5%8F%8B%E4%B8%80%E8%B5%B7%E7%A8%AE%E6%9E%9C%E5%9C%92%EF%BC%81&universal=0&img=https%3A%2F%2Fcf.shopee.tw%2Ffile%2Ftw-11134001-7qul2-ljk34emhr619e8&disableDeepLinkOnFacebook=1&link=';
  // let slink = urlShare.replace('{skey}', skey) + '&sfrom=ask4water&schannel=telegram';
  // let slink = urlShare.replace('{skey}', skey) + '&sfrom=task&schannel=line';
  let slink = urlShare.replace('{skey}', skey) + '&sfrom=task&schannel=copy_link';
  formData += encodeURIComponent(slink);

  let payload = '';

  const boundary = '------GamesRuntimeFormDataBoundary';

  let content = '';
  content = [
    `\r\n--${boundary}`,
    `\r\nContent-Disposition: form-data; name="real_url";`,
    `\r\n`,
    `\r\n${formData}`,
  ].join('');

  payload += content;

  payload += `\r\n--${boundary}--`;

  //console.log(payload);
  const dataResponse = {
    url: 'https://games.shopee.tw/gameplatform/api/v1/share/genShortUrl?appid=8fUcfB3U9Q49J8iFFg',
    headers: shopeeHeaders,
    body: payload
  };
  dataResponse.headers['Content-Length'] = payload.length;
  dataResponse.headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
  //console.log(dataResponse);

  console.log('\n取得Link資訊...');
  $httpClient.post(dataResponse, function (error, response, data) {
    if (error) {
      console.log(error);
      console.log(data);
      $done({});
    } else {
      if (response.status === 200) {
        try {
          const json = JSON.parse(data);
          //console.log(json);
          if (json.code == 0 && 'data' in json) {
            console.log('取得資訊' + '成功。');
            //console.log(json);
            var slink = json.data.short_url;
            shopeeNotify('站外澆水 Link 2', slink, slink);

            console.log('\n' + slink);

            //getInfo2();
            $done({});
          }
          else {
            console.log('取得資訊' + '失敗。' + json.msg);
            console.log(data);
            $done({});
          }
        } catch (error) {
          console.log('ERR:' + error);
          console.log(data);
          $done({});
        }
      } else {
        console.log(response.status);
        console.log(data);
        $done({});
      }
    }
  });
}

if (蝦蝦果園站外澆水Link == 0) { $done({}); } else { getInfo1(); }
