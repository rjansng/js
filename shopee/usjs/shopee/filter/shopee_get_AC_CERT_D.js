let title = '取得 AC_CERT_D'; // anti_fraud/anti_crawler/verify_signature
let version = 'v20261108';
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
async function getAC_CERT_D() {
  return new Promise((resolve, reject) => {
    try {
      let body = $response.body;
      let obj = JSON.parse(body);
      if ('x' in obj && obj.x) {
        try {

          let shopeeInfo = getSaveObject('ShopeeInfo');
          if (typeof (shopeeInfo) == 'string') { shopeeInfo = JSON.parse(shopeeInfo); }

          obj.lastDate = Date.now();
          shopeeInfo.AC_CERT_D = obj;
          config.AC_CERT_D = obj;
          config.userID = shopeeInfo.userId;
          if ($argument && ($argument.tAuto2 || false)) {
            loonNotify(`取得 AC_CERT_D`);
          }
          let save = $persistentStore.write(JSON.stringify(shopeeInfo, null, 4), 'ShopeeInfo');
          if (!save) {
            return reject(['保存失敗 ‼️', '無法儲存 AC_CERT_D']);
          } else {
            return resolve();
          }

        } catch (e) { console.log(e); }
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
          DataMode: 'ShopeeInfo_AC_CERT_D',
          DataInfo: JSON.stringify(config.AC_CERT_D),
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
    await getAC_CERT_D();
    try { console.log("SEND START!"); await Promise.resolve(true); console.log("SEND OK!"); } catch (err) { console.log('ERR'); console.log(err); }
  } catch (error) { console.log(error); }
  $done({});
})();
