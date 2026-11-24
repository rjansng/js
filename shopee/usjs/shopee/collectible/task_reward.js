// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '領任務、抽物品、抽獎勵';
const title = '特蒐任務 自動' + caption;
const version = 'v20231201';

const _activityId = '31b751c0c4a56a0f'; // 每次會變動 要調整
const _end_time = new Date('2023/12/18 23:59:59').getTime();
// 20231201-20231218
// 20231101-20231118
// 20231001-20231018
// 20230901-20230918
// 20230601-20230618
//https://games.shopee.tw/collectible/31b751c0c4a56a0f 12月
//https://games.shopee.tw/collectible/9b8f51fa0e627b29 11月
//https://games.shopee.tw/collectible/fa7fcdc72aa5f0a2 10月
//https://games.shopee.tw/collectible/3398ac37966fdf20 9
//https://games.shopee.tw/collectible/3c013d205251d917 6

let showNotification = true;
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
function generateUUID(e = 32) {
	var t = "0123456789ABCDEF",
		a = t.length,
		n = "";
	for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
	return n;
}

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
			'Cookie': `${cookieToString(shopeeInfo.token)}`,
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
		let found = false;
		let json = JSON.parse(data);
		//if (json.code === 0) {
		let ds = json.data.iframe_list;
		for (let i = 0; i < ds.length; i++) {
			const d = ds[i];
			let re = new RegExp('^https:\/\/games\.shopee\.tw\/luckydraw-v2\/\\?game=box&activity=([0-9a-z]+)(&.+)?', 'i');
			if (d.url.match(re)) {
				found = true;
				config.activityId = d.url.replace(re, '$1');
				let re2 = new RegExp('.+&source=(\\d)', 'i');
				let s = '0';
				if (d.url.match(re2)) { s = d.url.replace(re2, '$1'); }
				config.source = parseInt(s);
				// activityData = {
				// 	'Id': config.activityId,
				// 	'Title': np.navbar.title,
				// 	'url': np.url
				// };
				console.log(`title : ${d.title}`);
				//console.log(`url : ${d.url}`);
				console.log(`activityId : ${config.activityId}`);
				break;
			}
		}
		if (!found) {
			console.log(`目前沒有${title}`);
			console.log(json.data);
		}
		// }
		// else {
		// 	return reject([`執行失敗 ‼️`, json.msg, data]);
		// }
		return resolve(found);
	});
}
async function ProcData2(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			// console.log(`⭕️ 執行成功 💯`);
			// let activity = json.data.activity;
			let basic = json.data.basic;
			let modules = json.data.modules;
			let ndt = new Date().getTime();
			let dbt = new Date(basic.begin_time * 1000);
			let det = new Date(basic.end_time * 1000);
			console.log(`名稱G : ${basic.game_name}`);
			console.log(`名稱S : ${basic.slot_name}`);
			// console.log(`DateTime : ${dbt.format('yyyy/MM/dd HH:mm:ss')} - ${det.format('yyyy/MM/dd HH:mm:ss')}`);
			// console.log(basic);
			if (ndt < det.getTime()) {
				config.event_code = basic.event_code;
				config.slot_code = basic.event_code;
				console.log(`EID : ${config.event_code}`)
				for (let i = 0; i < modules.length; i++) {
					if (modules[i].owner === "activity" && modules[i].module_name === 'Service.CHANCE') {
						found = true;
						config.module_id = modules[i].module_id;
						console.log(`MID : ${config.module_id}`)
					}
					else if (modules[i].owner === "activity" && modules[i].module_name === 'Service.TASK') {
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
				console.log('\n活動已結束。');
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData3(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		//console.log(json.data);
		if (json.code === 0) {
			let tasks = [];
			json.data.user_tasks.forEach(ut => {
				ut.chain.forEach(ct => {
					if (ct.task_finish_status != 3) {
						let ctt = ct.task;
						let j = JSON.parse(ctt.assets_config);
						let t = {
							id: ctt.id,
							name: ctt.task_name,
							module_id: ctt.module_id,
							task_code: ctt.task_code,
							type: 0,
							prize_url: '',
							shop_list: '',
							isReward: true,
							can_reward: ct.can_reward,
						};
						if (ctt.cta_key === '-' && j.hasOwnProperty('prize_url')) {
							t.type = 1;
							t.prize_url = j.prize_url;
							if (t.shop_list && t.shop_list.length > 0) { t.shop_list = j.shop_list[0]; }
							else {
								console.log('t.shop_list');
								console.log(t.shop_list);
							}
						}
						else if (ctt.cta_key === 'cta_share_items_to_players') {
							t.type = 2;
						}
						else if (ctt.cta_key === 'cta_url') {
							t.type = 2;
						}
						//console.log(t);
						tasks.push(t);
					}
				});
			});
			// console.log(tasks);
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
async function ProcData4(data, dc) {
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
async function ProcData5(data, dc) {
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
async function ProcData6(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			console.log('領取成功。');
			found = true;
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData8(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			found = true;
			let ds = json.data.item_list;
			ds.forEach((x, i) => {
				console.log(`${(i + 1).toString().padStart(2, ' ')} ${x.item_id} ${x.item_name} ${x.item_num}`);
				delete ds.custom_setting;
			});
			config.item_list = ds;
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData9(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			let cc = json.data.total_balance;
			console.log(`剩餘機會 : ${cc}`);
			if (cc > 0) {
				config.chance = 0;
				config.total_balance = cc;
				found = true;
				config.hasChance = true;
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData10(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			let d = json.data.item_id;
			found = true;
			config.item_list.some(x => {
				if (x.item_id === d) {
					console.log(`獲得 : ${x.item_name}`);
					x.item_num++;
					return true;
				}
			});
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData11(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			found = true;
			if (json.data.hasOwnProperty('item_list')) {
				console.log(`收到 : `);
				json.data.item_list.forEach(il => {
					config.item_list.some(x => { if (x.item_id === il) { x.item_num++; return true; } });
					console.log(`${il.from_user_id} (${il.from_user_name}) : ${il.item_name}`);
				});
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData12(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			found = true;
			let msg = `獲得 : ${json.data.package_name}`;
			loonNotify(msg);
			//console.log(`獲得 : ${json.data.package_name}`);
			//console.log(json.data);

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'shopee' + 's';
				let tsid = 'GZ';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c++;
				s.f = true;
				s.d.push(`🔆${json.data.package_name}`);
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
async function ProcData13(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			found = true;
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}


let UrlData = [[],
['!GET', '01 取得活動', '取得', 'https://mall.shopee.tw/api/v4/market_coin/get_iframe_list?region=TW&offset=0&limit=10', '', , ProcData1],
['GET', '02 取得活動資訊', '取得', 'https://games.shopee.tw/gameplatform/api/v1/game/activity/{activityId}/settings?appid={appid}&basic=false', '', ['appid', 'activityId'], ProcData2],
['GET', '03 取得任務資訊', '取得', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/tasks', '', ['activityId'], ProcData3],
['GET', '04 取得瀏覽任務 Token', '獲得', 'https://games.shopee.tw/gameplatform/api/v3/task/browse/{task_code}?module_id={task_module_id}', '', ['task_code', 'task_module_id'], ProcData4],
['POST', '05 送出瀏覽任務 Token', '獲得', 'https://games.shopee.tw/gameplatform/api/v3/task/component/report', '', , ProcData5],
['POST', '06 取得瀏覽任務機會', '獲得', 'https://games.shopee.tw/collectible/api/v3/browse/task/reward', '', , ProcData6],
['POST', '07 取得任務機會', '獲得', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/task/reward', '', ['activityId'], ProcData6],
['GET', '08 取得物品資訊', '取得', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/items', '', ['activityId'], ProcData8],
['GET', '09 取得活動次數', '取得', 'https://games.shopee.tw/gameplatform/api/v2/chance/query/{module_id}/event/{event_code}?appid={appid}', '', ['appid', 'module_id', 'event_code'], ProcData9],
['POST', '10 領取獎勵', '執行', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/item/draw', '', ['activityId'], ProcData10],
['POST', '11 接收獎勵', '執行', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/item/auto/claim', '', ['activityId'], ProcData11],
['POST', '12 抽獎勵', '執行', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/prize/draw', '', ['activityId'], ProcData12],
['GET', '13 消除Notify', '執行', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/item/notis', '', ['activityId'], ProcData13],
['GET', '14 取得物品資訊', '取得', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/items', '', ['activityId'], ProcData8],
	// ['GET', '12 取得抽獎次數', '取得', 'https://games.shopee.tw/collectible/api/v3/activity/{activityId}/redeem/list', '', ['activityId'], ProcData12],
];
let DataPostBodyList = [, , , , ,
	{ 'report_token': '' },
	{
		"module_id": "254",
		"request_id": "",
		"task_id": 4893
	},
	{ "task_id": 4867, "request_id": "32" }
	, , , { "request_id": "41", "slot_code": "" },
	{ "token": null, "device_id": "", "app_id": "kElMuSeTL3DTooG2N3", "request_id": "32" },
	{ "request_id": "41", "slot_code": "", "user_name": "sdany5751" }, , ,

];

function preInit() {
	config.SPC_U = config.shopeeInfo.token.SPC_U;
	config.userName = config.shopeeInfo.userName;
	config.appid = 'kElMuSeTL3DTooG2N3'; // 特蒐任務
	config.activityId = _activityId; // 置頂調整  '9b8f51fa0e627b29'; // 每次會變動 要調整
	config.end_time = _end_time; // new Date('2023/11/18 23:59:59').getTime();
	config.event_code = '93303d295f9f1510';
	config.slot_code = '73d2efd5ecd29c1d';
	config.module_id = 42948;
	config.item_id = '';
	config.redeem_token = '';
	config.store_id = 650;
	config.hasChance = false;
	config.report_token = '';
	config.procItem = -1;
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
		for (let i = 1; i < UrlData.length; i++) {
			if (!flag) { break; }
			item = -1;
			if (i === 4) {
				runCount++;
				config.can_reward = false;
				if (config.tasks.some(t => {
					if (t.type === 1 && t.isReward) {
						config.task_code = t.task_code;
						config.can_reward = t.can_reward;
						config.task_module_id = t.module_id;
						console.log(`任務 : ${t.name}`);
						console.log(`TID : ${config.task_code}`);
						//DataPostBodyList[i + 2].task_id = t.id;
						DataPostBodyList[i + 2].task_id = t.id;
						DataPostBodyList[i + 2].module_id = t.module_id;
						DataPostBodyList[i + 2].request_id = `__game_platform_task__${t.shop_list}_${config.SPC_U}_${getRnd()}`;
						t.isReward = false;
						// console.log(DataPostBodyList[i + 2]);
						return true;
					}
				})) {
					if (config.procItem != -1) { item = config.procItem == -1 ? 1 : config.procItem + 1; }
					if (config.can_reward) { i = 6; }
				}
				else {
					i = 7;
				}
			}
			else if (i === 5) {
				item = config.procItem;
				DataPostBodyList[i].report_token = config.report_token;
				await delay(13);
			}
			else if (i === 6) {
				item = config.procItem;
			}
			if (i === 7) {
				runCount++;
				config.can_reward = false;
				if (config.tasks.some(t => {
					if (t.type === 2 && t.isReward && t.can_reward) {
						// config.task_code = t.task_code;
						config.can_reward = t.can_reward;
						// config.task_module_id = t.module_id;
						console.log(`任務 : ${t.name}`);
						//console.log(`TID : ${config.task_code}`);
						DataPostBodyList[i].request_id = generateUUID();
						DataPostBodyList[i].task_id = t.id;
						t.isReward = false;
						return true;
					}
				})) { }
				else {
					i = 8;
				}
			}
			if (i === 10) {
				runCount++;
				if (config.total_balance - config.chance > 0) {
					await delay(3.0);
					DataPostBodyList[i].request_id = generateUUID(41);
					DataPostBodyList[i].slot_code = config.slot_code;
					config.chance++;
					item = config.chance;
				}
				else { i++; }
			}
			if (i === 11) {
				runCount++;
				DataPostBodyList[i].app_id = config.appid;
				DataPostBodyList[i].request_id = generateUUID();
			}
			if (i === 12) {
				runCount++;
				let ic = 0;
				config.item_list.forEach(x => {
					if (x.item_num > 0) { ic++; x.item_num--; }
				});
				if (ic === config.item_list.length) {
					await delay(1.0);
					DataPostBodyList[i].slot_code = config.slot_code;
					DataPostBodyList[i].request_id = generateUUID(41);
					DataPostBodyList[i].user_name = config.userName;
				}
				else {
					i++;
				}
			}
			let dc = !flag ? null : GetDataConfig(i);
			// console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);
			//if (i === 5) { console.log(dc.dataRequest); }
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}
			config.procItem = item;
			//console.log(`${i} : ${flag}`);
			if (flag && i === 6) { i = 3; }
			else if (flag && i === 7) { i = 6; }
			else if (flag && i === 10) { i = 9; }
			else if (flag && i === 12) { i = 11; }
			else if (!flag && i === 4) { i = 6; flag = true; }
			else if (!flag && i === 8) { i = 9; flag = true; }
			else if (!flag && i === 9) { i = 10; flag = true; }
			else if (!flag && i === 7) { flag = true; }
			//if (flag && i >= 6) { await delay(2.0); i = 4; }
			if (runCount >= forMaxCount) { break; }
			if (runCount > 30) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
		}
		console.log('');
		let msg = '✅ 處理已完成';
		console.log(msg);
		// loonNotify(msg);
	} catch (error) {
		handleError(error);
	}
	$done({});
})();

