// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

console.log('蝦皮消消樂 自動領獎勵。');

function GetTime() { return new Date().getTime().toString(); }
function rnd(len = 16) { return (Math.random() * 10 ** 20).toFixed(0).substring(0, len); }
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

var sc1 = shopeeCookie.split('SPC_U=');
var sc2 = '';
var ShopeeUserID2 = '';
if (sc1.length === 2) {
  sc2 = sc1[1].split(';');
  if (sc2.length > 1) { ShopeeUserID2 = sc2[0]; }
}
// console.log(ShopeeUserID2);
const shopeeHeaders = {
  'Content-Type': 'application/json',
  'Cookie': shopeeCookie,
};

var urlStart = 'https://games.shopee.tw/api-gateway/candycrush_api/con_login_reward/list?activityCode=1731357eb13431cb&slotCode=5e998c13d204c24a&_t=' + GetTime();
var urlPost = 'https://games.shopee.tw/api-gateway/candycrush_api/con_login_reward/recv_reward?activityCode=1731357eb13431cb&slotCode=5e998c13d204c24a';

var dataRequest = {
  url: urlStart,
  headers: shopeeHeaders,
};

var token = (new Date()).getTime().toString();
var dataResponse = {
  url: urlPost,
  headers: shopeeHeaders,
  body: {
    "requestId": `AxJMo8pm7cs5ca7OM8_${ShopeeUserID2}_${GetTime()}`
  }
};

function dataGet() {
  console.log('取得清單...');
  $httpClient.get(dataRequest, function (error, response, data) {
    if (error) {
      console.log(error);
      console.log(data);
      $done({});
    } else {
      if (response.status === 200) {
        console.log('取得清單' + '成功。\n');
        var json = JSON.parse(data);
        if (json.code === 0) {
          //console.log(json.data);

          //if (!json.data.isReceivedToday) {
            dataPost();
          // }
          // else {
          //   console.log('今天已領過獎勵。');

          // }
        }
        else {
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

function dataPost() {
  console.log('連接 領獎勵...');
  $httpClient.post(dataResponse, function (error, response, data) {
    if (error) {
      console.log(error);
      console.log(data);
      $done({});
    } else {
      if (response.status === 200) {
        try {
          var json = JSON.parse(data);
          if (json.code === 0) {
            console.log('領獎勵' + '成功。');
            console.log('還有 ' + json.data.leftRewardDays + ' 天');

            try {
              let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
              let tsn = 'candycrush' + 's';
              let tsid = 'B';
              let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
              let tasks = JSON.parse(rs);
              let ts = {}, s = {};
              if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
              if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
              s.c++;
              s.f = s.c > 0;
              s.r = `還有 ${json.data.leftRewardDays} 天 👀`;
              ts[tsid] = s;
              tasks[tsn] = ts;
              $persistentStore.write(JSON.stringify(tasks), dataName);
            } catch (e) { console.log(e); }

          }
          else {
            console.log('領獎勵' + '失敗。' + json.msg);
            console.log(json);
          }
        } catch (error) {
          console.log('ERR:' + error);
          console.log(data);
        }
        $done({});
      } else {
        console.log(response.status);
        console.log(data);
        $done({});
      }
    }
  });
}

dataGet();
//dataPost();
