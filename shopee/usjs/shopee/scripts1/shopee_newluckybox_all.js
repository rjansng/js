let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

let caption = '「寶箱」活動 (各式寶箱遊戲抽1次)';
let title = '自動抽' + caption;
const version = 'v20261111';
let showNotification = true;
let showLog = true;
let config = null;
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
async function delay(seconds) { console.log(`\t\t\t\t\t\t\t\t⏰ 等待 ${seconds} 秒`); return new Promise((resolve) => { setTimeout(() => { resolve(); }, seconds * 1000); }); }
function GetDataConfig(item = -1, method = 'POST', url = '', title = '', content = '') {
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
	return dc;
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
			'Cookie': `${cookieToString(shopeeInfo.tokenAll)};csrftoken=${shopeeInfo.csrfToken}`,
			'Content-Type': 'application/json',
			'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=38528 appver=38528 rnver=1793176691 shopee_rn_bundle_version=7023009 Shopee language=zh-Hant app_type=1 platform=web_ios os_ver=26.5.1',
		}

		config = {
			shopeeInfo: shopeeInfo,
			shopeeHeaders: shopeeHeaders,
		}
		console.log('✅ 檢查成功\n');
		return resolve();
	});
}

async function ProcData01(data, dc) {
	return new Promise((resolve, reject) => {
		// console.log(`⭕️ 執行成功 💯`);
		let found = false;
		let obj = JSON.parse(data);
		if (obj.code == 0) {

			let crop = obj.data.crops[0];
			let cropName = crop.meta.name;
			config.cropName = cropName;
			let rewards = null;
			if ('rewards' in obj.data) { rewards = obj.data.rewards; }
			let msg = '';
			config.cropId = crop.id;
			console.log(`目前作物: ${crop.meta.name}`); // (${config.cropId})

			if (crop.lifeStatus == 1) {
				msg = '作物已死亡。';
			}
			else if (crop.state < 100) {
				config.canWater = true;

				let NeedWater = '種植中';
				found = true;
				let mc = crop.meta.config;
				let totalExp = mc.totalExp;
				let needExp = totalExp;
				for (let i = 1; i <= 3; i++) {
					let mclc = mc.levelConfig[i];
					if (crop.state > i) { needExp -= mclc.exp; }
					else if (crop.state == i) {
						needExp -= crop.exp;
					}
				}
				config.needExp = needExp;
				NeedWater += `，需要水量 ${needExp}`;
				msg = NeedWater;
			}
			else if (crop.state == 100) {
				msg = '作物可以收成了。';
			}
			else if (crop.state >= 101) {
				msg = '作物已收成。';
			}
			console.log(`\n${msg.replace(/\n/g, '')}`);


		} else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		return resolve(found);
	});
}


async function ProcData0(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);
		found = true;
		console.log(obj);
		// if (obj.code === 0) {
		// 	if (obj.msg === 'success') {
		// 		found = true;



		// 	} else {
		// 		reject(['領取失敗 ‼️', obj.msg]);
		// 	}
		// }
		// else {
		// 	return reject([`執行失敗 ‼️`, obj.msg, data]);
		// }
		return resolve(found);
	});
}
async function ProcDataOff(data, dc) {
	return new Promise((resolve, reject) => {
		console.log('OK');
		return resolve(true);
	});
}

async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);
		// console.log(obj);
		let mkt_tasks = null;
		if (obj.code === 0) {
			found = true;
			// console.log(obj.data);
			let ut = obj.data.user_tasks;
			config.task_module_id = obj.data.task_module_id;
			config.ts = [];
			let msg = [];
			if (ut && ut.length > 0) {
				let t = null;
				if (ut.some(tx => {
					if (tx.task_status == 0 && tx.action_type == 2 && tx.task.action_key == 'act_play_lucky_prize_game') {
						t = tx;
						return true;
					}
				})) {
					config.haveTask = true;
					console.log(t);
				}
				console.log(msg.join(''));
			}
			else {
				console.log('現在沒有任務。');
			}
		}
		else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		$persistentStore.write(mkt_tasks, 'shopee_mkt_coins_tasks' + _ShopeeUserID);
		return resolve(found);
	});
}

