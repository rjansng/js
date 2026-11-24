// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '任務';
const title = '果園分享 ' + caption;
const version = 'v20261112';
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
function getSaveObject(key) { const string = $persistentStore.read(key); return !string || string.length === 0 ? {} : JSON.parse(string); }
function isEmptyObject(obj) { return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false; }
function cookieToString(cookieObject) { let string = ''; for (const [key, value] of Object.entries(cookieObject)) { string += `${key}=${value};` } return string; }
async function delay(seconds) { console.log(`\t\t\t\t\t\t\t⏰ 等待 ${seconds} 秒 💤`); return new Promise((resolve) => { setTimeout(() => { resolve(); }, seconds * 1000); }); }
function GetDataConfig(item = -1, method = 'POST', url = '', title = '', content = '', func = null) {
	if (item === -1) {
		return {
			'item': item, 'method': method, 'url': url, 'title': title, 'content': content, 'memo': ''
			, 'dataRequest': { url: '', headers: config.shopeeHeaders, body: null }, 'func': ud[6],
		};
	}
	let ud = UrlData[item];
	let dc = {
		'item': item, 'method': ud[0], 'title': ud[1], 'content': ud[2], 'url': ud[3], 'memo': '',
		'dataRequest': { url: '', headers: null, body: null }, 'func': ud[6],
	};
	let params = null;
	params = ud[5];
	if (dc.method === 'POST') { dc.dataRequest.body = DataPostBodyList[dc.item]; }
	dc.dataRequest.headers = config.shopeeHeaders;
	if (params && params.length > 0) {
		for (let i = 0; i < params.length; i++) {
			const p = params[i];
			if (p === 'token') {
				dc.url = dc.url.replace(`\{${p}\}`, getToken());
			} else {
				dc.url = dc.url.replace(`\{${p}\}`, config[p]);
			}
		}
	}
	dc.dataRequest.url = dc.url;
	if (func != null && typeof (func) === 'function') { dc = func(dc); }
	return dc;
}
Date.prototype.format = function (format = '1') {
	if (format == '0') { format = 'yyyy/MM/dd HH:mm:ss.S'; }
	else if (format == '1') { format = 'yyyy/MM/dd HH:mm:ss'; }
	else if (format == '2') { format = 'yyyy/MM/dd'; }
	else if (format == '3') { format = 'HH:mm:ss'; }
	else if (format == '4') { format = 'MM/dd'; }
	else if (format == '5') { format = 'HH:mm'; }
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
			RegExp.$1.length == 1 ? o[k] :
				("00" + o[k]).substr(("" + o[k]).length));
	return format;
};

async function dataGet(dc, item = -1) {
	return new Promise((resolve, reject) => {
		try {
			let msg = `\t🌐 ${dc.title} ...`;
			if (item >= 0) { msg += ` (${item})`; }
			console.log(msg);
			$httpClient.get(dc.dataRequest, function (error, response, data) {
				if (error) {
					return reject([`執行失敗 ‼️`, '連線錯誤']);
				} else {
					if (response.status === 200) {
						return resolve(data);
					} else {
						return reject([`執行失敗 ‼️`, response.status, data]);
					}
				}
			});
		} catch (error) {
			return reject([`執行失敗 ‼️`, error]);
		}
	});
}
async function dataPost(dc, item = -1) {
	return new Promise((resolve, reject) => {
		try {
			let msg = `\t🌐 ${dc.title} ...`;
			if (item >= 0) { msg += ` (${item})`; }
			console.log(msg);
			$httpClient.post(dc.dataRequest, function (error, response, data) {
				if (error) {
					return reject([`${content}失敗 ‼️`, '連線錯誤']);
				} else {
					if (response.status === 200) {
						return resolve(data);
					} else {
						return reject([`執行失敗 ‼️`, response.status, data]);
					}
				}
			});

		} catch (error) {
			return reject([`執行失敗 ‼️`, error]);
		}
	});
}
async function preCheck() {
	return new Promise((resolve, reject) => {
		const shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
		if (isEmptyObject(shopeeInfo)) {
			return reject(['檢查失敗 ‼️', '沒有 蝦皮 Token']);
		}
		const shopeeHeaders = {
			'Cookie': `${cookieToString(shopeeInfo.tokenAll)}`,
			'Content-Type': 'application/json',
			// 'User-Agent': shopeeInfo.userAgent,
			'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=38528 appver=38528 rnver=1793176691 shopee_rn_bundle_version=7023009 Shopee language=zh-Hant app_type=1 platform=web_ios os_ver=26.5.1',
			// 'x-csrftoken': shopeeInfo.csrfToken,
			// 'referer': 'https://games.shopee.tw/gameplatform/api/v3/task/'
		}
		config = {
			shopeeInfo: shopeeInfo,
			shopeeHeaders: shopeeHeaders,
		}
		console.log('✅ 檢查成功');
		return resolve();
	});
}


