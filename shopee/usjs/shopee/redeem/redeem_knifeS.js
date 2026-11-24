const caption = '兌換 5蝦幣';
const title = '飛刀 ' + caption;
const version = 'v20230325';
let showNotification = true;
let showLog = true;
let config = null;
let dataList = [];
let showInfo = false;
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
		if (item >= 0) { dc.item = item; }

		try {
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
		if (item >= 0) { dc.item = item; }
		try {
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
		const shopeeInfo = getSaveObject('ShopeeInfo');
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
		return resolve();
	});
}
async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			// console.log(`⭕️ 執行成功 💯`);
			if (!found && json.data.games) {
				for (let i = 0; i < json.data.games.length; i++) {
					const g = json.data.games[i];
					if (g.app_id === config.appid) {
						found = true;
						config.activityId = g.link_url.replace(/^.+\/knifethrow\/\?event=([0-9a-f]+)$/i, '$1');
						console.log(`AID : ${config.activityId}`);
						break;
					}
				}
			}
			if (!found && json.data.no_chance_games) {
				for (let i = 0; i < json.data.no_chance_games.length; i++) {
					const g = json.data.no_chance_games[i];
					if (g.app_id === config.appid) {
						found = true;
						config.activityId = g.link_url.replace(/^.+\/knifethrow\/\?event=([0-9a-f]+)$/i, '$1');
						console.log(`AID : ${config.activityId}`);
						break;
					}
				}
			}
			if (!found) {
				console.log('目前沒有蝦蝦飛刀遊戲');
				console.log(json.data);
			}
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
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
			// let activity = json.data.activity;
			let basic = json.data.basic;
			let modules = json.data.modules;
			let ndt = new Date().getTime();
			let dbt = new Date(basic.begin_time * 1000);
			let det = new Date(basic.end_time * 1000);
			config.knifethrowInfo.activityId = config.activityId;
			config.knifethrowInfo.begin_time = basic.begin_time * 1000;
			config.knifethrowInfo.end_time = basic.end_time * 1000;
			config.knifethrowInfo.game_name = basic.game_name;
			config.knifethrowInfo.slot_name = basic.slot_name;
			config.begin_time = basic.begin_time * 1000;
			config.end_time = basic.end_time * 1000;
			config.game_name = basic.game_name;
			config.slot_name = basic.slot_name;
			console.log(`名稱G : ${basic.game_name}`);
			console.log(`名稱S : ${basic.slot_name}`);
			// console.log(`DateTime : ${dbt.format('yyyy/MM/dd HH:mm:ss')} - ${det.format('yyyy/MM/dd HH:mm:ss')}`);
			// console.log(basic);
			if (ndt < det.getTime()) {
				config.event_code = basic.event_code;
				config.slot = config.event_code;
				config.knifethrowInfo.event_code = basic.event_code;
				config.knifethrowInfo.slot = basic.event_code;
				console.log(`EID : ${config.event_code}`);
				for (let i = 0; i < modules.length; i++) {
					if (modules[i].owner === "slot" && modules[i].module_name === 'Service.CHANCE') {
						found = true;
						config.module_id = modules[i].module_id;
						console.log(`MID : ${config.module_id}`);
						config.knifethrowInfo.module_id = config.module_id;
					}
					else if (modules[i].owner === "activity" && modules[i].module_name === 'Service.REDEEM_STORE') {
						found = true;
						config.store_id = modules[i].module_id;
						console.log(`SID : ${config.store_id}`);
						config.knifethrowInfo.store_id = config.store_id;
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
		if (json.code === 0) {
			found = true;
			config.redeem_token = json.data.redeem_token;
			config.remain_score = json.data.remain_score;
		}
		else {
			return reject([`執行失敗 ‼️`, json.data, data]);
		}
		return resolve(found);
	});
}
async function ProcData4(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let found2 = false;
		let json = JSON.parse(data);
		if (!json.data.hasOwnProperty('item_list')) { return reject([`執行失敗 ‼️`, json.msg, data]); }
		let item_list = json.data.item_list;
		config.item_list = item_list;
		for (var i = item_list.length - 1; i >= 0; i--) {
			if (item_list[i].item_type === 4) // 4 : 蝦幣
			{
				if (item_list[i].name.indexOf('5蝦幣') === 0) {
					found2 = true;
					config.msg = '\n🔆兌換 5蝦幣 ';
					if (item_list[i].redeem_limit > item_list[i].redeemed_times) {
						// 不管有沒有數量 都嘗試兌換
						found = true;
						config.item_id = item_list[i].id;
					}
					else {
						config.msg += `已兌換。${item_list[i].redeemed_times}/${item_list[i].redeem_limit}`;
						console.log(config.msg);
					}
					break;
				}
			}
		}
		return resolve(found);
	});
}
async function ProcData5(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;
		let json = JSON.parse(data);
		console.log(`剩於點數 : ${json.data.remain_score}`);
		let flag = true;
		config.msg += `第 ${dc.item} 次，`;
		if (json.code === 0) { config.msg += `成功`; }
		else { config.msg += '失敗'; }
		if (json.code === 1003) { config.msg += ' 已搶兌一空'; }
		console.log(config.msg);
		if (json.code === 1003) { }
		else if (json.code != 0) {
			console.log(data); //console.log('\n'); console.log(json);
		}
		else {
			found = false;
			try {
				let dataName = 'ShopeeGamePlayed';
				let tsn = 'knifethrows';
				let tsid = 'Z';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c++;
				s.f = true;
				s.d.push(config.msg.replace(/\n/g, ''));
				//s.r += msg.replace(/\n/g, '');
				ts[tsid] = s;
				tasks[tsn] = ts;
				$persistentStore.write(JSON.stringify(tasks), dataName);
			} catch (e) { console.log(e); }
		}

		if (!flag) { return reject([`執行失敗 ‼️`, json.msg, data]); }
		return resolve(found);
	});
}

