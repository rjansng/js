let title = 'get_buyer_order_info';
let caption = '取得 ' + title;
let version = 'v20240418';

let ShopeeUserID = '';
let SimulateUserID = ($persistentStore.read('偽裝的UserID') || '').trim();
if (SimulateUserID != '' && SimulateUserID == 'NULL') { $persistentStore.write(null, '偽裝的UserID'); SimulateUserID = ''; }
if (SimulateUserID != '') { let SUIDs = SimulateUserID.split(' '); ShopeeUserID = SUIDs[0]; }
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log('ShopeeUserID:' + ShopeeUserID); }

function getSaveObject(key) {
	const string = $persistentStore.read(key);
	return !string || string.length === 0 ? {} : JSON.parse(string);
}
function isEmptyObject(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false;
}
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

if ($request.method === 'GET') {

	let headers = $request.headers;
	//	console.log(headers);
	let hc = headers['Cookie'] || headers['cookie'];
	let hcc = parseCookie(hc);
	console.log(`userid : ${hcc.userid}`);
	console.log(`SPC_U : ${hcc.SPC_U}`);
	let s_fake_srcid = headers['s-fake-srcid'] || '';
	console.log(`s-fake-srcid : ${s_fake_srcid}\n`);

	let body = $response.body;
	let shopee_order_info = null;
	try {
		let obj = JSON.parse(body);
		if (obj.error == 0) {
			if (obj.hasOwnProperty('data')) {
				$persistentStore.write(body, 'ShopeeOrderInfo' + ShopeeUserID);
			}
		}
		$done({});
	} catch (error) {
		console.log('ERROR');
		console.log(error);
		$persistentStore.write(shopee_order_info, 'ShopeeOrderInfo' + ShopeeUserID);
		$done({});
	}
}
else {
	console.log('NOT GET');
	$done({});
}