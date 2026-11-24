// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '「活動轉盤」活動';
const title = '自動抽' + caption;
const version = 'v20230328';
let showNotification = true;
let showLog = true;
let config = null;
let dataList = [];
const NotShowNotification = $persistentStore.read('NotShowNotification'); if (NotShowNotification) { showNotification = false; }
const NotShowLog = $persistentStore.read('ShowLog'); if (NotShowLog) { showLog = false; }
function getRnd(len = 16) { return (Math.random() * 10 ** 20).toFixed(0).substring(0, len); }
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
async function delay(seconds) { console.log(`⏰ 等待 ${seconds} 秒`); return new Promise((resolve) => { setTimeout(() => { resolve(); }, seconds * 1000); }); }
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
			dc.url = dc.url.replace(`\{${p}\}`, config[p]);
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
			let msg = `嘗試 ${dc.title} ...`;
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
			let msg = `嘗試 ${dc.title} ...`;
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
		}
		config = {
			shopeeInfo: shopeeInfo,
			shopeeHeaders: shopeeHeaders,
		}
		console.log('✅ 檢查成功\n');
		return resolve();
	});
}

async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {
		// console.log(`⭕️ 執行成功 💯`);
		let found = false;
		let json = JSON.parse(data);
		let activityData = {};
		let b1 = json.data.banners;
		for (let i = 0; i < b1.length; i++) {
			let b2 = b1[i].banners;
			for (let j = 0; j < b2.length; j++) {
				let b = b2[j];
				let t = new Date().getTime() / 1000;
				if (b.start < t && b.end > t) {
					let np = b.navigate_params;
					let re = new RegExp('^https:\/\/games\.shopee\.tw\/luckydraw-v2\/\\?game=wheel&activity=([0-9a-z]+)(&.+)?', 'i');
					if (np.url.match(re)) {
						found = true;
						config.activityId = np.url.replace(re, '$1');
						let re2 = new RegExp('.+&source=(\\d)', 'i');
						let s = '0';
						if (np.url.match(re2)) { s = np.url.replace(re2, '$1'); }
						config.source = parseInt(s);
						activityData = {
							'Id': config.activityId,
							'Title': np.navbar.title,
							'url': np.url
						};
						break;
					}
				}
			}
			if (found) { break; }
		}
		if (found) {
			console.log(`找到 ${caption} : ` + activityData.Title);
			console.log('Id : ' + activityData.Id);
		}
		else {
			console.log(`目前沒有 ${caption}`);
		}
		return resolve(found);
	});
}
async function ProcData2(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			// console.log(`⭕️ 執行成功 💯`);
			let basic = json.data.basic;
			let modules = json.data.modules;
			let ndt = new Date().getTime();
			let dbt = new Date(basic.begin_time * 1000);
			let det = new Date(basic.end_time * 1000);
			console.log(`名稱G : ${basic.game_name}`);
			console.log(`名稱S : ${basic.slot_name}`);
			config.t_id = 'W';
			if (ndt < det.getTime()) {
				config.event_code = basic.event_code;
				console.log(`EID : ${config.event_code}`);
				for (let i = 0; i < modules.length; i++) {
					if (modules[i].owner === "activity" && modules[i].module_name === 'Service.CHANCE') {
						found = true;
						config.module_id = modules[i].module_id;
						console.log(`MID : ${config.module_id}`);
					}
					else if (modules[i].owner === "slot" && modules[i].module_name === 'Service.TASK') {
						found = true;
						config.task_module_id = modules[i].module_id;
						console.log(`TMID : ${config.task_module_id}`)
					}
				}
				if (!found) {
					console.log(`找不到 ${title} Service`);
					console.log(json.data);
				}
			}
			else {
				console.log('活動已結束');
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData5(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		found = true;
		try {
			if (json.code === 0) {
				// console.log(`⭕️ 執行成功 💯`);
				if (json.data.incr_share > 0) {
					console.log(`獲得 ${json.data.incr_share} 次 ❤️`);
					try {
						let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
						let tsn = 'shopees';
						let tsid = 'WS';
						let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
						let tasks = JSON.parse(rs);
						let ts = {}, s = {};
						if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
						if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
						s.c++;
						s.f = true;
						s.r += '\n' + msg.replace(/\n/g, '');
						ts[tsid] = s;
						tasks[tsn] = ts;
						$persistentStore.write(JSON.stringify(tasks), dataName);
					} catch (e) { console.log(e); }
					}
				else {
					console.log(`今天已獲得 ❤️`);
				}
			}
			else {
				console.log(`執行失敗 ‼️` + json.msg + '\n' + data);
				// return reject([`執行失敗 ‼️`, json.msg, data]);
			}
		} catch (e) { console.log(e); }
		return resolve(found);
	});
}
async function ProcData3(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			let jd = json.data;
			// console.log(`⭕️ 執行成功 💯`);
			console.log(`每日機會 : ${jd.daily_chance}/${jd.daily_chance_limit}`);
			console.log(`其它機會 : ${jd.order_chance}/${jd.order_chance_limit}`);
			console.log(`分享機會 : ${jd.share_chance}`);
			console.log(`分享取得機會 : ${jd.share_remain}/${jd.share_limit}`);
			console.log(`而外機會 : ${jd.extra_chance}`);
			var cc = json.data.daily_chance + json.data.order_chance + json.data.share_chance + json.data.extra_chance;
			// console.log(jd.daily_total_consumed);
			// console.log(json.data.extra_chance);
			console.log(`剩餘機會 : ${cc}`);
			if (cc > 0) {
				found = true;
				config.hasChance = true;
			}
			if (jd.share_remain > 0) {
				found = true;
				config.hasShareChance = true;
			}
			else if (jd.share_limit > 0) {
				config.NoChance = true;
				console.log(`今天已領過`);
			}
			//console.log(json.data);
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData4(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			// console.log(`⭕️ 執行成功 💯`);
			if (json.msg === 'success') {
				found = true;
				const packageName = json.data.package_name;
				let msg = '🔆' + packageName;
				if (packageName.includes('蝦幣')) {
					console.log('☆☆☆太好了，得到「蝦幣」☆☆☆');
					let sN = showNotification;
					showNotification = true;
					loonNotify('領取成功 ✅', '獲得 👉 ' + packageName + ' 💎');
					showNotification = sN;
					config.isCoin = true;
					if (config.CoinName != '') { config.CoinName += ','; }
					config.CoinName += packageName;
				}
				else {
					let sN = showNotification;
					showNotification = false;
					loonNotify('領取成功 ✅', '獲得 👉 ' + packageName + ' 💎');
					showNotification = sN;
				}
				console.log(json.data.prize.settings.ar_notify_title);
				console.log(json.data.prize.settings.ar_notify_body);

				try {
					let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
					let tsn = 'shopees';
					let tsid = 'W';
					let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
					let tasks = JSON.parse(rs);
					let ts = {}, s = {};
					if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
					if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
					s.c++;
					s.f = true;
					s.r += '\n' + msg.replace(/\n/g, '');
					ts[tsid] = s;
					tasks[tsn] = ts;
					$persistentStore.write(JSON.stringify(tasks), dataName);
				} catch (e) { console.log(e); }

			} else if (json.msg === 'expired' || json.msg === 'event already end') {
				reject(['領取失敗 ‼️', '活動已過期。請嘗試更新模組或腳本，或等待作者更新']);
			} else if (obj.msg === 'no chance') {
				reject(['領取失敗 ‼️', '每日免費已領完']);
			} else {
				reject(['領取失敗 ‼️', obj.msg]);
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}

async function ProcData13(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		//console.log(json.data);
		if (json.code === 0) {
			let tasks = [];
			json.data.user_tasks.forEach(ut => {
				if (ut.task_finish_status != 3) {
					let utt = ut.task;
					let j = JSON.parse(utt.assets_config);
					let t = {
						id: utt.id,
						name: utt.task_name,
						module_id: utt.module_id,
						task_code: utt.task_code,
						type: 0,
						prize_url: '',
						shop_list: '',
						isReward: true,
						can_reward: ut.can_reward,
					};
					if (utt.cta_key === '-' && j.hasOwnProperty('prize_url')) {
						t.type = 1;
						t.prize_url = j.prize_url;
						t.shop_list = j.shop_list[0];
					}
					else if (utt.cta_key === 'cta_share_items_to_players') {
						t.type = 2;
					}
					else if (utt.cta_key === 'cta_browse_product_ads') {
						t.type = 2;
					}
					else if (utt.cta_key === 'cta_url') {
						t.type = 2;
					}
					//console.log(t);
					tasks.push(t);
				}
			});
			//console.log(tasks);
			config.tasks = tasks;
			if (tasks.length > 0) {
				found = true;
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData14(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			console.log('讀取成功。');
			config.report_token = json.data.report_token;
			console.log(`report_token : ${config.report_token}`);
			found = true;
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData15(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			// console.log(json.data);
			if (json.data.user_task.can_reward) {
				console.log('確認成功。');
				found = true;
			}
			else {
				console.log('確認失敗。');
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData16(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			console.log('領取成功。');
			found = true;

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'shopees';
				let tsid = config.t_id + (config.isBrowser ? 'E' : 'B');
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c++;
				s.f = true;
				//s.r += '\n' + msg.replace(/\n/g, '');
				ts[tsid] = s;
				tasks[tsn] = ts;
				$persistentStore.write(JSON.stringify(tasks), dataName);
			} catch (e) { console.log(e); }

		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}

let UrlData = [[],
['POST', '取得活動清單', '取得', 'https://mall.shopee.tw/api/v4/banner/batch_list', '', , ProcData1],
['GET', '取得活動資訊', '取得', 'https://games.shopee.tw/gameplatform/api/v1/game/activity/{activityId}/settings?appid={appid}&basic=false', '', ['activityId', 'appid'], ProcData2],
['POST', '分享活動取得一次', '執行', 'https://games.shopee.tw/gameplatform/api/v2/event/{event_code}/chance/share/{module_id}?appid={appid}', '', ['event_code', 'module_id', 'appid'], ProcData5],

['GET', '04 6 取得任務資訊', '取得', 'https://games.shopee.tw/api-gateway/luckydraw/api/v1/activity/{activityId}/task/list?app_id={appid}&request_id={token}', '', ['activityId', 'appid', 'token'], ProcData13],
['GET', '05 7 取得瀏覽任務 Token', '獲得', 'https://games.shopee.tw/gameplatform/api/v3/task/browse/{task_code}?module_id={task_module_id}', '', ['task_code', 'task_module_id'], ProcData14],
['POST', '06 8 送出瀏覽任務 Token', '獲得', 'https://games.shopee.tw/gameplatform/api/v3/task/component/report', '', , ProcData15],
['POST', '07 9 取得瀏覽任務機會', '獲得', 'https://games.shopee.tw/api-gateway/luckydraw/api/v1/task/claim', '', , ProcData16],

['GET', '取得活動次數', '取得', 'https://games.shopee.tw/gameplatform/api/v1/chance/{module_id}/event/{event_code}/query?appid={appid}&basic=false', '', ['module_id', 'event_code', 'appid'], ProcData3],
['POST', '領取獎勵', '執行', 'https://games.shopee.tw/api-gateway/luckydraw/api/v1/lucky/event/{event_code}', '', ['event_code'], ProcData4],
];
let DataPostBodyList = [,
	{
		"types": [{ "type": "coin_square" }]  // { "type": "coin_carousel" }, 
	}, , {}, , ,
	{ 'report_token': '' },
	{
		"module_id": "254",
		"request_id": "",
		"task_id": 4893
	}, ,
	{
		// schedule_ldc_id: module_id,
		request_id: 0,
		app_id: '5CX7XjYqk81xCNxpoL',
		activity_code: 'activityId',
		source: 0,
	},
];
function preInit() {
	config.SPC_U = config.shopeeInfo.tokenAll.SPC_U;
	config.userName = config.shopeeInfo.userName;
	config.shopeeHeaders['x-user-id'] = config.shopeeInfo.tokenAll.SPC_U;
	config.shopeeHeaders['x-csrftoken'] = config.shopeeInfo.csrfToken;
	config.appid = '5CX7XjYqk81xCNxpoL';
	config.isCoin = false;
	config.CoinName = '';
	config.NoChance = false;
	config.source = 0;
}
const forMaxCount = 30;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	try {
		await preCheck();
		preInit();
		let flag = true;
		let runCount = 0;
		let item = -1;
		for (let i = 1; i < UrlData.length; i++) {
			if (!flag) { break; }
			item = -1;

			if (i === 4 && config.task_module_id === 0) { i = 8; }
			if (i === 5) {
				runCount++;
				config.can_reward = false;
				config.isBrowser = false;
				if (config.tasks.some(t => {
					if (t.type === 1 && t.isReward) {
						config.task_code = t.task_code;
						config.can_reward = t.can_reward;
						config.task_module_id = t.module_id;
						console.log(`任務 : ${t.name}`);
						console.log(`TID : ${config.task_code}`);
						//DataPostBodyList[i + 2].task_id = t.id;
						DataPostBodyList[i + 2].task_id = t.id;
						DataPostBodyList[i + 2].module_id = `${t.module_id}`;
						DataPostBodyList[i + 2].request_id = `__game_platform_task__${t.shop_list}_${config.SPC_U}_${getRnd(13)}`;
						t.isReward = false;
						// console.log(DataPostBodyList[i + 2]);
						return true;
					}
					else if (t.type === 2 && t.isReward && t.can_reward) {
						// config.task_code = t.task_code;
						config.can_reward = t.can_reward;
						// config.task_module_id = t.module_id;
						console.log(`任務 : ${t.name}`);
						//console.log(`TID : ${config.task_code}`);
						DataPostBodyList[i + 2].request_id = getRnd();
						DataPostBodyList[i + 2].task_id = t.id;
						DataPostBodyList[i + 2].module_id = `${t.module_id}`;
						DataPostBodyList[i + 2].business_params = {
							'activity_code': config.activityId,
							'solt_code': config.event_code,
							'app_id': config.appid
						};
						// console.log(DataPostBodyList[i + 2]);
						t.isReward = false;
						config.isBrowser = true;
						return true;
					}
				})) {
					if (config.procItem != -1) { item = config.procItem == -1 ? 1 : config.procItem + 1; }
					if (config.can_reward) { i = 7; }
				}
				else {
					i = 8;
				}
			}
			else if (i === 6) {
				item = config.procItem;
				DataPostBodyList[i].report_token = config.report_token;
				await delay(10.0);
			}
			else if (i === 7) {
				item = config.procItem;
			}

			if (i === 8) {
				runCount++;
			}
			// else if (i === 4) {
			// 	if (!config.hasShareChance) { i++; }
			// }
			else if (i === 9) {
				DataPostBodyList[i].activity_code = config.activityId;
				DataPostBodyList[i].request_id = getRnd();
				DataPostBodyList[i].app_id = config.appid;
				DataPostBodyList[i].source = config.source;
			}
			if (i === 8) { console.log(''); }
			if (i >= 8) { item = runCount; }
			let dc = GetDataConfig(i);
			if (dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}

			if (flag && i === 7) { i = 3; }
			else if (!flag && i === 4) { i = 7; flag = true; }

			if (flag && i >= 9) { await delay(2.0); i = 7; } // 回到  n - 1
			if (runCount >= forMaxCount) { break; }
			if (runCount > 20) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
		}
		console.log('');
		let msg = '✅ 處理已完成';
		console.log(msg);
		if (config.isCoin) {
			loonNotify(msg, `獲得蝦幣 ${config.CoinName}`);
		}
		else if (!config.NoChance) {
			loonNotify(msg, '未獲得蝦幣');
		}
	} catch (error) {
		handleError(error);
	}
	$done({});
})();