let UrlData = [[],
['GET', '取得遊戲清單C2', '取得', 'https://games.shopee.tw/gameplatform/api/v2/game_reco/games/channels/2', '', , ProcData1],
['GET', '取得蝦蝦飛刀資訊', '取得', 'https://games.shopee.tw/gameplatform/api/v1/game/activity/{activityId}/settings?appid={appid}&basic=false', '', ['appid', 'activityId'], ProcData2],
['POST', '取得 Token', '取得', 'https://games.shopee.tw/knife/api/v1/redeem/remain_score/activity/{activityId}/slot/{slot}?appid={appid}', '', ['appid', 'activityId', 'slot'], ProcData3],
['GET', '取得兌換清單', '取得', 'https://games.shopee.tw/gameplatform/api/v1/redeem_store/item_list/store/{store_id}?redeem_store_token={redeem_token}&guest=1&limit=90&offset=0&appid={appid}&t={token}', '', ['appid', 'store_id', 'redeem_token', 'token'], ProcData4],
['POST', '兌換獎勵', '兌換', 'https://games.shopee.tw/gameplatform/api/v1/redeem_store/redeem_item/store/{store_id}/item/{item_id}?redeem_store_token={redeem_token}&appid={appid}', '', ['appid', 'store_id', 'item_id', 'redeem_token'], ProcData5],
];
let DataPostBodyList = [, , , {
	"request_id": ''
}, , {
		"request_id": ''
	}
];
function preInit() {
	config.forStartI = 1;
	//config.shopeeHeaders['x-user-id'] = config.shopeeInfo.token.SPC_U;
	config.appid = 'KKyN58ob6K6Nln3whP'; // 飛刀
	config.activityId = 'b0d6cfce2a5ec790';
	config.event_code = '93303d295f9f1510';
	config.slot = '93303d295f9f1510';
	config.module_id = 42948;
	config.item_id = '';
	config.redeem_token = '';
	config.store_id = 650;
	config.hasChance = false;

	let knifeThrowInfo = $persistentStore.read('KnifeThrowInfo');
	let found = false;
	if (knifeThrowInfo) {
		config.knifethrowInfo = JSON.parse(knifeThrowInfo);
		let nti = config.knifethrowInfo;
		config.knifethrowInfo = nti;
		config.appid = nti.appid;
		config.activityId = nti.activityId;
		config.begin_time = nti.begin_time;
		config.end_time = nti.end_time;
		config.game_name = nti.game_name;
		config.slot_name = nti.slot_name;
		config.event_code = nti.event_code;
		config.slot = nti.slot;
		config.module_id = nti.module_id;
		config.store_id = nti.store_id;

		let dtn = new Date().getTime();
		if (config.begin_time <= dtn && dtn <= config.end_time) {
			config.forStartI = 3;
			found = true;
		}
		else {
			console.log('飛刀資訊，不在時間內，需重新取得飛刀資訊。\n');
		}
	} else {
		console.log('沒有飛刀資訊，需重新取得飛刀資訊。\n');
	}
	if (!found) {
		config.knifethrowInfo = { 'appid': config.appid };
	}
}

