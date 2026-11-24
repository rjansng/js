// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '🎮遊戲玩過';
const title = '方塊爆爆 自動' + caption;
const version = 'v20261106';
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
async function delay(seconds) { console.log(`\t\t\t\t\t\t\t⏰ 等待 ${seconds} 秒`); return new Promise((resolve) => { setTimeout(() => { resolve(); }, seconds * 1000); }); }
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
	}; //, alpn: ["http/1.1"] 
	let params = null;
	params = ud[5];
	if (dc.method === 'POST' || dc.method === '!POST') { dc.dataRequest.body = DataPostBodyList[dc.item]; }
	dc.dataRequest.headers = config.shopeeHeaders;
	if (params && params.length > 0) {
		for (let i = 0; i < params.length; i++) {
			const p = params[i];
			dc.url = dc.url.replace(`\{${p}\}`, config[p]);
		}
	}
	dc.dataRequest.url = dc.url;
	if (func != null && typeof (func) === 'function') { dc = func(dc); }
	return dc;
}
Date.prototype.format = function (format) {
	if (!(format)) format = 'yyyy/MM/dd';
	var o = {
		"M+": this.getMonth() + 1, //month  
		"d+": this.getDate(),    //day  
		"h+": this.getHours(),   //hour  
		"H+": this.getHours(),   //hour  
		"m+": this.getMinutes(), //minute  
		"s+": this.getSeconds(), //second  
		"q+": parseInt((this.getMonth() + 3) / 3),  //quarter  
		"S": this.getMilliseconds() //millisecond  
	}
	if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o) if (new RegExp("(" + k + ")").test(format))
		format = format.replace(RegExp.$1,
			RegExp.$1.length === 1 ? o[k] :
				("00" + o[k]).substr(("" + o[k]).length));
	return format;
};
function generateUpperGUID() {
	var d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now(); // 增加微秒以提高唯一性
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	}).toUpperCase();
}
function generateRandomHexStr(length = 32) {
	const chars = '0123456789ABCDEF';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[Math.floor(Math.random() * 16)];
	}
	return result;
}

/**
 * 生成 Shopee WebView 的 X-User-SID
 * @returns {string} 16 位十六進制字符串，例如 "A3F9C2D1E5B7048C"
 */
function generateXUserSID() {
	const charset = "0123456789ABCDEF";
	let sid = "";
	for (let i = 0; i < 16; i++) {
		sid += charset[Math.floor(Math.random() * 16)];
	}
	return sid;
}

// 示例
// console.log(generateXUserSID()); // 輸出類似: "A3F9C2D1E5B7048C"

