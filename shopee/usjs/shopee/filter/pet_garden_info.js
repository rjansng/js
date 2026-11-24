let title = '家園設定';
let caption = '過濾 ' + title;
let version = 'v20231006';
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let SimulateUserID = ($persistentStore.read('偽裝的UserID') || '').trim();
if (SimulateUserID != '' && SimulateUserID == 'NULL') { $persistentStore.write(null, '偽裝的UserID'); SimulateUserID = ''; }
if (SimulateUserID != '') { let SUIDs = SimulateUserID.split(' '); ShopeeUserID = SUIDs[0]; }
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;

let NotGardenSet = $persistentStore.read('免誤按家園設定') || '';
if (NotGardenSet == '是') { NotGardenSet = true; } else { NotGardenSet = false; }

let showNotification = true;
let showLog = true;
function loonNotify(subtitle = '', message = '', url = 'shopeetw://') {
	if (showNotification) {
		$notification.post(title, subtitle, message, { 'openUrl': url });
	}
	if (showLog) { console.log(`${title}\t${subtitle}\t${message}`); }
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
function cookieToString(cookieObject) {
	let string = ''; for (const [key, value] of Object.entries(cookieObject)) {
		if (string != '') { string += '; '; }
		string += `${key}=${value}`;
	} return string;
}
Date.prototype.format = function (format = '1') {
	if (format === '0') { format = 'yyyy/MM/dd HH:mm:ss.S'; }
	else if (format === '1') { format = 'yyyy/MM/dd HH:mm:ss'; }
	else if (format === '2') { format = 'yyyy/MM/dd'; }
	else if (format === '3') { format = 'HH:mm:ss'; }
	else if (format === '4') { format = 'MM/dd'; }
	else if (format === '5') { format = 'HH:mm'; }
	let o = {
		"M+": this.getMonth() + 1, //month 月
		"d+": this.getDate(),    //day 日
		"h+": this.getHours(),   //hour 時
		"H+": this.getHours(),   //hour 時
		"m+": this.getMinutes(), //minute 分 
		"s+": this.getSeconds(), //second 秒
		"q+": parseInt((this.getMonth() + 3) / 3),  //quarter 季
		"S": this.getMilliseconds().toString().padEnd(3, '0') //millisecond  
	}
	let re = new RegExp(/(y+)/);
	if (re.test(format)) { format = format.replace(re, (this.getFullYear() + "").substr(4 - format.match(re)[1].length)); }
	for (let k in o) {
		let r = RegExp("(" + k + ")");
		if (r.test(format)) {
			let fr = format.match(r)[1];
			format = format.replace(fr, fr.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
let DTND = new Date(new Date().format('2')).getTime();
let DT8 = new Date(new Date().format('2') + ' 08:00').getTime();
let DTN = new Date().getTime();


if ($request.method != 'OPTIONS') {
	let flag = true;
	let isChangeHeaders = false;
	let headers = $request.headers;
	let hc = headers['Cookie'] || headers['cookie'];
	let hcc = parseCookie(hc);
	console.log(`userid : ${hcc.userid}`);
	console.log(`SPC_U : ${hcc.SPC_U}`);

	if (hcc.userid != hcc.SPC_U) {
		isChangeHeaders = true;
		let ssc = JSON.parse($persistentStore.read('ShopeeInfo' + _ShopeeUserID) || '{}');
		let sc = '';
		if ('tokenAll' in ssc) {
			['shopee_app_version', 'shopee_rn_bundle_version', 'shopee_rn_version'].forEach(cc => {
				if (cc in hcc && cc in ssc.tokenAll) { ssc.tokenAll[cc] = hcc[cc]; }
			});
			sc = cookieToString(ssc.tokenAll);
		}
		else if ('cookieAll' in ssc) { sc = ssc.cookieAll; }
		else if ('cookieToken' in ssc) { sc = ssc.cookieToken; }
		else { sc = cookieToString(ssc.token); }

        if (!sc.includes('csrftoken')) sc += `; csrftoken=${ssc.csrfToken}`;
        if (!sc.includes('shopee_token')) sc += `; shopee_token=${ssc.shopeeToken}`;
        if (!sc.includes('shopid')) sc += `; shopid=${ssc.shopId}`;
        if (!sc.includes('userid')) sc += `; userid=${ssc.token.SPC_U}`;
        if (!sc.includes('username')) sc += `; username=${ssc.userName}`;

		try {
			for (const [key, value] of Object.entries(headers)) {
				if (!key.match(/(content-.+|accept|accept-.+|host|user-agent)/i)) {
					if (key.match(/cookie/i)) { headers[key] = sc; }
					else if (key.match(/x-user-(id|token)/i)) { headers[key] = ssc.token.SPC_U; }
					else if (key.match(/x-device-(id|fingerprint)/i)) { headers[key] = ssc.token.SPC_F; }
					else if (key.match(/X-(CSRFToken|sign)/i)) { headers[key] = ssc.csrfToken; }
				}
			}

		} catch (error) {
			flag = false;
			console.log('ERROR');
			console.log(error);
			$done({ response: { status: 404, headers: {}, body: "" } });
		}
	}
	if (NotGardenSet) { $done({ response: { status: 404, headers: {}, body: "" } }); }
	else {
		if (isChangeHeaders) { console.log('修改 Headers'); $done({ headers }); }
		else { console.log('未修改 Headers'); $done({}); }
	}
}
else {
	$done({
		response: {
			status: 204,
			headers: {
				'server': 'SGW',
				'date': new Date().toUTCString(),
				'access-control-allow-credentials': 'true',
				'access-control-allow-headers': 'Game-Session-Id, X-Tenant, X-User-Id',
				'access-control-allow-methods': 'POST',
				'access-control-allow-origin': 'https://games.shopee.tw',
				'vary': 'Origin',
				// 'vary': 'Access-Control-Request-Method',
				// 'vary': 'Access-Control-Request-Headers',
				'X-FAKE': 'FAKE'
			}
		}
	});
	$done({});
}