async function ProcData1O(data, dc) {
	return new Promise((resolve, reject) => {
		// console.log(`⭕️ 執行成功 💯`);
		let found = false;
		let obj = JSON.parse(data);
		if (obj.code == 0) {
			let msg = '';
			if ('crops' in obj.data && obj.data.crops && JSON.stringify(obj.data.crops) != '{}' && obj.data.crops.length > 0) {
				let crop = obj.data.crops[0];
				let cropName = crop.meta.name;
				config.cropName = cropName;
				config.cropId = crop.id;
				console.log(`目前作物: ${crop.meta.name}`); // (${config.cropId})

				let mc = crop.meta.config;
				let totalExp = mc.totalExp;
				console.log(totalExp);
				let needExp = totalExp;
				for (let i = 1; i <= 3; i++) {
					let mclc = mc.levelConfig[i];
					if (crop.state > i) { needExp -= mclc.exp; }
					else if (crop.state == i) {
						needExp -= crop.exp;
					}
				}
				config.needExp = needExp;

				console.log(config.needExp);
				if (crop.lifeStatus == 1) {
					// console.log('作物已死亡');
					msg = '作物已死亡。';
				}
				else if (crop.state < 100) {
					console.log('可澆水');
					found = true;
					// found = !obj.data.isChurnedUser;
					// config.canWater = found;
					// if (!found) console.log('已分享');
				}
				else if (crop.state == 100) {
					msg = '作物可以收成了。';
				}
				else if (crop.state >= 101) {
					// console.log('作物已收成');
					msg = '作物已收成。';
				}
			}
			else {
				msg = '目前沒有作物。';
			}
			console.log(`\n${msg.replace(/\n/g, '')}`);
		} else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}

		return resolve(found);
	});
}
async function ProcData5(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code == 0 && 'data' in obj) {
			found = true;
			skey = obj.data.shareKey;
			console.log(`shareKey: ${obj.data.shareKey}`);
		}
		else {
			console.log(obj);
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData6(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code == 0 && 'data' in obj) {
			console.log(`short_url: ${obj.data.short_url}`);
			console.log(`original_url: ${obj.data.original_url}`);
			found = true;
		}
		else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData7(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);
		if (obj.code === 0) {
			if (obj.data.chance > 0) { console.log(`❤️ : ${obj.data.chance}`); }
			if (obj.data.diamond > 0) { console.log(`💎 : ${obj.data.diamond}`); }

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'candycrush' + 's';
				let tsid = 'A';
				let tsidF = 'D';
				let tsidP = 'P';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {}, sF = {}, sP = {};
				if (tsn in tasks) { ts = tasks[tsn]; }
				if (tsid in ts) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				if (tsidF in ts) { sF = ts[tsidF]; } else { sF = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				if (tsidP in ts) { sP = ts[tsidP]; } else { sP = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c++;
				s.f = s.c > 0;
				// s.s = obj.data.diamond;
				s.r = `💎` + new Date().format('5');
				sF.s = obj.data.chance;
				sP.s = obj.data.diamond;

				ts[tsid] = s;
				ts[tsidF] = sF;
				ts[tsidP] = sP;
				tasks[tsn] = ts;
				$persistentStore.write(JSON.stringify(tasks), dataName);
			} catch (e) { console.log(e); }


		}
		else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		return resolve(found);
	});
}

async function ProcDataSpecial(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;

		let obj = JSON.parse(data);
		if (obj.code === 0) {
			if ('data' in obj && 'shareTask' in obj.data
				&& 'taskStatus' in obj.data.shareTask && obj.data.shareTask.taskStatus == 0) {
				console.log('待分享');
				found = true;
			}
			else {
				console.log('已分享');

			}
			// console.log(obj);
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});

}

async function ProcDataSpecialClaim(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;

		let obj = JSON.parse(data);
		if (obj.code === 0) {
			if ('data' in obj && 'awardCount' in obj.data) {
				console.log(`獲得 ${obj.data.awardCount} 水滴`);
			}
			// console.log(obj);
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});

}