async function dataGet(dc, item = -1) {
	return new Promise((resolve, reject) => {
		try {
			let msg = `🌐 ${dc.title} ...`;
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
			let msg = `🌐 ${dc.title} ...`;
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
			'cookie': `${cookieToString(shopeeInfo.tokenAll)};`,
			// 'cookie': `_sapid=5ba376613ab1e00b5efeba63f0b65799e4163d42de4276b5c86377e0; SPC_R_T_ID=tO537E0/xZsqG9h6rm3iH/i4ySWDvvmY5uUU4NBpa3IjSw8x1IB50HeYbHMXc/qieLNXjm1dHO8unh34786cV+iJ6hfdFKHm9c9qFRaTlziCVMN98jLVADRaLTVJX1lIWZz9htDMWsPwXIHQdk6OecsRb5OZUk/ecFETES/Fdcc=; SPC_R_T_IV=am95NWJzZjZLYWRXendzRg==; SPC_SI=sAD7agAAAABEWU1hdEl1VKRfdwAAAAAAUFgwV0xxMXE=; SPC_T_ID=tO537E0/xZsqG9h6rm3iH/i4ySWDvvmY5uUU4NBpa3IjSw8x1IB50HeYbHMXc/qieLNXjm1dHO8unh34786cV+iJ6hfdFKHm9c9qFRaTlziCVMN98jLVADRaLTVJX1lIWZz9htDMWsPwXIHQdk6OecsRb5OZUk/ecFETES/Fdcc=; SPC_T_IV=am95NWJzZjZLYWRXendzRg==; SPC_B_SI=VwffagAAAAB5cTdUOUlZOGRzvQMAAAAAR01oVllKdHo=; SPC_AFTID=LAT; SPC_CLIENTID=RDBFMkEwNkFDRDRDhmvwzmxulxnqvkup; SPC_ST=Fa8H2vzngxRl7POiJZ2m/lpXKTs2ALjuhYkHws7xtUDwAS+CF5gOQnwc/czoohYauR+Q3gjxbU70PULiZfrEcM+M2zpmE05VH1BsLpr3IVgB103OisTFfhi4GNeYa+9l1AiT5tSIoBRR4PdwoOvXHktMxQUWMX8HKOQCzg/Uvr8S5lpz45DRpsr+DfXeGo/VGTXc4Swmd49NLity8GyXJw==.AMyKkDOXSyllMUU6m4xRe71XofbcF49K6fZZEMZLX2Mm; SPC_U=918908158; shopee_token=ELTH1hTRFmUnob8a7oFIOJZ4SefWP4EF+ioLRTOQWyyryO7TG9Cn03E6z3N/R9FGA0klFSzs2lhc8VQ=; shopid=918832582; userid=918908158; username=jieguan285; SPC_RNBV=7024014;shopee_app_version=38628;shopee_rn_bundle_version=7024014;shopee_rn_version=1794553594; sense_sa_r=s; SPC_F=D0E2A06ACD4C4437A7A87CBBBBF86AB8; csrftoken=1f4azFyoqhXOynq8Uw6PIUD80vRTW8Qr; SPC_DH=EBjko51UPqEoogh19CkZfs66z81Ao1CsgdPgI8Y84oSB7mAS8P751gV3QEaBVlyXViWWEL9LfHes.1lg8n8s.171da065; SPC_F=D0E2A06ACD4C4437A7A87CBBBBF86AB8; REC_T_ID=f597ff88-d69a-11f1-939c-9e22d6f5a661`,
			'content-type': 'application/json',
			'referer': 'https://games.shopee.tw/blockgame/?activity=01752ac5bd76f981&__special_w__=1&__special_w_bgcolor__=54CD7D',
			// 'X-Build-Version': 'heads-blockblast-fe-GAMES-BB-1-8-0-1-',
			// 'User-Agent': shopeeInfo.userAgent,
			'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=38527 appver=38527 rnver=1792999751 shopee_rn_bundle_version=7023002 Shopee language=zh-Hant app_type=1 platform=web_ios os_ver=15.8.5', //shopeeInfo.userAgent,
			'x-user-sid': generateXUserSID(),
			'x-runtime': 'app=38527;biz=unknown;gr=H5;os=IOS',
			'x-device-id': shopeeInfo.tokenAll.SPC_F,
		}
		config = {
			shopeeInfo: shopeeInfo,
			shopeeHeaders: shopeeHeaders,
		}
		console.log('✅ 檢查成功');
		return resolve();
	});
}


async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			if (obj.data.curr_basic) {
				let bflag = false;
				if (obj.data.curr_basic.slots && obj.data.curr_basic.slots.length > 0) {
					if ('slot_code' in obj.data.curr_basic.slots[0]) {
						config.slot_code = obj.data.curr_basic.slots[0].slot_code;
						bflag = true;
					}

				}
				delete obj.data.curr_basic.slots;
				console.log(obj.data.curr_basic);
				let dtn = parseInt(Date.now() / 1000);
				if (obj.data.curr_basic.start_time > 0 && obj.data.curr_basic.start_time > dtn) { console.log('本次遊戲未開始。'); }
				else if (obj.data.curr_basic.end_time > 0 && obj.data.curr_basic.end_time >= dtn) { found = bflag; }
				else {
					console.log('遊戲已結束。');
				}
			}
			else {

			}
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
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			console.log(obj.data);
			found = true;
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});
}

async function ProcData2(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			found = true;
			try {
				delete obj.data.data.antiCheatConfig;
				delete obj.data.data.gwSignConfig;
				delete obj.data.data.tssSAPConfig;

			} catch (error) {

			}
			console.log(obj.data.data);
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});
}