const forMaxCount = 10;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	console.log(`${new Date().format('0')}`);
	try {
		await preCheck();
		preInit();
		let flag = true;
		let runCount = 0;
		let item = -1;
		let tryCount = 0;
		for (let i = config.forStartI; i < UrlData.length; i++) {
			if (!flag) { break; }
			item = -1;
			runCount++;
			if (i === 3) {
				DataPostBodyList[i].request_id = `${getToken()}_${getRnd(7)}`;
			} else if (i === 5) {
				tryCount++;
				item = tryCount;
				//console.log('');
				// console.log(new Date().format('0'));
				DataPostBodyList[i].request_id = `${config.shopeeInfo.token.SPC_U}_${config.store_id}_${config.event_item}_${getToken()}_` + getRnd()
			}

			let dc = GetDataConfig(i);
			// console.log(`🌐 ${dc.method} URL : ${dc.url}`);
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}
			//if (flag && i >= 4) { i = 2; }
			if (runCount >= forMaxCount) { break; }
			if (runCount > 10) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
			// console.log(`${i} : ${flag} `);
			if (flag && i === 5 && tryCount < 1) { i = 3; }
		}

		console.log('');
		let msg = '✅ 處理已完成';
		console.log(msg);
		// loonNotify(msg);
	} catch (error) {
		handleError(error);
	}

	// console.log(config.knifethrowInfo);

	let saveInfo = $persistentStore.write(JSON.stringify(config.knifethrowInfo), 'KnifeThrowInfo');
	if (saveInfo) {
		console.log('✅ 記錄成功 ✅');
	}
	else {
		console.log('❌ 記錄失敗 ❌');
	}


	console.log(`\n\nAppID : ${config.appid}`);
	console.log(`AID : ${config.activityId}`);
	console.log(`BDT : ${new Date(config.begin_time).format()}`);
	console.log(`EDT : ${new Date(config.end_time).format()}`);
	console.log(`GN : ${config.game_name}`);
	console.log(`SN : ${config.slot_name}`);
	console.log(`EID : ${config.event_code}`);
	console.log(`SID : ${config.store_id}`);
	console.log(`MID : ${config.module_id}`);

	let item_list = config.item_list;
	if (item_list) {
		for (let i = item_list.length - 1; i >= 0; i--) {
			if (item_list[i].item_type != 1) // 3 100%現拆購物金; 6 XX寶箱  4 蝦幣
			{
				console.log(`\n${item_list[i].name} (${item_list[i].id}) (${item_list[i].item_type})`);
				console.log(`${new Date(item_list[i].display_start_time * 1000).format('2')} - ${new Date(item_list[i].display_end_time * 1000).format('2')}`);
				if (item_list[i].item_type === 4) {
					console.log(`數量 : ${item_list[i].left_amount}/${item_list[i].total_amount}\t點數 : ${item_list[i].points_to_redeem}\t可兌 : ${item_list[i].redeemed_times}/${item_list[i].redeem_limit}`);
				}
				else {
					console.log(`數量 : ${item_list[i].left_amount}/${item_list[i].total_amount}\t點數 : ${item_list[i].cost}\t可兌 : ${item_list[i].redeemed_times}/${item_list[i].redeem_limit}`);
				}
			}
		}
	}
	$done({});
})();