async function ProcData001(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);
		// console.log(obj);
		let mkt_tasks = null;
		if ('error' in obj && obj.error === 0) {
			found = true;
			// console.log(obj.data);
			if ('layout' in obj && 'component_list' in obj.layout && obj.layout.component_list) {
				let tasks = [];
				obj.layout && obj.layout.component_list.forEach(x => {
					if (x.biz_component_id == 63) { tasks.push(x); }
				});
				let dtnow = Date.now();
				let tasks2 = [];
				tasks.forEach(x => {
					let o = JSON.parse(x.properties.replace('iframe', ''));
					// console.log('\r\n\r\no');
					// console.log(o);
					let tok = { name: '', activityId: '', flag: true };
					o.forEach(x2 => {
						// console.log('\r\n\r\nx2.value');
						// console.log(x2.value);

						if (x2.key == 'general' && 'name' in x2.value && 'schedule' in x2.value) {
							// console.log('\r\n\r\nname');
							// console.log(x2.value.name);
							let ts = x2.value.schedule;
							if (ts.begin < dtnow && dtnow > ts.end || ts.begin == 0 && ts.end == 0) {
								tok.name = x2.value.name;
								// tasks2.push(x);
							}
						}
						if (x2.key == 'data' && 'dangerously_set_inner_html' in x2.value) {
							// console.log('\r\n\r\ndata');
							// console.log(JSON.stringify(x2.value).replace('iframe', ''));
							let ifr = x2.value.dangerously_set_inner_html;
							tok.activityId = ifr.match(/[0-9a-f]{16}/i)[0];
							// console.log('\r\n\r\nactivityId');
							// console.log(tok.activityId);
						}
					});
					if (tok.name != '' && tok.activityId != '') { tasks2.push(tok); }
				});
				if (tasks2.length > 0) {
					tasks2.forEach(x => {
						console.log(`${x.activityId}\t${x.name}`);
					});
					// console.log(tasks2);
					config.tasks = tasks2;
				}
				else {
					console.log('現在沒有指定的任務。');
				}

			}
			else {
				console.log('現在沒有任務。');
			}
		}
		else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		// $persistentStore.write(mkt_tasks, 'shopee_mkt_coins_tasks' + _ShopeeUserID);
		return resolve(found);
	});
}


async function ProcData006(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);
		// found = true;
		// console.log(obj);
		if (obj.code === 0) {
			if (obj.msg === 'success') {
				if ('data' in obj) {
					if (obj.data.total_balance > 0) {
						found = true;
						console.log(`還有 ${obj.data.total_balance} 次`);
					}
					else {
						console.log('已沒有次數了。');
					}
				}
			} else {
				reject(['領取失敗 ‼️', obj.msg]);
			}
		}
		else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		return resolve(found);
	});
}

async function ProcData007(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);
		// found = true;
		// console.log(obj);
		if (obj.code === 0) {
			found = true;
			if ('data' in obj) {
				if ('prize' in obj.data) {
					console.log(obj.data.prize);
				}
				try {
					if ('chance' in obj.data) {
						console.log(`還有 ${obj.data.chance.total_balance} 次`);
						console.log(`分享，可獲得 ${obj.data.chance.max_sharing_one_day} 次`);
					}
				} catch (error) {
					console.log(obj.data.chance);
				}
			}
		}
		else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		return resolve(found);
	});
}

// https://shopee.tw/m/shopeeprizeluckyprize
// https://shopee.tw/api/v4/pagebuilder/get_csr_page?page_url=shopeeprizeluckyprize&platform=4&timestamp=0
let UrlData = [[],
['GET', '取得ℹ️抽蝦幣活動清單', '1', 'https://shopee.tw/api/v4/pagebuilder/get_csr_page?page_url=shopeeprizeluckyprize&platform=4&timestamp=0', '', , ProcData001],
['GET', '取得ℹ️抽蝦幣活動資訊', '2', 'https://idgame.shopee.tw/api/luckydraw/nold/v1/events/{activityId}', '', ['activityId'], ProcDataOff],
['GET', '登入狀態 login-status', '3', 'https://shopee.tw/api/v2/user/login_status', '', , ProcDataOff],
['POST', '登入 luckydraw-iframe app-auth login', '4', 'https://dem.shopee.com/dem/janus/v1/app-auth/login', '', , ProcDataOff],
['POST', '登入 sharing-panel-lib app-auth login', '5', 'https://dem.shopee.com/dem/janus/v1/app-auth/login', '', , ProcDataOff],
['GET', '取得ℹ️抽蝦幣次數', '6', 'https://idgame.shopee.tw/api/luckydraw/nold/v1/events/{activityId}/chance?source=iframe', '', ['activityId'], ProcData006],
['POST', '抽蝦幣', '7', 'https://idgame.shopee.tw/api/luckydraw/nold/v1/events/{activityId}/draw-prize?source=iframe', '', ['activityId'], ProcData007],
];
let DataPostBodyList = [, , , ,
	{
		"app_name": "luckydraw-iframe",
		"sign": "e3d5e8de8ccbf627d8c8a3112ba624d3fa67a9c26e7fcb3dd7513a76228c89c7",
		"timestamp": 1794367873856
	},
	{
		"app_name": "sharing-panel-lib",
		"sign": "d9cde2a03d50ecbc712142c456b2ce8bcefbfa76282764044428544a26765158",
		"timestamp": 1794367873856
	},
	, {}];