async function ProcData3(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			found = true;
			console.log(obj.data.data);
			config.adventureOldUser = obj.data.data.adventureOldUser;
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});
}
async function ProcData4(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			found = true;
			delete obj.data.milestoneList[0].prizeList;
			delete obj.data.milestoneList[0].lockIcon;
			delete obj.data.milestoneList[0].unlockIcon;
			delete obj.data.milestoneList[0].claimIcon;
			delete obj.data.milestoneList[0].landingPageIcon;
			delete obj.data.milestoneList[0].newIcon;
			console.log(obj.data);
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});
}
async function ProcData5(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			found = true;
			delete obj.data.groupData;
			delete obj.data.bigPrizeList;
			console.log(obj.data);
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});
}

async function ProcData6(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			// console.log(obj);
			config.sessionID = obj.data.sessionID;
			// delete obj.data.bigPrizeList;
			// delete obj.data.itemList;
			// delete obj.data.ddl;
			// delete obj.data.groupData;
			// delete obj.data.wellModeRate;
			// delete obj.data.scoreList;
			// delete obj.data.wellModeList;
			console.log(config.sessionID);
			found = true;
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});
}

async function ProcData7(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);

		if (obj.code === 0) {
			if ('milestoneList' in obj.data && 'prizeList' in obj.data.milestoneList) { delete obj.data.milestoneList.prizeList; }
			// console.log(obj.data);
			console.log('完成');
			found = true;
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
		let found = false;
		let obj = JSON.parse(data);
		if (obj.code === 0) {
			console.log(obj);
			found = true;
		}
		else {
			console.log('❌ 失敗！\n' + obj.msg);
			console.log(data);
		}

		return resolve(found);
	});
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

let UrlData = [[],
['GET', '01 取得方塊爆爆資訊1', '1', 'https://games.shopee.tw/gameplatform/api/v5/game/activity/01752ac5bd76f981/settings?appid=TU3AplVyJPp2Z5KFeS&prefetch=1', '', , ProcData1],
['POST', '02 取得方塊爆爆 cc setting', '1', 'https://games.shopee.tw/api-gateway/blockgame/web/get_cc_setting?prefetch=1&activityCode=01752ac5bd76f981', '', , ProcData2],
['POST', '03 取得方塊爆爆 user setting', '1', 'https://games.shopee.tw/api-gateway/blockgame/web/get_user_setting?prefetch=1&activityCode=01752ac5bd76f981', '', , ProcData3],
['!!POST', '04 取得方塊爆爆 g loading page', '1', 'https://games.shopee.tw/api-gateway/blockgame/game/landing_page?prefetch=1&activityCode=01752ac5bd76f981', '', , ProcData4],
['!!POST', '05 取得方塊爆爆 a loading page', '1', 'https://games.shopee.tw/api-gateway/blockgame/adventure/landing_page?activityCode=01752ac5bd76f981', '', , ProcData5],
['POST', '06 開始方塊爆爆', '2', 'https://games.shopee.tw/api-gateway/blockgame/game/begin?activityCode=01752ac5bd76f981', '', , ProcData6],
['POST', '07 完成方塊爆爆', '3', 'https://games.shopee.tw/api-gateway/blockgame/game/finish?activityCode=01752ac5bd76f981', '', , ProcData7],
	// ['POST', '06 開始方塊爆爆', '2', 'https://games.shopee.tw/api-gateway/blockgame/adventure/begin?activityCode=01752ac5bd76f981', '', , ProcData6],
	// ['!POST', '07 完成方塊爆爆', '3', 'https://games.shopee.tw/gw-api/blockgame/adventure/finish?activityCode=01752ac5bd76f981', '', , ProcData7],
];

let DataPostBodyList = [, , {}, {}, {}, {},
	{ "force": false, "bssDFP": "" },
	{
		"sessionID": "f2BJD2FQ79S2yFmA",
		"score": 0,
		"coreVersion": "1.4.0",
		"replayData": "{¨boardCol¨Ñ¨boardRow¨Ñ¨randomSeed¨¨AAAAAAAAAA.1234567890123¨¨operationData¨|¦´p´´r´´t´‡|ß3÷µÑ|÷|ÉþþþË¢36¢24¢12÷Ï|Ë÷|¦´b´´g´‡¤fµ¤Tµ—{´b´¤f}÷Ì—÷}",
		"trace": {
			"maxCombo": 0,
			"playTime": 3829,
			"usedBlocks": 0,
			"newUser": false,
			"loseDD": 1,
			"manualQuit": true,
			"tilesFilled": 5,
			"totalCombo": 0
		},
		"bssDFP": ""
	}
];

