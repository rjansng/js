let _ShopeeUserID = '';
Date.prototype.format = function (format = '1') {
  if (format === '0') { format = 'yyyy/MM/dd HH:mm:ss.S'; }
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
    "S": this.getMilliseconds().toString().padEnd(3, '0') //millisecond  
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o) if (new RegExp("(" + k + ")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length === 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
  return format;
};
// 自動種 800以下水量 次要種子
// v20230412
function cookieToString(cookieObject) {
  let string = '';
  for (const [key, value] of Object.entries(cookieObject)) {
    if (key !== 'SPC_EC') { string += `${key}=${value};`; }
  }
  return string;
}
function getSaveObject(key) {
  const string = $persistentStore.read(key);
  return !string || string.length === 0 ? {} : JSON.parse(string);
}

const ShopeeInfo = $persistentStore.read('ShopeeInfo');
let shopeeInfo = !ShopeeInfo || ShopeeInfo.length === 0 ? {} : JSON.parse(ShopeeInfo);
const shopeeCookie = `${cookieToString(shopeeInfo.token)}shopee_token=${shopeeInfo.shopeeToken};`;
const shopeeCSRFToken = shopeeInfo.csrfToken;
// const shopeeCropToken = $persistentStore.read('ShopeeCropToken') || '';
let shopeeFarmInfo = getSaveObject('ShopeeFarmInfo' + _ShopeeUserID);
let shopeeCropToken = shopeeFarmInfo.currentCrop.s;

var d = new Date();
var nM = (d.getMonth() + 1).toString();
var nDD = (d.getMonth() + 1).toString() + '/' + d.getDate().toString();
var nDT = d.getHours().toString() + ':' + d.getMinutes().toString();

const useNotify = $persistentStore.read('UseNotify') || '1';

var shopeeCropPrice = 0;

var shopeeCropNameS = $persistentStore.read('ShopeeCropNameSB') || '統一布丁';
shopeeCropNameS = shopeeCropNameS.replace(/\{M\}/ig, nM);
console.log(`種子 : ${shopeeCropNameS}`);
var shopeeCropNameSS = shopeeCropNameS.split(';');
console.log('預設種子數量：' + shopeeCropNameSS.length.toString());
var shopeeCropNameI = $persistentStore.read('ShopeeCropNameIB') || '1';
console.log(`定位 : ${shopeeCropNameI}`);
var shopeeCropNameII = shopeeCropNameI.split(';');
for (let i = 0; i < shopeeCropNameSS.length; i++) {
  if (shopeeCropNameII.length - 1 < i) { shopeeCropNameII.push('1'); }
}

const shopeeHeaders = {
  'Cookie': shopeeCookie,
  'X-CSRFToken': shopeeCSRFToken,
};
function shopeeNotify(subtitle = '', message = '') {
  var title = '🍤 蝦蝦果園自動種植';
  if (useNotify == '1') { $notification.post(title, subtitle, message, { 'openUrl': 'shopeetw://' }); }
  console.log(title + '\t' + subtitle + '\t' + message);
};

const dataRequest = {
  url: 'https://games.shopee.tw/farm/api/orchard/context/get?skipGuidance=0',
  headers: shopeeHeaders,
};

const getSeedListRequest = {
  url: 'https://games.shopee.tw/farm/api/orchard/crop/meta/get?t=' + new Date().getTime(),
  headers: shopeeHeaders,
};

let createCropRequest = {
  url: 'https://games.shopee.tw/farm/api/orchard/crop/create?t=' + new Date().getTime(),
  headers: shopeeHeaders,
  body: {
    'metaId': 0,
    's': shopeeCropToken
  }
}

var hasCrop = false;
function getInfo1() {
  $httpClient.get(dataRequest, function (error, response, data) {
    // console.log(error);
    // console.log(response);
    if (error) {
      console.log(error);
      console.log(data);
      getSeedList();
      // $done({});
    } else {
      if (response.status === 200) {
        try {
          const json = JSON.parse(data);
          //console.log(json);
          crop = json.data.crops[0];
          console.log('\n\n作物名稱 : ' + crop.meta.name + '\n');
          if (crop.lifeStatus == 1) {
            console.log('作物已死亡。\n');
            getSeedList();
          }
          else if (crop.state == 100) {
            console.log('作物已經可以收成了。\n');
            getSeedList();
          } else if (crop.state >= 101) {
            console.log('作物已收成。\n');
            getSeedList();
          }
          else {
            console.log('作物種植中。僅顯示狀態，不會嘗試種植。\n');
            hasCrop = true;
            getSeedList();
          }

        } catch (error) {
          console.log('ERR:' + error);
          console.log(data);
          getSeedList();
          // $done({});
        }
      } else {
        console.log(response.status);
        console.log(data);
        getSeedList();
        // $done({});
      }
    }
  });

}

var crops = [];

var CropData = null;
function procCrops() {
  crops = [];
  if (CropData == null) { return; }
  let ii = -1;
  for (var shopeeCropName of shopeeCropNameSS) {
    let found = false; ii++;
    for (const crop of CropData) {
      if (shopeeCropNameII[ii] === '1' && crop.name.includes(shopeeCropName)
        || shopeeCropNameII[ii] === '0' && crop.name.indexOf(shopeeCropName) === 0
      ) {
        let dtn = new Date().getTime();
        if (crop.config.startTime <= dtn && crop.config.endTime > dtn) {
          if (shopeeCropPrice >= crop.price && crop.config.totalExp <= 1700) {
            found = true;
            //console.log(crop.name + ` ${crop.curNum}/${crop.totalNum}。`);
            if (crop.totalNum <= crop.curNum) {
              console.log(crop.name + ` ${crop.curNum}/${crop.totalNum} 已經被搶購一空！`);
              //if (crops.length < 2) {
              // var c = { 'id': crop.id, 'name': crop.name, 'flag': 0, 'num': crop.curNum + '/' + crop.totalNum };
              // crops.push(c);
              //}
            }
            else {
              var c = { 'id': crop.id, 'name': crop.name, 'flag': 0, 'num': crop.curNum + '/' + crop.totalNum };
              crops.push(c);
            }
            break;
          }
        }
      }
    }
    if (!found) {
      console.log('今天沒有 ' + shopeeCropName + ' 的種子');
    }

  }
  //console.log(crops);
  procCrops2();
}
function procCrops2() {
  console.log('\n');
  var i = -1;
  var dorun = false;
  if (hasCrop) {
    //console.log('不參一腳了。');
  }
  else {
    for (const crop of crops) {
      i++;
      if (crop.flag === 0) {
        dorun = true;
        //console.log(`${crop.id}:${crop.name}`);
        createCrop(i, crop.id, crop.name);
        break;
      }
    }
  }
  if (!dorun && crops.length > 0) {
    //console.log('\n' + JSON.stringify(crops).replace(/}/g, '}\n').replace(/","msg/ig, '"\n,"msg'));
    console.log(JSON.stringify(crops).replace(/,/g, ',\n').replace(/}/g, '}\n'));
  }
}