async function ProcData0(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;

		let obj = JSON.parse(data);
		if (obj.code === 0) {
			console.log(obj);
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});

}

async function ProcData00(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;
		let obj = JSON.parse(data);
		console.log(obj);
		return resolve(found);
	});

}


let UrlData = [[],
['GET', '01 自己果園狀態', '1', 'https://games.shopee.tw/farm/api/orchard/context/get?skipGuidance=0', '', , ProcData1O],
['!GET', '02 取得ℹ️任務資訊', '2', 'https://games.shopee.tw/farm/api/task/listV2?groceryEntryOn=true&withMicrosite=1&deviceId={deviceId}', '', ['deviceId'], ProcData00],
['GET', '/special/get', '3', 'https://games.shopee.tw/farm/api/task/special/get', '', , ProcDataSpecial],
['GET', '取得分享Key', '4', 'https://games.shopee.tw/farm/api/friend/share_link/get?params=%5Bobject%20Object%5D', '', , ProcData5],
['POST', '取得分享Link', '5', 'https://games.shopee.tw/gameplatform/api/v1/share/genShortUrl?appid=8fUcfB3U9Q49J8iFFg', '', , ProcData6],
['!GET', '/resource/get', '6', 'https://games.shopee.tw/farm/api/orchard/resource/get', '', , ProcData00],
// ['!POST', '04 果園 app-auth login', '5', 'https://dem.shopee.com/dem/janus/v1/app-auth/login', '', , ProcData00],
['POST', '/special/claim', '7', 'https://games.shopee.tw/farm/api/task/special/claim', '', , ProcDataSpecialClaim],
];
let auth = {
	"app_name": "bvgc-lib",
	"sign": "5aa0feb7072b8810fece3ac74e02c407f9eee473f7f3a4e89a2bc30af987b6f7",
	"timestamp": 1794012072080

};
let DataPostBodyList = [, , , , ,
	, ,
	{ "s": "AAAAAAAAAAAAAAAAAAAAAMiOEerinIjTVyW1RWtyojLcQC2xqgFWc5MDq/qWAfMY", "shareSource": "watering_friend_page", "claimWeeklyMsOrderTask": false, "forceClaim": false }, ,
];

function preInit() {

	config.device_id = config.shopeeInfo.tokenAll.SPC_F;
	config.user_id = config.shopeeInfo.userId;
	config.SECRET_KEY = 'a2fd15c1f764e859be1669afbb4e7e0017688fa273773aa846c7734d34411dbd';

}

var skey = '';
var urlShare = 'https://games.shopee.tw/shopeecandy/?skey={skey}';

