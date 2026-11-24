// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

//console.log('「泡泡王、飛刀、夾夾樂」自動玩過。領任務「泡泡王、寵物、飛刀、夾夾樂」水滴。');
// 20230601 寵物村 獨立
const caption = '🎮遊戲玩過';
const title = '自動' + caption;
const version = 'v20240811';
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
async function delay(seconds) { console.log(`\t\t\t\t\t\t\t\t⏰ 等待 ${seconds} 秒`); return new Promise((resolve) => { setTimeout(() => { resolve(); }, seconds * 1000); }); }
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
			dc.url = dc.url.replace(`\{${p}\}`, config[p]);
		}
	}
	dc.dataRequest.url = dc.url;
	if (func != null && typeof (func) === 'function') { dc = func(dc); }
	return dc;
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
			'Cookie': `${cookieToString(shopeeInfo.tokenAll)}`,
			'Content-Type': 'application/json',
		}
		config = {
			shopeeInfo: shopeeInfo,
			shopeeHeaders: shopeeHeaders,
		}
		console.log('✅ 檢查成功');
		return resolve();
	});
}

let task = {
	'taskFinishNum': 2,
	'isNewUserTask': false,
	'taskId': 0,
	'forceClaim': false,
};
let taskStatus = {};
async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {

		let found = false;
		let json = JSON.parse(data);

		var tasks = json.data.userTasks;
		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].length === 1) {
				//console.log(tasks[i])
				var ti = tasks[i][0].taskInfo;
				if (tasks[i][0].taskFinishStatus != 3) {
					//console.log(ti.Id + '\t' + ti.taskName);
					if (( //ti.taskName.includes('寵物村') ||
						ti.taskName.includes('泡泡王')
						// || ti.taskName.includes('飛刀')
						// || ti.taskName.includes('夾夾樂')
						// || ti.taskName.includes('消消樂')
					) && !ti.taskName.includes('蝦幣')) {
						console.log(`找到任務 ${ti.taskName} (${ti.Id})`);
						found = true;
						// if (ti.taskName.includes('寵物村')) { taskStatus.item = 2; }
						if (ti.taskName.includes('泡泡王')) { taskStatus.item = 3; }
						// else if (ti.taskName.includes('飛刀')) { taskStatus.item = 4; }
						// else if (ti.taskName.includes('夾夾樂')) { taskStatus.item = 5; }
						// else if (ti.taskName.includes('消消樂')) { taskStatus.item = 6; }
						taskStatus.name = ti.taskName;
						taskStatus.canReward = tasks[i][0].canReward;
						task.isNewUserTask = ti.isNewUserTask;
						task.taskId = ti.Id;
						task.taskFinishNum = tasks[i][0].taskFinishNum;
						break;
					}

				}
			}
		}
		if (found) {
			// if (taskStatus.item === 2 && !taskStatus.canReward) {
			// 	found = false;
			// 	console.log(`請手動玩過 ${taskStatus.name}`);
			// }
			// else if (taskStatus.item === 3 && !taskStatus.canReward) {
			// 	// var played = $persistentStore.read('shopee_puzzle-bobble-be_played' + _ShopeeUserID);
			// 	// if (played) {
			// 	// 	$persistentStore.write(null, 'shopee_puzzle-bobble-be_played' + _ShopeeUserID)
			// 	// }
			// 	// else {
			// 	// 	found = false;
			// 	// 	console.log('未設定自動執行 蝦皮泡泡王 玩過');
			// 	// 	console.log('請手動玩過 蝦皮泡泡王');
			// 	// }
			// }
			// else if (taskStatus.item === 4 && !taskStatus.canReward) {
			// 	// var played = $persistentStore.read('shopee_knifethrow_played' + _ShopeeUserID);
			// 	// if (played) {
			// 	// 	$persistentStore.write(null, 'shopee_knifethrow_played' + _ShopeeUserID)
			// 	// 	//found = false;
			// 	// 	//console.log('蝦蝦飛刀 自動玩過');
			// 	// 	// console.log('蝦蝦飛刀 自動玩過 (功能異常，處理中，有好康還是留次數自己玩吧。)');
			// 	// 	// console.log('請手動玩過 蝦蝦飛刀');
			// 	// }
			// 	// else {
			// 	// 	found = false;
			// 	// 	console.log('未設定自動執行 蝦蝦飛刀 玩過');
			// 	// 	console.log('請手動玩過 蝦蝦飛刀');
			// 	// }
			// }
			// else if (taskStatus.item === 5 && !taskStatus.canReward) {
			// 	// found = false;
			// 	// console.log(`請手動玩過 ${taskStatus.name}`);
			// 	// console.log('或待排程自動執行 蝦皮夾夾樂 玩過');
			// 	// // var played = $persistentStore.read('shopee_clawbox_played');
			// 	// // if (played) {
			// 	// // 	$persistentStore.write(null, 'shopee_clawbox_played')
			// 	// // }
			// 	// // else {
			// 	// // 	found = false;
			// 	// // 	console.log('未設定自動執行 蝦皮夾夾樂 玩過');
			// 	// // 	console.log('請手動玩過 蝦皮夾夾樂');
			// 	// // }
			// }
			// else if (taskStatus.item === 6 && !taskStatus.canReward) {
			// 	var played = $persistentStore.read('shopee_clawbox_played');
			// 	if (played) {
			// 		$persistentStore.write(null, 'shopee_clawbox_played')
			// 	}
			// 	else {
			// 		found = false;
			// 		console.log('未設定自動執行 蝦皮消消樂 玩過');
			// 		console.log('請手動玩過 蝦皮消消樂');
			// 	}
			// }
			// else {
			// 	//found = false;
			// }
			if (found) {
				console.log(`${taskStatus.name} ${(taskStatus.canReward ? '領取水滴💧' : '執行玩過')}`);
			}
		}
		else {
			console.log(`已完成所有 ${caption} 任務`);
		}
		return resolve(found);
	});
}
async function ProcData2(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {

			if (json.data.claimValue > 0) {
				found = true;
				console.log(`成功領取 ${json.data.claimValue} 水滴💧`);

				try {
					let found = false;
					let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
					let tsn = 'farm' + 's';
					let tsid = 'TGX';
					let tsidT = 'TS';
					if (taskStatus.item === 2) { found = true; tsid = 'TG3'; }
					else if (taskStatus.item === 3) { found = true; tsid = 'TG4'; }
					else if (taskStatus.item === 4) { found = true; tsid = 'TG5'; }
					else if (taskStatus.item === 5) { found = true; tsid = 'TG2'; }
					else if (taskStatus.item === 6) { found = true; tsid = 'TG1'; }
					let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
					let tasks = JSON.parse(rs);
					let ts = {}, s = {}, sT = {};
					if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
					if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
					if (ts.hasOwnProperty(tsidT)) { sT = ts[tsidT]; } else { sT = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
					s.c++;
					s.f = s.c > 0; // && s.s === 0;
					sT.c++;
					if (sT.s > 0) { sT.s--; }
					sT.r += `\n🔆${taskStatus.name.replace(' (打卡後3小時可再打卡一次)','')}`;
					ts[tsid] = s;
					ts[tsidT] = sT;
					if (found) {
						tasks[tsn] = ts;
						$persistentStore.write(JSON.stringify(tasks), dataName);
					}
				} catch (e) { console.log(e); }

			}
			else {
				console.log(`領取 ${json.data.claimValue} 水滴💧`);
				console.log(data);
				console.log(json);
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
		//if (json.code === 0) {

		found = true;
		console.log(`還可玩 ${json.data.total_chance_count} 次`);

		try {
			let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
			let tsn = 'puzzle_bobble_be' + 's';
			let tsid = 'B';
			let tsidC = 'C';
			let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
			let tasks = JSON.parse(rs);
			let ts = {}, s = {}, sC = {};
			if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
			if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
			if (ts.hasOwnProperty(tsidC)) { sC = ts[tsidC]; } else { sC = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
			s.c++;
			sC.c++;
			s.f = s.c > 0;
			sC.f = sC.c > 0;
			sC.s = json.data.total_chance_count;
			ts[tsid] = s;
			ts[tsidC] = sC;
			tasks[tsn] = ts;
			$persistentStore.write(JSON.stringify(tasks), dataName);
		} catch (e) { console.log(e); }

		// }
		// else {
		// 	return reject([`執行失敗 ‼️`, json, data]);
		// }
		return resolve(found);
	});
}
async function ProcData4(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			var basic = json.data.basic;
			var modules = json.data.modules;
			var ndt = new Date().getTime();
			console.log(basic.game_name);
			// console.log(basic);
			if (ndt > basic.end_time) {
				config.event_code = basic.event_code;
				console.log(`EID : ${config.event_code}`);
				for (var i = 0; i < modules.length; i++) {
					if (modules[i].module_name === 'Service.CHANCE') {
						found = true;
						// console.log(modules[i]);
						config.module_id = modules[i].module_id;
						console.log(`MID : ${config.event_code}`);
						break;
					}
				}
				if (!found) {
					console.log('找不到 Service.CHANCE');
					console.log(modules);
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
async function ProcData7(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		found = true;
		try {
			if (json.code === 0) {

				console.log(`${dc.content} ${json.data.incr_share} 次`);
			}
			else {
				console.log(`執行失敗 ‼️` + json.msg + '\n' + data);
				// return reject([`執行失敗 ‼️`, json.msg, data]);
			}
		} catch (e) { console.log(e); }
		return resolve(found);
	});
}
async function ProcData5(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {

			found = true;
			var cc = json.data.daily_chance + json.data.order_chance + json.data.share_chance;
			console.log(`還可執行 ${cc} 次`);

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'knifethrow' + 's';
				let tsid = 'C';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.s = cc;
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
async function ProcData6(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {

			found = true;

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'knifethrow' + 's';
				let tsid = 'B';
				let tsidC = 'C';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {}, sC = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				if (ts.hasOwnProperty(tsidC)) { sC = ts[tsidC]; } else { sC = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c++;
				s.f = s.c > 0;
				sC.c++;
				sC.f = sC.c > 0;
				if (sC.s > 0) { sC.s--; }
				ts[tsid] = s;
				ts[tsidC] = sC;
				tasks[tsn] = ts;
				$persistentStore.write(JSON.stringify(tasks), dataName);
			} catch (e) { console.log(e); }

			//console.log(json.data.instance_id);
		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}

let UrlData = [[],
['GET', '取得ℹ️任務資訊', '取得', 'https://games.shopee.tw/farm/api/task/listV2?groceryEntryOn=true&withMicrosite=1', '', , ProcData1],
['POST', '領取水滴💧', '領取', 'https://games.shopee.tw/farm/api/task/reward/claim', '', , ProcData2],
['POST', '蝦皮🫧泡泡王玩過', '執行', 'https://idgame.shopee.tw/api/puzzle-bobble-be/v2/events/282bdb825fa9d0fb/worlds/3/play/start', '', , ProcData3],
['!GET', '取得🔪蝦蝦飛刀資訊', '取得', 'https://games.shopee.tw/gameplatform/api/v1/game/activity/{activityId}/settings?appid=KKyN58ob6K6Nln3whP&basic=false', '', ['activityId'], ProcData4],
['!POST', '分享🔪蝦蝦飛刀取得一次', '獲得', 'https://games.shopee.tw/gameplatform/api/v2/event/{event_code}/chance/share/{module_id}?appid=KKyN58ob6K6Nln3whP', '', ['event_code', 'module_id'], ProcData7],
['!GET', '取得🔪蝦蝦飛刀次數', '取得', 'https://games.shopee.tw/gameplatform/api/v1/chance/{module_id}/event/{event_code}/query?appid=KKyN58ob6K6Nln3whP', '', ['module_id', 'event_code'], ProcData5],
['!POST', '🔪蝦蝦飛刀玩過', '執行', 'https://games.shopee.tw/knife/api/v1/begin/activity/{activityId}/slot/{event_code}?appid=KKyN58ob6K6Nln3whP', '', ['activityId', 'event_code'], ProcData6],
];
// ['GET', '02 取得蝦蝦飛刀資訊', '取得', 'https://games.shopee.tw/gameplatform/api/v1/game/activity/{activityId}/settings?appid={appid}&basic=false', '', ['appid', 'activityId'], ProcData2],
// ['GET', '03 取得蝦蝦飛刀次數', '取得', 'https://games.shopee.tw/gameplatform/api/v1/chance/{module_id}/event/{event_code}/query?appid={appid}', '', ['appid', 'module_id', 'event_code'], ProcData3],
// ['POST','04 分享蝦蝦飛刀取得一次', '獲得', 'https://games.shopee.tw/gameplatform/api/v2/event/{event_code}/chance/share/{module_id}?appid={appid}', '', ['appid', 'event_code', 'module_id'], ProcData4],
// ['GET', '05 取得蝦蝦飛刀次數', '取得', 'https://games.shopee.tw/gameplatform/api/v1/chance/{module_id}/event/{event_code}/query?appid={appid}', '', ['appid', 'module_id', 'event_code'], ProcData3],

let DataPostBodyList = [, , {}
	, { "level": 2 }, , {}, ,
	{
		"request_id": 0
	}
];
function preInit() {
	config.shopeeHeaders['x-user-id'] = config.shopeeInfo.tokenAll.SPC_U;
	config.appid = 'KKyN58ob6K6Nln3whP'; // 飛刀
	config.activityId = 'b0d6cfce2a5ec790';
	config.event_code = '93303d295f9f1510';
	config.slot = '93303d295f9f1510';
	config.module_id = 42948;
	config.item_id = '';
	config.redeem_token = '';
	config.store_id = 650;
	config.hasChance = false;
	config.hasShareChance = false;
}

const forMaxCount = 20;
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
			runCount++;
			if (i === 1) {
				console.log('');
				taskStatus = { 'item': 0, 'name': '', 'canReward': false };
				if (runCount > 1) { await delay(3.0); }
			}
			let func = null;
			item = -1;
			if (i === 2) {
				DataPostBodyList[i] = task;
				if (taskStatus.item > 2 && !taskStatus.canReward) { i = taskStatus.item; }
			}
			if (i === 7) { DataPostBodyList[i].request_id = getRnd(); }
			//if (i >= 3) { item = runCount; }
			let dc = !flag ? null : GetDataConfig(i, null, null, null, null, func);
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}
			//if (i === 2) break;
			if (flag && (i === 2 || i === 3 || i === 7)) { i = 0; }
			if (runCount >= forMaxCount) { break; }
			if (runCount > 15) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
		}
		console.log('');
		let msg = '✅ 處理已完成';
		console.log(msg);
		// if (!needLastNotify) { showNotification = needLastNotify; }
		// loonNotify(msg);
	} catch (error) {
		handleError(error);
	}
	$done({});
})();