function preInit() {
	config.device_id = config.shopeeInfo.tokenAll.SPC_F;
	config.userId = config.shopeeInfo.userId;
	config.activityId = '';
	config.tasks = [];
	config.tasksCount = 0;

	config.shopeeHeaders['x-user-id'] = config.userId;
	config.shopeeHeaders['x-device-platform'] = 'ios';
	config.shopeeHeaders['x-game-mode'] = 'nold_lucky_box';
	config.shopeeHeaders['referer'] = 'https://idgame.shopee.tw/newluckybox/iframe';

	config.dfp = config.shopeeInfo.checkinPayload.dfp;
	if (config.shopeeInfo.RiskTokenRequest) {
		config.dfp = config.shopeeInfo.RiskToken.riskToken;
	}
	if (config.shopeeInfo.RiskToken3Request) {
		config.dfp = config.shopeeInfo.RiskToken3.riskToken;
	}



}
const forMaxCount = 50;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	try {
		await preCheck();
		preInit();

		let flag = true;
		let runCount = 0;
		let item = -1;
		// flag = false;
		for (let i = 1; i < UrlData.length; i++) {
			// console.log(`${i}: ${flag}`);
			if (!flag) { break; }
			item = -1;
			runCount++;
			if (i == 1) {
				// await ProcData001(JSON.stringify(luckys), null);
				// i++;
			}
			if (i == 2) {
				config.activityId = '';
				if (config.tasks.length > 0) {
					let t = null;
					for (let i = 0; i < config.tasks.length; i++) {
						t = config.tasks[i];
						if (t.flag) {
							config.tasksCount++;
							config.tasks[i].flag = false;
							config.activityId = t.activityId;
							console.log(`執行 ${config.tasksCount}:${t.activityId}\t${t.name}`);
							break;
						}
					}
					if (config.tasks.some(x => { if (!x.flag) { t = x; return true; } })) {
					}
				}
				if (config.activityId == '') {
					break;
				}
			}
			if (i == 4) {
				let dtn = Date.now();
				var APP_NAME = DataPostBodyList[i].app_name;
				var SECRET_KEY = "04c7045933529ea7b03214c2fbf6181e0e2bfe8bb11c467c7a2a16ea1ce5093e";
				var sign1 = signX.mdapSign(APP_NAME, SECRET_KEY, dtn);
				DataPostBodyList[i].sign = sign1;
				DataPostBodyList[i].timestamp = dtn;

			}
			if (i == 5) {
				let dtn = Date.now();
				var APP_NAME = DataPostBodyList[i].app_name;
				var SECRET_KEY = "3b3dead59ceb908988b52d056877778289cd8b3f754df7d2d4d434b569c7e86a";
				var sign1 = signX.mdapSign(APP_NAME, SECRET_KEY, dtn);
				DataPostBodyList[i].sign = sign1;
				DataPostBodyList[i].timestamp = dtn;

			}


			let dc = GetDataConfig(i);
			// console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);

			if (i == 6) {
				dc.dataRequest.headers['x-useragenttype'] = '1';
				dc.dataRequest.headers['x-game-version'] = '1011001';
				dc.dataRequest.headers['x-app-version-name'] = '38528';
				dc.dataRequest.headers['x-clienttype'] = '3';
				dc.dataRequest.headers['x-platform'] = '2';
				dc.dataRequest.headers['x-dfp'] = config.dfp;
			}
			if (i == 7) {
				dc.dataRequest.headers['x-useragenttype'] = '1';
				dc.dataRequest.headers['x-game-version'] = '1011001';
				dc.dataRequest.headers['x-app-version-name'] = '38528';
				dc.dataRequest.headers['x-clienttype'] = '3';
				dc.dataRequest.headers['x-platform'] = '2';
				dc.dataRequest.headers['x-dfp'] = config.dfp;
				dc.dataRequest.headers['x-chaplin-timestamp'] = Date.now().toString();
				dc.dataRequest.headers['x-chaplin-appver'] = '0';
				dc.dataRequest.headers['x-chaplin-version'] = '1.0.3';
				dc.dataRequest.headers['accept-language'] = 'zh-TW,zh-Hant;q=0.9';

				let signx = signXChaplin.createChaplinSign(config.userId, { appVersion: 0, data: "{}" });
				// console.log(signx);
				dc.dataRequest.headers['x-chaplin-timestamp'] = signx["x-chaplin-timestamp"]
				dc.dataRequest.headers['x-chaplin-appver'] = signx["x-chaplin-appver"];
				dc.dataRequest.headers['x-chaplin-version'] = signx["x-chaplin-version"];
				dc.dataRequest.headers['x-chaplin-sign'] = signx["x-chaplin-sign"];
				// dc.dataRequest.headers['referer'] = 'https://idgame.shopee.tw/newluckybox/iframe/d36efd26f63b15ce?mode=old_box&source=microsite&component_name=11%E6%9C%88%E8%9D%A6%E7%9A%AE%E7%9B%B4%E7%87%9F%E5%AF%B6%E7%AE%B1&md_component_id=585836474189375&microsite_pageid=45651&section_location=4';
			}

			// if (i == 6) { console.log(dc); }
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}

			if (i == 6) { if (!flag) { flag = true; i = 1; } await delay(3); }
			if (i >= 7) { flag = true; i = 1; await delay(3); }

			if (runCount >= forMaxCount) { console.log(`超過執行限制次數 ${forMaxCount}，中止執行。`); break; }
			if (runCount > 30) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };

			// if (flag && i >= 8) await delay(0.5);
		}
		caption = config.caption;
		title = config.title;
		console.log('');
		let msg = '✅ 處理已完成';
		console.log(msg);
		// loonNotify(msg);
	} catch (error) {
		caption = config.caption;
		title = config.title;
		handleError(error);
	}
	$done({});
})();