const forMaxCount = 10;
const showNeedDebug = 10;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	try {
		await preCheck();
		preInit();
		needLastNotify = false;
		let flag = true;
		let runCount = 0;
		let item = -1;
		let payload = '';
		let boundary = '';

		for (let i = 1; i < UrlData.length; i++) {
			if (!flag) { break; }
			runCount++;
			if (i == 1) { console.log(''); }

			let func = null;
			item = -1;

			if (i == 5) {

				let formData = 'https://games.shopee.tw/shareplatform?title=%E8%9D%A6%E7%9A%AE%E6%B6%88%E6%B6%88%E6%A8%82&desc=&universal=0&img=&disableDeepLinkOnFacebook=1&sfrom=ask4water&schannel=copy_link&link=';

				let slink = urlShare.replace('{skey}', skey);
				formData += encodeURIComponent(slink);
				boundary = '------WebKitFormBoundary';
				let content = '';
				content = [
					`\r\n--${boundary}`,
					`\r\nContent-Disposition: form-data; name="real_url";`,
					`\r\n`,
					`\r\n${formData}`,
				].join('');
				payload += content;
				payload += `\r\n--${boundary}--`;

			}

			// if (i == 6) { await delay(8); }

			// 	let dtn = Date.now();
			// 	var APP_NAME = DataPostBodyList[i].app_name;
			// 	var SECRET_KEY = config.SECRET_KEY;
			// 	var sign1 = signX.mdapSign(APP_NAME, SECRET_KEY, dtn);
			// 	DataPostBodyList[i].sign = sign1;
			// 	DataPostBodyList[i].timestamp = dtn;

			// }

			if (i == 7) {
				let tt = Date.now();
				DataPostBodyList[i].s = Aegis.generateS(tt, config.shopeeInfo.userId, 1);
			}
			//

			let dc = GetDataConfig(i, null, null, null, null, func);
			if (i == 5) {
				dc.dataRequest.body = payload;
				dc.dataRequest.headers['Content-Length'] = payload.length;
				dc.dataRequest.headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
			}
			if (i == 6) {
				delete dc.dataRequest.headers['Content-Length'];
				delete dc.dataRequest.headers['Content-Type'];
			}

			if (i === 7) {
				// dc.dataRequest.headers['game-entrance'] = 'normal';
				// dc.dataRequest.headers['games-app-version'] = '38528';
				// dc.dataRequest.headers['game-operation-source'] = 'fruit_farm';
				// dc.dataRequest.headers['fruit-version-type'] = 'h5';
				// dc.dataRequest.headers['games-rn-bundle-version'] = '7023009';
				// dc.dataRequest.headers['games-biz-version'] = '9.7.1';
				// dc.dataRequest.headers['fruit-app-version'] = '38528';
				// dc.dataRequest.headers['games-runtime'] = 'EgretH5';
				// dc.dataRequest.headers['referer'] = 'https://games.shopee.tw/farm/?__dsrn__=1';
				// referer: 
				// af-ac-enc-sz-token: nMTchpkMd0A7SRg/fQNlVQ==|W93FUQ4w93IBekVbrv0p8C4C2e0xsQ4qYOFkGJq3Rivtp2rrX/F/kHM5NQ/KM/rGQzuTTB1DPp7pU+TAMMQ=|fmgjtSBCr05GRnrK|08|3
				// user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=38528 appver=38528 rnver=1793176691 shopee_rn_bundle_version=7023009 Shopee language=zh-Hant app_type=1 platform=web_ios os_ver=15.8.5
			}
			// if (i == 4) {
			// 	dc.dataRequest.headers['User-Agent'] = 'ShopeeTW/3.85.28 (com.beeasy.shopee.tw; build:3.85.28; iOS 26.5.1) language=zh-Hant app_type=1 Cronet/102.0.5005.61';
			// 	delete dc.dataRequest.headers['Cookie']
			// 	delete dc.dataRequest.headers['Content-Length'];
			// 	delete dc.dataRequest.headers['Content-Type'];

			// }
			// console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);
			if (dc === null) { continue; }
			// console.log(dc.dataRequest.headers);
			// console.log(dc.dataRequest.headers.body);
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}

			// if (i == 1 && !flag) { flag = true; config.canWater = true; }
			// if (i == 3 && !flag) { flag = true; }

			if (runCount >= forMaxCount) { break; }
			if (runCount > showNeedDebug) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
		}
		console.log('');
		let msg = '✅ 處理已完成';
		// console.log(msg);
		if (!needLastNotify) { showNotification = needLastNotify; }
		loonNotify(msg);
	} catch (error) {
		handleError(error);
	}
	$done({});
})();


// ============================================================
// Loon 腳本：Shopee Aegis 加解密
// 支援：aegisEncrypt / aegisDecrypt / generateS / generateEncryptFID / generateShakeS
// ============================================================

