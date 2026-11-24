let title = '取得 shpsec report riskToken';
let version = 'v20261103';
let showNotification = true;
let showLog = true;

let UseHTTPS = $persistentStore.read('使用HTTPS') || '';
if (UseHTTPS != '否') { UseHTTPS = true; } else { UseHTTPS = false; }

Date.prototype.format = function (format = '1') {
  if (format === '0') { format = 'yyyy/MM/dd HH:mm:ss.fff'; }
  else if (format === '1') { format = 'yyyy/MM/dd HH:mm:ss'; }
  else if (format === '2') { format = 'yyyy/MM/dd'; }
  else if (format === '3') { format = 'HH:mm:ss'; }
  else if (format === '4') { format = 'MM/dd'; }
  else if (format === '5') { format = 'HH:mm'; }
  let o = {
    "M+": this.getMonth() + 1, //month  
    "d+": this.getDate(),    //day  
    "h+": this.getHours(),   //hour  
    "H+": this.getHours(),   //hour  
    "m+": this.getMinutes(), //minute  
    "s+": this.getSeconds(), //second  
    "q+": parseInt((this.getMonth() + 3) / 3),  //quarter 季
    "f+": this.getMilliseconds(),  //millisecond  
    "S": this.getMilliseconds() //millisecond  
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o) if (new RegExp("(" + k + ")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length === 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
  return format;
};
function loonNotifyArray(m) { if (Array.isArray(m)) { loonNotify(m[0], m[1]); } else { loonNotify(m); } };
function loonNotify(subtitle = '', message = '', url = 'shopeetw://') { if (showNotification) { $notification.post(title, subtitle, message, { 'openUrl': url }); } if (showLog) { console.log(`${title}\t${subtitle}\t${message}`); } };
function getSaveObject(key) {
  const string = $persistentStore.read(key);
  return !string || string.length === 0 ? {} : JSON.parse(string);
}
let config = {};
async function getRiskToken() {
  return new Promise((resolve, reject) => {
    try {
      let body = $response.body;
      let obj = JSON.parse(body);
      if (obj.code == 0 && 'data' in obj) {
        if ('riskToken' in obj.data && obj.data.riskToken) {
          try {

            $persistentStore.write(null, 'ShopeeRiskToken');

            let shopeeInfo = getSaveObject('ShopeeInfo');
            if (typeof (shopeeInfo) == 'string') { shopeeInfo = JSON.parse(shopeeInfo); }

            obj.data.lastDate = Date.now();
            console.log(obj.data);

            let isWeb = false;
            if ($request.url.match(/web/i)) {
              isWeb = true;
              shopeeInfo.RiskToken3Request = $request.body;
              shopeeInfo.RiskToken3 = obj.data;
            } else {
              shopeeInfo.RiskTokenRequest = $request.body;
              shopeeInfo.RiskToken = obj.data;
            }
            
            config.RiskToken = {
              RiskToken3Request: shopeeInfo.RiskToken3Request,
              RiskToken3: shopeeInfo.RiskToken3,
              RiskTokenRequest: shopeeInfo.RiskTokenRequest,
              RiskToken: shopeeInfo.RiskToken,
            };
            config.userID = shopeeInfo.userId;

            // {"riskToken":"oXPN9Y3KEx2fon4uZ69p5Q==|Ps7OtfcXwPlleKbYtMBx9S5DtZGA7VwWutbecI4V0FixxbCYa9GZMlq2XAyXgGwT+Wxt1MHny17IAHEl/YI=|ZCBWVKrLTpsvROuz|08|3","cfgInfo":null}
            if ($argument && ($argument.tAuto1 || false)) {
              loonNotify(`取得 ${isWeb ? 'Web ' : ''}RiskToken`);
            }
            let save = $persistentStore.write(JSON.stringify(shopeeInfo, null, 4), 'ShopeeInfo');
            if (!save) {
              return reject(['保存失敗 ‼️', '無法儲存 RiskToken']);
            } else {
              return resolve();
            }

          } catch (e) { console.log(e); }
        }
        else {
          console.log('not riskToken');
          console.log(body);
          console.log(obj.data);
        }
      }
      else {
        console.log('ERR MSG');
        console.log(body);
        console.log(obj);
      }

    } catch (error) {
      return reject(['保存失敗 ‼️', error]);
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
          DataMode: 'ShopeeInfo_RiskToken',
          DataInfo: JSON.stringify(config.RiskToken),
          //DataInfo: Base64.encode(JSON.stringify(config.shopeeInfo, null, 4))
        })
      };
      // console.log(pd);
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
  try {
    await getRiskToken();
    try { console.log("SEND START!"); await Promise.resolve(true); console.log("SEND OK!"); } catch (err) { console.log('ERR'); console.log(err); }
  } catch (error) { console.log(error); }
  $done({});
})();
