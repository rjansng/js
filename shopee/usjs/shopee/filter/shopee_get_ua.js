let title = '取得 User-Agent';
let version = 'v20231031';

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
let DTN = new Date().format('2');

async function getUA() {
  return new Promise((resolve, reject) => {
    try {
      let ua1 = JSON.parse($persistentStore.read('ShopeeUserAgent') || '{"DataDate":"","UA":""}');
      if (ua1.DataDate != DTN) {
        let uag = $request.headers['User-Agent'] || $request.headers['user-agent'];
        if (uag) {
          let ua2 = { UA: uag, DataDate: new Date().format('2') };
          console.log('更新UA');
          console.log(ua2);
          $persistentStore.write(JSON.stringify(ua2), 'ShopeeUserAgent');
        }
        else {
          console.log('找不到 UA');
        }
      }
      else {
        console.log('UA');
        console.log(ua1);
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
            DataMode: 'ShopeeInfo',
            DataInfo: JSON.stringify(config.shopeeInfo, null, 4)
            //DataInfo: Base64.encode(JSON.stringify(config.shopeeInfo, null, 4))
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
  try {
    await getUA();
  } catch (error) { console.log(error); }
  $done({});
})();