var Aegis = (function () {
	'use strict';

	// ========== 常量 ==========
	var AES_KEY_HEX = '663d313d397733722f752f2f662b2f2f3559325a4245385a5a45517351507147';
	var ZERO_IV = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var B64CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	// ========== S-Box（硬編碼，避免生成算法誤差） ==========
	var SBOX = [
		99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240,
		173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49,
		21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82,
		59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239,
		170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182,
		218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79,
		220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98,
		145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37,
		46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185,
		134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137,
		13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22
	];

	var INV_SBOX = new Array(256);
	for (var _i = 0; _i < 256; _i++) INV_SBOX[SBOX[_i]] = _i;

	// ========== GF(2^8) 運算 ==========
	function xtime(x) { return ((x << 1) ^ ((x & 0x80) ? 0x1b : 0)) & 0xff; }
	function gmul(a, b) {
		var r = 0;
		for (var i = 0; i < 8; i++) {
			if (b & 1) r ^= a;
			b >>= 1;
			a = xtime(a);
		}
		return r & 0xff;
	}

	// ========== 密鑰擴展（AES-256: Nk=8, Nr=14） ==========
	function expandKey(key) {
		var Nk = key.length / 4;      // 8 for AES-256
		var Nr = Nk + 6;              // 14
		var total = (Nr + 1) * 4;     // 60 words
		var w = new Array(total);
		var RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

		for (var i = 0; i < Nk; i++) {
			w[i] = ((key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3]) >>> 0;
		}
		for (i = Nk; i < total; i++) {
			var t = w[i - 1];
			if (i % Nk === 0) {
				// RotWord + SubWord + Rcon
				t = ((t << 8) | (t >>> 24)) >>> 0;
				t = (((SBOX[(t >>> 24) & 0xff]) << 24) |
					((SBOX[(t >>> 16) & 0xff]) << 16) |
					((SBOX[(t >>> 8) & 0xff]) << 8) |
					(SBOX[t & 0xff])) >>> 0;
				t = (t ^ (RCON[(i / Nk) - 1] << 24)) >>> 0;
			} else if (Nk > 6 && i % Nk === 4) {
				// 只做 SubWord
				t = (((SBOX[(t >>> 24) & 0xff]) << 24) |
					((SBOX[(t >>> 16) & 0xff]) << 16) |
					((SBOX[(t >>> 8) & 0xff]) << 8) |
					(SBOX[t & 0xff])) >>> 0;
			}
			w[i] = (w[i - Nk] ^ t) >>> 0;
		}
		return { w: w, Nr: Nr };
	}

	// 從 word 中取第 k 個 byte
	function wByte(word, k) { return (word >>> (24 - k * 8)) & 0xff; }

	// ========== ShiftRows / InvShiftRows ==========
	function shiftRows(s) {
		var t;
		t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
		t = s[2]; s[2] = s[10]; s[10] = t;
		t = s[6]; s[6] = s[14]; s[14] = t;
		t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
	}
	function invShiftRows(s) {
		var t;
		t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
		t = s[2]; s[2] = s[10]; s[10] = t;
		t = s[6]; s[6] = s[14]; s[14] = t;
		t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
	}

	// ========== 加密單個區塊 ==========
	function encryptBlock(input, keys) {
		var s = input.slice();
		// AddRoundKey (round 0)
		for (var i = 0; i < 16; i++) s[i] ^= wByte(keys.w[i >> 2], i & 3);

		for (var r = 1; r < keys.Nr; r++) {
			for (i = 0; i < 16; i++) s[i] = SBOX[s[i]];
			shiftRows(s);
			// MixColumns
			for (var c = 0; c < 4; c++) {
				var a0 = s[4 * c], a1 = s[4 * c + 1], a2 = s[4 * c + 2], a3 = s[4 * c + 3];
				s[4 * c] = gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;
				s[4 * c + 1] = a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;
				s[4 * c + 2] = a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);
				s[4 * c + 3] = gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
			}
			// AddRoundKey
			for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[r * 4 + (i >> 2)], i & 3);
		}
		// 最後一輪
		for (i = 0; i < 16; i++) s[i] = SBOX[s[i]];
		shiftRows(s);
		for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[keys.Nr * 4 + (i >> 2)], i & 3);
		return s;
	}

	// ========== 解密單個區塊 ==========
	function decryptBlock(input, keys) {
		var s = input.slice();
		for (var i = 0; i < 16; i++) s[i] ^= wByte(keys.w[keys.Nr * 4 + (i >> 2)], i & 3);

		for (var r = keys.Nr - 1; r >= 1; r--) {
			invShiftRows(s);
			for (i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
			for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[r * 4 + (i >> 2)], i & 3);
			// InvMixColumns
			for (var c = 0; c < 4; c++) {
				var a0 = s[4 * c], a1 = s[4 * c + 1], a2 = s[4 * c + 2], a3 = s[4 * c + 3];
				s[4 * c] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
				s[4 * c + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
				s[4 * c + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
				s[4 * c + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
			}
		}
		invShiftRows(s);
		for (i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
		for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[i >> 2], i & 3);
		return s;
	}

	// ========== CBC 模式 ==========
	function cbcEncrypt(plain, key, iv) {
		var keys = expandKey(key);
		var out = [];
		var prev = iv.slice();
		for (var off = 0; off < plain.length; off += 16) {
			var blk = new Array(16);
			for (var i = 0; i < 16; i++) blk[i] = plain[off + i] ^ prev[i];
			prev = encryptBlock(blk, keys);
			for (i = 0; i < 16; i++) out.push(prev[i]);
		}
		return out;
	}

	function cbcDecrypt(cipher, key, iv) {
		var keys = expandKey(key);
		var out = [];
		var prev = iv.slice();
		for (var off = 0; off < cipher.length; off += 16) {
			var blk = cipher.slice(off, off + 16);
			var dec = decryptBlock(blk, keys);
			for (var i = 0; i < 16; i++) out.push(dec[i] ^ prev[i]);
			prev = blk;
		}
		return out;
	}

	// ========== Base64 ==========
	function b64Encode(bytes) {
		var out = '';
		for (var i = 0; i < bytes.length; i += 3) {
			var b0 = bytes[i];
			var b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
			var b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
			out += B64CHARS[b0 >> 2];
			out += B64CHARS[((b0 & 3) << 4) | (b1 >> 4)];
			out += i + 1 < bytes.length ? B64CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
			out += i + 2 < bytes.length ? B64CHARS[b2 & 63] : '=';
		}
		return out;
	}

	function b64Decode(str) {
		var out = [];
		var clean = str.replace(/=+$/, '').replace(/[\r\n\s]/g, '');
		var buf = 0, bits = 0;
		for (var i = 0; i < clean.length; i++) {
			var v = B64CHARS.indexOf(clean[i]);
			if (v < 0) continue;
			buf = (buf << 6) | v;
			bits += 6;
			if (bits >= 8) {
				bits -= 8;
				out.push((buf >> bits) & 0xff);
			}
		}
		return out;
	}

	// ========== UTF-8 ==========
	function utf8Encode(str) {
		var out = [];
		for (var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			if (c < 0x80) out.push(c);
			else if (c < 0x800) {
				out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
			} else if (c < 0xd800 || c >= 0xe000) {
				out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
			} else {
				i++;
				var c2 = str.charCodeAt(i);
				var cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
				out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f),
					0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
			}
		}
		return out;
	}

	function utf8Decode(bytes) {
		var out = '', i = 0;
		while (i < bytes.length) {
			var b = bytes[i++];
			if (b < 0x80) out += String.fromCharCode(b);
			else if (b < 0xe0) out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
			else if (b < 0xf0) out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
			else {
				var cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
				cp -= 0x10000;
				out += String.fromCharCode(0xd800 | (cp >> 10), 0xdc00 | (cp & 0x3ff));
			}
		}
		return out;
	}

	function hexToBytes(hex) {
		var out = [];
		for (var i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
		return out;
	}

	// ========== PKCS7 Padding ==========
	function pkcs7Pad(bytes) {
		var pad = 16 - (bytes.length % 16);
		for (var i = 0; i < pad; i++) bytes.push(pad);
		return bytes;
	}
	function pkcs7Unpad(bytes) {
		if (bytes.length === 0) return bytes;
		var pad = bytes[bytes.length - 1];
		if (pad < 1 || pad > 16) return bytes;
		return bytes.slice(0, bytes.length - pad);
	}

	// ========== Aegis 核心 ==========
	var AES_KEY = hexToBytes(AES_KEY_HEX);

	function aegisEncrypt(plain) {
		var pt = utf8Encode(plain);
		pkcs7Pad(pt);
		var ct = cbcEncrypt(pt, AES_KEY, ZERO_IV);
		return b64Encode(ZERO_IV.concat(ct));
	}

	function aegisDecrypt(cipherBase64) {
		var buf = b64Decode(cipherBase64);
		if (buf.length < 32 || (buf.length - 16) % 16 !== 0) {
			throw new Error('密文長度不符：' + buf.length);
		}
		var iv = buf.slice(0, 16);
		var ct = buf.slice(16);
		var pt = cbcDecrypt(ct, AES_KEY, iv);
		pt = pkcs7Unpad(pt);
		return utf8Decode(pt);
	}

	// ========== 業務封裝 ==========
	function generateS(nowTimestampMs, uid, k) {
		if (k === undefined || k === null) k = 1;
		let aaa = k + '-0-1-' + nowTimestampMs + '-' + uid + '-0';
		console.log(aaa);
		return aegisEncrypt(aaa);
	}

	function generateEncryptFID(friendId, nowTimestampMs) {
		return aegisEncrypt(friendId + '-' + nowTimestampMs);
	}

	function generateShakeS(shakeTimes, token, timestampSec, friendId) {
		var payload = '{"shakeTimes":' + shakeTimes +
			',"token":"' + token +
			'","timestamp":' + timestampSec +
			',"friendId":' + Number(friendId) + '}';
		return '1' + aegisEncrypt(payload) + token + '12';
	}

	// ========== 導出 ==========
	return {
		aegisEncrypt: aegisEncrypt,
		aegisDecrypt: aegisDecrypt,
		generateS: generateS,
		generateEncryptFID: generateEncryptFID,
		generateShakeS: generateShakeS
	};
})();


var signX = (function () {
	"use strict";

	// ══════════════════════════════════════════════════════════
	// 1) 純 JS SHA-256 實作
	// ══════════════════════════════════════════════════════════

	var K = [
		0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
		0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
		0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
		0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
		0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
		0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
		0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
		0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
		0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
		0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
		0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
		0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
		0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
		0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	];

	function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

	function utf8Bytes(str) {
		var out = [];
		for (var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			if (c < 0x80) {
				out.push(c);
			} else if (c < 0x800) {
				out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
			} else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
				var c2 = str.charCodeAt(i + 1);
				if (c2 >= 0xdc00 && c2 <= 0xdfff) {
					var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
					out.push(
						0xf0 | (cp >> 18),
						0x80 | ((cp >> 12) & 0x3f),
						0x80 | ((cp >> 6) & 0x3f),
						0x80 | (cp & 0x3f)
					);
					i++;
					continue;
				}
				out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
			} else {
				out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
			}
		}
		return out;
	}

	function sha256Bytes(bytes) {
		var H = [
			0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
			0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
		];

		var msgLen = bytes.length;
		var bitLen = msgLen * 8;
		var padded = bytes.slice();
		padded.push(0x80);
		while ((padded.length % 64) !== 56) padded.push(0);

		var hiLen = Math.floor(bitLen / 0x100000000);
		var loLen = bitLen >>> 0;
		padded.push(
			(hiLen >>> 24) & 0xff, (hiLen >>> 16) & 0xff,
			(hiLen >>> 8) & 0xff, hiLen & 0xff,
			(loLen >>> 24) & 0xff, (loLen >>> 16) & 0xff,
			(loLen >>> 8) & 0xff, loLen & 0xff
		);

		var W = new Array(64);
		for (var off = 0; off < padded.length; off += 64) {
			for (var t = 0; t < 16; t++) {
				var j = off + t * 4;
				W[t] = (
					(padded[j] << 24) |
					(padded[j + 1] << 16) |
					(padded[j + 2] << 8) |
					padded[j + 3]
				) >>> 0;
			}
			for (t = 16; t < 64; t++) {
				var s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
				var s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
				W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
			}
			var a = H[0], b = H[1], c = H[2], d = H[3];
			var e = H[4], f = H[5], g = H[6], h = H[7];
			for (t = 0; t < 64; t++) {
				var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
				var ch = (e & f) ^ (~e & g);
				var t1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
				var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
				var maj = (a & b) ^ (a & c) ^ (b & c);
				var t2 = (S0 + maj) >>> 0;
				h = g; g = f; f = e; e = (d + t1) >>> 0;
				d = c; c = b; b = a; a = (t1 + t2) >>> 0;
			}
			H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
			H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
			H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
			H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
		}

		var out = new Array(32);
		for (var i = 0; i < 8; i++) {
			out[i * 4] = (H[i] >>> 24) & 0xff;
			out[i * 4 + 1] = (H[i] >>> 16) & 0xff;
			out[i * 4 + 2] = (H[i] >>> 8) & 0xff;
			out[i * 4 + 3] = H[i] & 0xff;
		}
		return out;
	}

	function bytesToHex(bytes) {
		var hex = "0123456789abcdef";
		var s = "";
		for (var i = 0; i < bytes.length; i++) {
			s += hex[(bytes[i] >>> 4) & 0xf] + hex[bytes[i] & 0xf];
		}
		return s;
	}

	function sha256Hex(str) {
		return bytesToHex(sha256Bytes(utf8Bytes(str)));
	}

	// ══════════════════════════════════════════════════════════
	// 2) MDAP sign
	//    sign = SHA256(app_name + secret_key + timestamp).hex()
	// ══════════════════════════════════════════════════════════

	function mdapSign(appName, secretKey, timestamp) {
		return sha256Hex("" + appName + secretKey + timestamp);
	}

	// ══════════════════════════════════════════════════════════
	// 4) 主流程
	// ══════════════════════════════════════════════════════════
	return {
		mdapSign: mdapSign,
	};

})();