var RunCount = 0;
function getSeedList() {
  RunCount++;
  console.log('\n取得種子列表次數:' + RunCount);
  console.log('取得種子列表時間:' + (new Date()).format('0'));
  $httpClient.get(getSeedListRequest, function (error, response, data) {
    if (error) {
      shopeeNotify(
        '取得種子列表失敗 ‼️',
        '請重新登入'
      );
      $done();
    }
    else {
      if (response.status === 200) {
        try {
          var sDT = response.headers['Date'] || response.headers['date'];
          if ((typeof (sDT) === 'object')) { sDT = sDT.Value; }
          var sDT2 = new Date(sDT);
          console.log('伺服器系統時間  :' + sDT2.format('0'));

          var sDD = (sDT2.getMonth() + 1).toString() + '/' + sDT2.getDate().toString();
          if (nDD != sDD) {
            console.log(nDD + ',' + sDD);
            console.log('系統日期與本機日期不合。');
            if (RunCount < 3) {
              sleep(1.0);
              getSeedList();
            }
            return;
          }
          console.log('');

          const json = JSON.parse(data);
          if (json.msg === 'success') {
            CropData = json.data.cropMetas;
            procCrops();
          } else {
            shopeeNotify(
              '取得種子列表失敗 ‼️',
              json.msg
            );
            $done({});
          }
        } catch (error) {
          shopeeNotify(
            '取得種子列表失敗 ‼️',
            error
          );
          $done({});
        }
      } else {
        shopeeNotify(
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
        $done({});
      }
    }
  });
}

function CropList() {
  if (CropData != null) {
    console.log('\n\n');
    for (var i = 0; i < shopeeCropNameSS.length; i++) {
      for (const crop of CropData) {
        if (crop.name.includes(shopeeCropNameSS[i])) {
          if (crop.config.startTime < new Date().getTime() && crop.config.endTime > new Date().getTime()) {
            if (shopeeCropPrice >= crop.price) {
              console.log(crop.name + ` ${crop.curNum}/${crop.totalNum}`);
            }
          }
        }
      }
    }
  }
}

function CropInfo(data) {
  var crop = data.crop;
  var cropName = crop.meta.name;
  var totalExp = crop.meta.config.totalExp;

  console.log(`\n作物名稱：${cropName}`);
  console.log('\n預估時間 (系統)：' + (parseInt(crop.meta.config.needDays) > 0 ? (crop.meta.config.needDays) + '天' : (totalExp / 100) + '小時'))
  console.log('預估時間 (純澆水)：' + (Math.ceil((totalExp / 16) * 100) / 100).toString() + '時；\t'
    + (Math.ceil((totalExp / 16 / 24) * 100) / 100).toString() + '天。');
  {
    var cct = 0; var h3 = 0; var h2 = 0;
    while (cct < totalExp) {
      if (h2 == 12) { cct += 340; h2 = 0; }
      else { cct += 16; h3++; h2++; } // (60 / 3.6) = 16.66
    }
    var cct2 = 0; var h32 = 0; var h22 = 0;
    while (cct2 < totalExp) {
      if (h22 == 12) { cct2 += 460; h22 = 0; }
      else { cct2 += 16; h32++; h22++; } // (60 / 3.6) = 16.66
    }
    console.log('預估時間 (460/D)：' + h32 + '時；\t\t' + (Math.ceil((h32 / 24) * 10) / 10) + '天。');
    console.log('預估時間 (340/D)：' + h3 + '時；\t\t' + (Math.ceil((h3 / 24) * 10) / 10) + '天。');
  }
  var ct = new Date(crop.createTime);
  var mt = new Date(crop.modifyTime);
  var st = new Date(crop.selfWaterTime);
  {
    var cl = crop.meta.config.levelConfig[`${crop.state}`];
    //console.log(cl);
    console.log(`\n作物第 ${crop.state} 階段，還需要 ${cl.exp - crop.exp}/${cl.exp} 水量。`);
    var cl1 = crop.meta.config.levelConfig['1'];
    var cl2 = crop.meta.config.levelConfig['2'];
    var cl3 = crop.meta.config.levelConfig['3'];
    var cc = 0;
    if (crop.state > 1) { cc += cl1.exp; }
    if (crop.state > 2) { cc += cl2.exp; }
    cc += crop.exp;
    console.log('\n總需水量：' + totalExp);
    console.log('已澆：' + cc);
    console.log('還需：' + (totalExp - cc));
    var needW = totalExp - cc;

    var cct = cc; var h3 = 0; var h2 = 0;
    while (cct < totalExp) {
      if (h2 == 12) { cct += 340; h2 = 0; }
      else { cct += 16; h3++; h2++; }
    }

    // console.log('\n預估還需時間 (純澆水)：' + (Math.ceil((needW / 16) * 100) / 100).toString() + '時；\t'
    //   + (Math.ceil((needW / 16 / 24) * 100) / 100).toString() + '天。');
    console.log('預估還需時間 (340/D)：' + h3 + '時；\t\t' + (Math.ceil((h3 / 24) * 10) / 10) + '天。');
  }


  console.log('\n種植時間：' + ct.format());
  console.log('澆水時間：' + st.format());
  console.log('異動時間：' + mt.format());
}

function createCrop(i, cropId, cropName) {
  createCropRequest.body.metaId = cropId;
  console.log('嘗試種植: ' + cropName + ' (' + cropId + ')');
  console.log('種植時間:' + (new Date()).format('0'));
  $httpClient.post(createCropRequest, function (error, response, data) {
    if (error) {
      shopeeNotify('自動種植失敗 ‼️', '連線錯誤');
      $done({});
    }
    else {
      if (response.status === 200) {
        console.log('');
        try {
          const json = JSON.parse(data);
          if (json.msg === 'success') {
            shopeeNotify('自動種植成功 🌱', '正在種植 ' + cropName);
            crops[i].flag = 1;
            try {
              let CropData = { "s": shopeeCropToken, "resourceId": json.data.resource.id, "cropId": json.data.crop.id };
              shopeeFarmInfo.currentCrop = CropData;
              $persistentStore.write(JSON.stringify(shopeeFarmInfo), 'ShopeeFarmInfo' + _ShopeeUserID);
              // let CropData = { "s": shopeeCropToken, "resourceId": json.data.resource.id, "cropId": json.data.crop.id };
              // $persistentStore.write(JSON.stringify(CropData), 'ShopeeCrop');
              console.log('儲存作物資料。');
              CropInfo(json.data);
              CropList();
              console.log(JSON.stringify(crops).replace(/,/g, ',\n').replace(/}/g, '}\n'));
            } catch (e) {
              console.log(e);
            }

            try {
              let dataName = 'ShopeeGamePlayed';
              let tsn = 'farm' + 's';
              let tsid = 'A1';
              let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
              let tasks = JSON.parse(rs);
              let ts = {}, s = {};
              if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
              if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
              s.c++;
              s.f = true;
              s.r += `\n🌱${cropName} : ${(new Date()).format('3')}`;
              ts[tsid] = s;
              tasks[tsn] = ts;
              $persistentStore.write(JSON.stringify(tasks), dataName);
            } catch (e) { console.log(e); }


            $done({});
          } else if (json.msg === 'crop exist') {
            shopeeNotify(
              '自動種植失敗 ‼️',
              '目前有正在種的作物 ' + json.data.crop.meta.name
            );
            CropList();
            CropInfo(json.data);
            console.log(JSON.stringify(crops).replace(/,/g, ',\n').replace(/}/g, '}\n'));
            $done({});
          } else if (json.msg === 'crop not enough') {
            try {
              shopeeNotify(
                '自動種植失敗 ‼️',
                json.msg
              );
              crops[i].flag = 2;
              crops[i].msg = json.msg;
              procCrops2();
            } catch (e) {
              console.log(e);
            }
          } else if (json.msg === 'crop is waiting') {
            shopeeNotify(
              '自動種植失敗 ‼️',
              '尚未開放種植 ' + cropName,
            );
            crops[i].flag = 3;
            crops[i].msg = json.msg;
            procCrops2();
          } else {
            shopeeNotify(
              '自動種植失敗 ‼️',
              json.msg
            );
            crops[i].flag = 4;
            crops[i].msg = json.msg;
            procCrops2();
          }
        } catch (error) {
          shopeeNotify(
            '自動種植失敗 ‼️',
            error
          );
          $done({});
        }
      } else {
        console.log(data);
        shopeeNotify(
          'Cookie 已過期 ‼️',
          '請重新登入'
        );
        $done({});
      }
    }
  });
}

function sleep(seconds) {
  const waitUntil = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() < waitUntil) true;
}

if (shopeeCropToken.length < 64) {
  shopeeNotify(
    '發生錯誤 ‼️',
    '請先種植任意種子以取得 token'
  )
  $done();
}
else {
  getInfo1();

}