function preInit() {
	// config.hasTask = false;
	config.sessionID = '';
	config.roundCount = 0;
	config.adventureOldUser = '0';
	config.dfp = config.shopeeInfo.checkinPayload.dfp;
	if (config.shopeeInfo.RiskTokenRequest) {
		// config.dfp = config.shopeeInfo.RiskTokenRequest;
		config.dfp = config.shopeeInfo.RiskToken.riskToken;
	}
	DataPostBodyList[6].bssDFP = config.dfp;
	DataPostBodyList[7].bssDFP = config.dfp;
	config.x_gw_t = '';
	config.x_gw_sign = '';

}

const forMaxCount = 10;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	try {
		await preCheck();
		preInit();
		needLastNotify = false;
		let flag = true;
		let runCount = 0;
		let item = -1;
		for (let i = 1; i < UrlData.length; i++) {
			if (!flag) { break; }
			// console.log(i);
			runCount++;
			let func = null;
			item = -1;
			if (i === 6) {
				// DataPostBodyList[i].newPlayer = config.adventureOldUser == '0';
				console.log('\n\n');
				// DataPostBodyList[i] = JSON.stringify(DataPostBodyList[i]);
				DataPostBodyList[i].force = true;
				const tmp = DataPostBodyList[i];
				// tmp.bssDFP = '';
				console.log(tmp);
				// i++;
			}
			if (i === 7) {
				// console.log(i);
				let wait_time = getRandomInt(5000, 10000);
				await delay((wait_time * 1.0) / 1000);
				let dtn = Date.now();
				let dtns = dtn.toString();
				config.x_gw_t = dtns;
				let uu = config.shopeeInfo.userId + '.' + dtns;
				DataPostBodyList[i].sessionID = config.sessionID;
				DataPostBodyList[i].replayData = DataPostBodyList[i].replayData.replace('AAAAAAAAAA.1234567890123', uu);
				DataPostBodyList[i].trace.newUser = config.adventureOldUser == '0';
				DataPostBodyList[i].trace.playTime = wait_time;
				console.log('\n\n');

				// const tmp = DataPostBodyList[i];
				// tmp.bssDFP = '';
				// console.log(tmp);
				let tmp2 = JSON.stringify(DataPostBodyList[i]).replace(/[\r\n\s]/g, '');
				DataPostBodyList[i] = tmp2;
				console.log(tmp2);

				const s = new GwSigner();
				const hash = s.sign({
					body: tmp2,
					userId: config.shopeeInfo.userId,
					timestamp: dtns,
					format: "hex",
				});

				config.hash = hash;
				config.x_gw_sign = Aegis.aegisEncrypt(hash);
				console.log('\n\n');
				console.log(config.hash);
				console.log(config.x_gw_t);
				console.log(config.x_gw_sign);

				// config.roundCount = 0;
				// break;
			}

			let dc = flag ? GetDataConfig(i, null, null, null, null, func) : null;

			if (i == 6) {
				// dc.dataRequest.headers['x-build-version'] = 'heads-blockblast-fe-GAMES-BB-1-9-20261105-1-emergency-';
				// dc.dataRequest.headers['content-length'] = dc.dataRequest.body.length.toString();
				// console.log('\n\n');
				// console.log(dc);
			}
			if (i == 7) {
				if (config.x_gw_sign != '') dc.dataRequest.headers['X-GW-SIGN'] = config.x_gw_sign;
				if (config.x_gw_t != '') dc.dataRequest.headers['X-GW-T'] = config.x_gw_t;
				dc.dataRequest.headers['x-build-version'] = 'heads-blockblast-fe-GAMES-BB-1-9-20261105-1-emergency-';
				// console.log('\n\n');
				// console.log(dc);
				// break;
			}
			// console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}

			if (runCount >= forMaxCount) { break; }
			if (runCount > 10) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
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
		return aegisEncrypt(k + '-0-1-' + nowTimestampMs + '-' + uid + '-0');
	}

	function generateEncryptFID(friendId, nowTimestampMs) {
		return aegisEncrypt(friendId + '-' + nowTimestampMs);
	}

	function generateShakeS(shakeTimes, token, timestampSec, friendId) {
		var payload = '{"shakeTimes":' + shakeTimes +
			',"token":"' + token +
			'","timestamp":' + timestampSec +
			',"friendId":' + Number(friendId) + '}';
		return aegisEncrypt(payload) + '1' + token + '12';
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

/*!
 * GwSigner v1.0.1
 * Shopee x-gw-sign 純 JavaScript 實現（零依賴）
 * 修正：內部 _rotr 呼叫筆誤（v1.0.0 → v1.0.1）
 */
(function (global) {
	'use strict';

	// ============================================================
	// UTF-8 編碼
	// ============================================================
	function _utf8Encode(str) {
		const bytes = [];
		for (let i = 0; i < str.length; i++) {
			const c = str.charCodeAt(i);
			if (c < 0x80) {
				bytes.push(c);
			} else if (c < 0x800) {
				bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
			} else if (c >= 0xD800 && c <= 0xDBFF) {
				const hi = c, lo = str.charCodeAt(++i);
				const cp = 0x10000 + ((hi - 0xD800) << 10) + (lo - 0xDC00);
				bytes.push(0xF0 | (cp >> 18),
					0x80 | ((cp >> 12) & 0x3F),
					0x80 | ((cp >> 6) & 0x3F),
					0x80 | (cp & 0x3F));
			} else {
				bytes.push(0xE0 | (c >> 12),
					0x80 | ((c >> 6) & 0x3F),
					0x80 | (c & 0x3F));
			}
		}
		return bytes;
	}

	// ============================================================
	// Base64 編碼
	// ============================================================
	const _B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	function _bytesToBase64(bytes) {
		let out = "";
		const len = bytes.length;
		for (let i = 0; i < len; i += 3) {
			const b0 = bytes[i];
			const b1 = (i + 1 < len) ? bytes[i + 1] : 0;
			const b2 = (i + 2 < len) ? bytes[i + 2] : 0;
			out += _B64[b0 >> 2];
			out += _B64[((b0 & 0x03) << 4) | (b1 >> 4)];
			out += (i + 1 < len) ? _B64[((b1 & 0x0F) << 2) | (b2 >> 6)] : "=";
			out += (i + 2 < len) ? _B64[b2 & 0x3F] : "=";
		}
		return out;
	}

	function _hexToBytes(hex) {
		const out = [];
		for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
		return out;
	}

	// ============================================================
	// SHA-256 常數表
	// ============================================================
	const _K = [
		0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
		0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
		0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
		0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
		0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
		0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	];

	const _H_INIT = [
		0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
		0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
	];

	// ============================================================
	// SHA-256 右旋（⚠ v1.0.1 修正：所有呼叫都改為 _rotr）
	// ============================================================
	function _rotr(x, n) {
		return (x >>> n) | (x << (32 - n));
	}

	function _sha256Bytes(bytes) {
		const H = _H_INIT.slice();
		const msgLen = bytes.length;
		const bitLenHi = Math.floor(msgLen / 0x20000000);
		const bitLenLo = (msgLen << 3) >>> 0;

		// Padding
		const paddedLen = ((msgLen + 9 + 63) >> 6) << 6;
		const padded = new Uint8Array(paddedLen);
		padded.set(bytes);
		padded[msgLen] = 0x80;
		padded[paddedLen - 8] = (bitLenHi >>> 24) & 0xFF;
		padded[paddedLen - 7] = (bitLenHi >>> 16) & 0xFF;
		padded[paddedLen - 6] = (bitLenHi >>> 8) & 0xFF;
		padded[paddedLen - 5] = bitLenHi & 0xFF;
		padded[paddedLen - 4] = (bitLenLo >>> 24) & 0xFF;
		padded[paddedLen - 3] = (bitLenLo >>> 16) & 0xFF;
		padded[paddedLen - 2] = (bitLenLo >>> 8) & 0xFF;
		padded[paddedLen - 1] = bitLenLo & 0xFF;

		const W = new Uint32Array(64);

		for (let off = 0; off < paddedLen; off += 64) {
			// 前 16 words
			for (let j = 0; j < 16; j++) {
				const k = off + j * 4;
				W[j] = ((padded[k] << 24) | (padded[k + 1] << 16) |
					(padded[k + 2] << 8) | padded[k + 3]) >>> 0;
			}
			// 擴展到 64 words
			for (let j = 16; j < 64; j++) {
				const w15 = W[j - 15], w2 = W[j - 2];
				const s0 = (_rotr(w15, 7) ^ _rotr(w15, 18) ^ (w15 >>> 3)) >>> 0;
				const s1 = (_rotr(w2, 17) ^ _rotr(w2, 19) ^ (w2 >>> 10)) >>> 0;
				W[j] = (W[j - 16] + s0 + W[j - 7] + s1) >>> 0;
			}

			// 主迴圈
			let a = H[0], b = H[1], c = H[2], d = H[3];
			let e = H[4], f = H[5], g = H[6], h = H[7];

			for (let j = 0; j < 64; j++) {
				const S1 = (_rotr(e, 6) ^ _rotr(e, 11) ^ _rotr(e, 25)) >>> 0;
				const ch = ((e & f) ^ (~e & g)) >>> 0;
				const t1 = (h + S1 + ch + _K[j] + W[j]) >>> 0;
				const S0 = (_rotr(a, 2) ^ _rotr(a, 13) ^ _rotr(a, 22)) >>> 0;
				const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
				const t2 = (S0 + maj) >>> 0;

				h = g; g = f; f = e; e = (d + t1) >>> 0;
				d = c; c = b; b = a; a = (t1 + t2) >>> 0;
			}

			H[0] = (H[0] + a) >>> 0;
			H[1] = (H[1] + b) >>> 0;
			H[2] = (H[2] + c) >>> 0;
			H[3] = (H[3] + d) >>> 0;
			H[4] = (H[4] + e) >>> 0;
			H[5] = (H[5] + f) >>> 0;
			H[6] = (H[6] + g) >>> 0;
			H[7] = (H[7] + h) >>> 0;
		}

		let hex = "";
		for (let i = 0; i < 8; i++) {
			hex += ("00000000" + (H[i] >>> 0).toString(16)).slice(-8);
		}
		return hex;
	}

	// ============================================================
	// GwSigner 類
	// ============================================================
	class GwSigner {
		constructor(options) {
			options = options || {};
			this.version = GwSigner.VERSION;
			this.algorithm = "SHA256( Base64( UTF-8( body + userid + timestamp_ms ) ) )";
			this._defaultUserId = (options.userId != null) ? String(options.userId) : null;
			this._appId = options.appId || "";
			this._appKey = options.appKey || "";
			this._serverTimeOffset = Number(options.serverTimeOffset) || 0;
			this._debug = !!options.debug;
			this._trailer = options.trailer || null;
		}

		setUserId(userId) { this._defaultUserId = String(userId); return this; }
		getUserId() { return this._defaultUserId; }
		setServerTimeOffset(ms) { this._serverTimeOffset = ms | 0; return this; }
		getServerTimeOffset() { return this._serverTimeOffset; }
		now() { return Date.now() + this._serverTimeOffset; }

		sign(body, userId, timestamp, options) {
			let opts = options || {};

			// 物件風格
			if (body !== null && typeof body === "object" && body.body !== undefined) {
				const obj = body;
				body = obj.body;
				userId = (obj.userId !== undefined) ? obj.userId : userId;
				timestamp = (obj.timestamp !== undefined) ? obj.timestamp : timestamp;
				opts = obj;
			}

			if (body == null) throw new Error("[GwSigner] body is required");
			if (typeof body !== "string") body = JSON.stringify(body);

			if (userId == null) userId = this._defaultUserId;
			if (userId == null) throw new Error("[GwSigner] userId is required");
			userId = String(userId);

			if (timestamp == null) timestamp = this.now();
			timestamp = String(timestamp);

			const msg = body + userId + timestamp;
			const msgB64 = _bytesToBase64(_utf8Encode(msg));
			const hashHex = _sha256Bytes(_utf8Encode(msgB64));

			if (this._debug) {
				console.log("[GwSigner] body.len  =", body.length);
				console.log("[GwSigner] userId    =", userId);
				console.log("[GwSigner] timestamp =", timestamp);
				console.log("[GwSigner] msgB64    =", msgB64);
				console.log("[GwSigner] hashHex   =", hashHex);
			}

			const format = opts.format || "hex";
			let output;
			if (format === "hex") {
				output = hashHex;
			} else if (format === "bytes") {
				output = new Uint8Array(_hexToBytes(hashHex));
			} else if (format === "b64" || format === "base64") {
				output = _bytesToBase64(_hexToBytes(hashHex));
			} else if (format === "blob") {
				output = this._buildBlob(hashHex, opts.trailer || this._trailer);
			} else {
				throw new Error("[GwSigner] unknown format: " + format);
			}

			if (opts.returnAll) {
				return {
					hash: hashHex,
					hashBytes: new Uint8Array(_hexToBytes(hashHex)),
					timestamp: timestamp,
					header: {
						"X-GW-T": timestamp,
						"X-GW-SIGN": output
					},
					msg: msg,
					msgB64: msgB64
				};
			}
			return output;
		}

		getHeaders(body, userId, timestamp) {
			return this.sign(body, userId, timestamp, { returnAll: true }).header;
		}

		getSign(body, userId, timestamp, options) { return this.sign(body, userId, timestamp, options); }
		compute(body, userId, timestamp, options) { return this.sign(body, userId, timestamp, options); }
		signature(body, userId, timestamp, options) { return this.sign(body, userId, timestamp, options); }

		_buildBlob(hashHex, trailerBytes) {
			const blob = new Array(96);
			for (let i = 0; i < 96; i++) blob[i] = 0;
			for (let i = 0; i < 32; i++) {
				blob[16 + i] = parseInt(hashHex.substr(i * 2, 2), 16);
			}
			if (trailerBytes && trailerBytes.length === 48) {
				for (let i = 0; i < 48; i++) blob[48 + i] = trailerBytes[i] & 0xFF;
			}
			return _bytesToBase64(blob);
		}

		// ---------- 靜態 ----------
		static sign(body, userId, timestamp, options) {
			return GwSigner.instance.sign(body, userId, timestamp, options);
		}
		static getSign(body, userId, timestamp, options) { return GwSigner.sign(body, userId, timestamp, options); }
		static compute(body, userId, timestamp, options) { return GwSigner.sign(body, userId, timestamp, options); }
		static getHeaders(body, userId, timestamp) { return GwSigner.instance.getHeaders(body, userId, timestamp); }
		static create(options) { return new GwSigner(options); }

		static get instance() {
			if (!GwSigner._instance) GwSigner._instance = new GwSigner();
			return GwSigner._instance;
		}
		static set instance(v) { GwSigner._instance = v; }

		static configure(options) {
			GwSigner._instance = new GwSigner(options);
			return GwSigner._instance;
		}

		// static selfTest() {
		//     let allOk = true;

		//     const abc = _sha256Bytes(_utf8Encode("abc"));
		//     const abcExp = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
		//     console.log((abc === abcExp ? "✅" : "❌") + " SHA256('abc') = " + abc);
		//     if (abc !== abcExp) { console.log("   期望:", abcExp); allOk = false; }

		//     const b64 = _bytesToBase64(_utf8Encode("Hello, 世界!"));
		//     const b64Exp = "SGVsbG8sIOS4lueVjCE=";
		//     console.log((b64 === b64Exp ? "✅" : "❌") + " Base64 = " + b64);
		//     if (b64 !== b64Exp) { console.log("   期望:", b64Exp); allOk = false; }

		//     console.log(allOk ? "🎉 全部通過" : "⚠ 有項目失敗");
		//     return allOk;
		// }
	}

	GwSigner.VERSION = "1.0.1";
	GwSigner._instance = null;

	global.GwSigner = GwSigner;
	if (typeof module !== "undefined" && module.exports) module.exports = GwSigner;

})(typeof globalThis !== "undefined" ? globalThis :
	typeof window !== "undefined" ? window :
		typeof self !== "undefined" ? self : this);