// 06_verify_sign_pure.js (v2)
// 純 JavaScript SHA-256 + MDAP sign 驗證
// 零套件：不依賴 require / import / crypto.subtle / TextEncoder
// 任何 JS 引擎都能跑：Node / 瀏覽器 Console / QuickJS / Deno

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



// signXChaplin.js —— 純 JS，零依賴
// 用法：
//   node:  const sign = require('./signXChaplin');
//   browser: <script src="signXChaplin.js"></script> → window.signXChaplin
// signXChaplin.js — 純 JS，零依賴（不用 btoa/atob/Buffer/crypto.subtle）
var signXChaplin = (function () {
	'use strict';

	// ============= UTF-8 編碼 =============
	function utf8Encode(str) {
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
					out.push(0xf0 | (cp >> 18),
						0x80 | ((cp >> 12) & 0x3f),
						0x80 | ((cp >> 6) & 0x3f),
						0x80 | (cp & 0x3f));
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

	// ============= SHA-256 =============
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

	function sha256Bytes(bytes) {
		var H = [
			0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
			0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
		];
		var bitLen = bytes.length * 8;
		var padded = bytes.slice();
		padded.push(0x80);
		while ((padded.length % 64) !== 56) padded.push(0);
		var hi = Math.floor(bitLen / 0x100000000), lo = bitLen >>> 0;
		padded.push(
			(hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff,
			(lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff
		);
		var W = new Array(64);
		for (var off = 0; off < padded.length; off += 64) {
			for (var t = 0; t < 16; t++) {
				var j = off + t * 4;
				W[t] = ((padded[j] << 24) | (padded[j + 1] << 16) |
					(padded[j + 2] << 8) | padded[j + 3]) >>> 0;
			}
			for (t = 16; t < 64; t++) {
				var s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
				var s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
				W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
			}
			var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
			for (t = 0; t < 64; t++) {
				var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
				var ch = (e & f) ^ (~e & g);
				var t1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
				var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
				var maj = (a & b) ^ (a & c) ^ (b & c);
				var t2 = (S0 + maj) >>> 0;
				h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
			}
			H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
			H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
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

	// ============= Base64url（純 JS，不補 padding）=============
	var B64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

	function b64urlFromBytes(bytes) {
		var len = bytes.length, out = "", i = 0, n;
		for (; i + 2 < len; i += 3) {
			n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
			out += B64URL[(n >>> 18) & 0x3f] + B64URL[(n >>> 12) & 0x3f] +
				B64URL[(n >>> 6) & 0x3f] + B64URL[n & 0x3f];
		}
		var rem = len - i;
		if (rem === 1) {
			n = bytes[i] << 16;
			out += B64URL[(n >>> 18) & 0x3f] + B64URL[(n >>> 12) & 0x3f];
		} else if (rem === 2) {
			n = (bytes[i] << 16) | (bytes[i + 1] << 8);
			out += B64URL[(n >>> 18) & 0x3f] + B64URL[(n >>> 12) & 0x3f] +
				B64URL[(n >>> 6) & 0x3f];
		}
		return out;
	}
	function b64urlFromStr(str) { return b64urlFromBytes(utf8Encode(str)); }

	// ============= 分段 =============
	function chunk(s, n) {
		var out = [];
		for (var i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
		return out;
	}

	// ============= 模擬原生 AEGIS_SHA256 回傳值 =============
	// bundle: transformText({ text, method: 5 }) → { result: "<32 chars latin1>" }
	// 反推證明：result = String.fromCharCode(...sha256_bytes(text))
	function sha256AsLatin1(text) {
		var bytes = sha256Bytes(utf8Encode(text));
		var s = '';
		for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
		return s;
	}

	// ============= x-chaplin-sign 主函式 =============
	// 對應 luckydraw.bundle / module 589e455415f78518ee57eab376c25d10 / createSignature
	//
	// 參數：
	//   userId  : 使用者 ID（字串或數字）
	//   options.data        : payload 第 2 段，預設 ""
	//   options.timestamp   : 毫秒 timestamp，預設 Date.now()
	//   options.appVersion  : App 版本號，預設 0（只影響 header 值，不影響算法）
	//   options.segmentSize : 分段大小，預設 1000
	function createChaplinSign(userId, options) {
		options = options || {};
		var data = options.data !== undefined ? options.data : '';
		var timestamp = options.timestamp !== undefined ? options.timestamp : Date.now();
		var appVersion = options.appVersion !== undefined ? options.appVersion : 0;
		var segmentSize = options.segmentSize !== undefined ? options.segmentSize : 1000;

		// 1) payload = b64url(appver).b64url(data).b64url(userId).b64url(timestamp)
		var payload = [
			b64urlFromStr(String(appVersion)),
			b64urlFromStr(String(data)),
			b64urlFromStr(String(userId)),
			b64urlFromStr(String(timestamp))
		].join('.');

		// 2) 每 segmentSize 字元一段，各段 SHA-256 → latin1String
		var chunks = chunk(payload, segmentSize);
		var results = [];
		for (var i = 0; i < chunks.length; i++) {
			results.push(sha256AsLatin1(chunks[i]));
		}

		// 3) y.join('.') → utf8Encode → b64url
		var joined = results.join('.');
		var sign = b64urlFromBytes(utf8Encode(joined));

		return {
			'x-chaplin-sign': sign,
			'x-chaplin-appver': String(appVersion),
			'x-chaplin-timestamp': String(timestamp),
			'x-chaplin-version': '1.0.3'
		};
	}

	return {
		createChaplinSign: createChaplinSign,
		// 供驗算
		b64urlFromStr: b64urlFromStr,
		b64urlFromBytes: b64urlFromBytes,
		sha256Hex: function (s) {
			var d = sha256Bytes(utf8Encode(s)), h = '';
			for (var i = 0; i < d.length; i++) h += ('0' + d[i].toString(16)).slice(-2);
			return h;
		},
		sha256AsLatin1: sha256AsLatin1
	};
})();

if (typeof module !== 'undefined' && module.exports) module.exports = signXChaplin;