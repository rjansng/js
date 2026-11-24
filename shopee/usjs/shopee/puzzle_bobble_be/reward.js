// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '領每日登入獎勵';
const title = '泡泡王 ' + caption;
const version = 'v20240422';
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
			'Cookie': `${cookieToString(shopeeInfo.tokenAll)}`,
			'Content-Type': 'application/json',
			'x-user-id': shopeeInfo.tokenAll.SPC_U,
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
		// console.log(`⭕️ 執行成功 💯`);
		console.log(data);
		let found = true;
		return resolve(found);
	});
}
async function ProcData4(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;
		// console.log(`⭕️ 執行成功 💯`);
		let obj = JSON.parse(data);
		if (obj.code == 0) {
			try {
				console.log(`目前點數：${obj.data.user.point_current}`);

				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'puzzle_bobble_be' + 's';
				let tsid = 'P';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c = 1;
				s.f = s.c > 0;
				s.s = obj.data.user.point_current;
				ts[tsid] = s;
				tasks[tsn] = ts;
				$persistentStore.write(JSON.stringify(tasks), dataName);
			} catch (e) { console.log(e); }
		}
		return resolve(found);
	});
}
async function ProcData2(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		// console.log(data);

		// console.log(`⭕️ 執行成功 💯`);
		if (dc.item == 4) {
			let obj = JSON.parse(data);

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'puzzle_bobble_be' + 's';
				let tsid = 'P';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c = 1;
				s.f = s.c > 0;
				s.s = obj.data.user.point_current;
				ts[tsid] = s;
				tasks[tsn] = ts;
				$persistentStore.write(JSON.stringify(tasks), dataName);
			} catch (e) { console.log(e); }
			found = true;
		}
		else if (dc.item === 12) {
			// console.log(data);
			let obj = JSON.parse(data);
			if (obj.data.is_rewarded) {
				console.log(`第 ${obj.data.day} 天 成功領取登入獎勵✅`);

				try {
					let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
					let tsn = 'puzzle_bobble_be' + 's';
					let tsid = 'A';
					let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
					let tasks = JSON.parse(rs);
					let ts = {}, s = {};
					if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
					if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
					s.c++;
					s.f = s.c > 0;
					s.r = `第 ${obj.data.day} 天 👀`;
					ts[tsid] = s;
					tasks[tsn] = ts;
					$persistentStore.write(JSON.stringify(tasks), dataName);
				} catch (e) { console.log(e); }


			}
			else {
				console.log(`第 ${obj.data.day} 天 已經領過登入獎勵`);
			}
			// try {
			// 	let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
			// 	let tsn = 'puzzle_bobble_be' + 's';
			// 	let tsid = 'P';
			// 	let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
			// 	let tasks = JSON.parse(rs);
			// 	let ts = {}, s = {};
			// 	if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
			// 	if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
			// 	s.c = 1;
			// 	s.f = s.c > 0;
			// 	s.s = obj.data.user.point_current;
			// 	ts[tsid] = s;
			// 	tasks[tsn] = ts;
			// 	$persistentStore.write(JSON.stringify(tasks), dataName);
			// } catch (e) { console.log(e); }
			found = true;

		}
		// else if (dc.item === 4) {
		// 	found = true;
		// 	let obj = JSON.parse(data);
		// 	console.log(obj.data);
		// }
		else {
			found = true;

		}
		//let obj = JSON.parse(data);
		// if (obj.code === 0) {
		// 	found = true;
		// }
		// else {
		// 	return reject([`執行失敗 ‼️`, obj, data]);
		// }
		return resolve(found);
	});
}

// 4 12
let UrlData = [[],
['!GET', '01 取得ℹ️首頁資訊', '執行', 'https://idgame.shopee.tw/puzzle-bobble/282bdb825fa9d0fb?reloadCount=1&reloadTime={token}', '', ['token'], ProcData1],
['!GET', '02 登入', '執行', 'https://shopee.tw/api/v2/user/login_status', '', , ProcData2],
['!GET', '03 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v2/events/282bdb825fa9d0fb', '', , ProcData2],
['GET', '04 User Info', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v4/events/282bdb825fa9d0fb/user/info?source=landingpage', '', , ProcData4],
//['GET', '05 User Info', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v1/events/282bdb825fa9d0fb/user/info?source=landingpage', '', , ProcData2],
['!GET', '05 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v1/events/282bdb825fa9d0fb/task', '', , ProcData2],
['!GET', '06 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v1/events/282bdb825fa9d0fb/endless', '', , ProcData2],
['!GET', '07 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v3/events/282bdb825fa9d0fb/worlds/3/state', '', , ProcData2],
['!GET', '08 登入', '執行', 'https://shopee.tw/api/v2/user/login_status', '', , ProcData2],
['!POST', '09 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v1/events/282bdb825fa9d0fb/asset', '', , ProcData2],
['!GET', '10 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v1/events/282bdb825fa9d0fb/items?type=landingpage', '', , ProcData2],
['!GET', '11 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v2/events/282bdb825fa9d0fb', '', , ProcData2],
['GET', '領取登入獎勵', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v1/events/282bdb825fa9d0fb/daily-login', '', , ProcData2],
	// ['GET', '13 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v3/events/282bdb825fa9d0fb/worlds/3/state', '', , ProcData2],
	// ['GET', '14 ', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v1/events/282bdb825fa9d0fb/user/info?', '', , ProcData2],
];


let DataPostBodyList = [, , , , , , , , ,
	{ "ball_assets": [1], "other_img_assets": [], "sound_assets": [] }, , , , ,
];

function preInit() { }

const forMaxCount = 15;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	try {
		await preCheck();
		preInit();
		needLastNotify = false;
		let flag = true;
		let runCount = 0;
		let item = -1;
		//console.log(`Data Count : ${UrlData.length - 1}`);
		for (let i = 1; i < UrlData.length; i++) {
			if (!flag) { break; }
			runCount++;
			if (i === 1) { console.log(''); }
			let func = null;
			item = -1;
			let dc = GetDataConfig(i, null, null, null, null, func);
			if (dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}
			if (dc.method === 'GET' || dc.method === 'POST') { await delay(0.1); }
			if (runCount >= forMaxCount) { break; }
			if (runCount > 15) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
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

