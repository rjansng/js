// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '🎮完成任務';
const title = '限時瀏覽優選商店、贊助賣場 自動' + caption;
const version = 'v20261104'; // 20241001 start
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
						console.log(response);
						console.log(data);
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
			'User-Agent': shopeeInfo.userAgent,
			'x-csrftoken': shopeeInfo.csrfToken,
			// 'referer': 'https://games.shopee.tw/gameplatform/api/v3/task/'
			'game-entrance': 'normal',
			'games-app-version': '38527',
			'game-operation-source': 'fruit_farm',
			'fruit-version-type': 'h5',
			'games-biz-version': '9.7.1',
			'fruit-app-version': '38527',
			'games-runtime': 'EgretH5',
			'games-rn-bundle-version': '7023002',
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

async function ProcData1O(data, dc) {
	return new Promise((resolve, reject) => {
		// console.log(`⭕️ 執行成功 💯`);
		let found = false;
		let obj = JSON.parse(data);
		if (obj.code == 0) {

			let crop = obj.data.crops[0];
			let cropName = crop.meta.name;
			config.cropName = cropName;
			let msg = '';
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
				config.canWater = true;
				found = true;
			}
			else if (crop.state == 100) {
				msg = '作物可以收成了。';
			}
			else if (crop.state >= 101) {
				// console.log('作物已收成');
				msg = '作物已收成。';
			}
			console.log(`\n${msg.replace(/\n/g, '')}`);


		} else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
		}
		return resolve(found);
	});
}
async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {

		let found = false;
		let obj = JSON.parse(data);

		let tasks = obj.data.userTasks;
		// console.log(tasks);
		for (let i = 0; i < tasks.length; i++) {
			if (tasks[i].length == 1) {
				// console.log(tasks[i][0]);
				let ti = tasks[i][0].taskInfo;
				if (tasks[i][0].taskFinishStatus != 3) {
					// console.log(tasks[i][0]);
					//console.log(ti.Id + '\t' + ti.taskName);
					if ((ti.actionKey == 'act_browse_livestream' || ti.actionKey == 'act_browse_video')
						&& !ti.taskName.includes('蝦幣')) {

						let cta = null;
						if ('ctaReqPayload' in ti && ti.ctaReqPayload) {
							cta = JSON.parse(ti.ctaReqPayload);
							if ('videoPayload' in cta) {
								let taskId = cta.videoPayload.match(/[0-9a-z]{16}/i);
								if (taskId) {
									config.taskId = taskId[0];

									config.task = config.taskId;
									found = true;

									console.log(`找到任務 ${ti.taskName} (${ti.Id})`);
									config.task_id = ti.Id;
									config.module_id = ti.moduleId;
									found = true;
									// if (ti.taskName.includes('限時瀏覽優選商店') || ti.taskName.includes('限時瀏覽贊助賣場')) 
									{ taskStatus.item = 3; }
									taskStatus.name = ti.taskName;
									taskStatus.canReward = tasks[i][0].canReward;
									task.isNewUserTask = ti.isNewUserTask;
									// task.taskId = ti.Id;
									// task.taskFinishNum = tasks[i][0].taskFinishNum;
									// let taskId = ti.ctaUrl.replace(/^.+taskId%3D([0-9a-f]{16})(&.+)?/i, '$1');

									console.log('taskId : ' + taskId);
									config.taskId = taskId;
									config.canReward = taskStatus.canReward;
									config.hasTileMatch = true;
									config.canTask = !taskStatus.canReward;
									config.task = tasks[i][0];
									break;

								}
							}
						}
						else if ('ctaReqPayload' in ti && ti.ctaReqPayload) {
							console.log(JSON.parse(ti.ctaReqPayload));
						}
						console.log('taskId : ' + config.taskId);

					}

					if ((ti.actionKey == 'act_browseshoppage' || ti.actionKey == 'act_browsemicrosite')
						&& !ti.taskName.includes('蝦幣')) {
						// && !ti.taskName.includes('蝦拼集點換好禮')
						// (ti.taskName.includes('限時瀏覽優選商店') || ti.taskName.includes('限時瀏覽贊助賣場'))
						console.log(`找到任務 ${ti.taskName} (${ti.Id})`);
						config.task_id = ti.Id;
						config.module_id = ti.moduleId;
						found = true;
						// if (ti.taskName.includes('限時瀏覽優選商店') || ti.taskName.includes('限時瀏覽贊助賣場')) 
						{ taskStatus.item = 3; }
						taskStatus.name = ti.taskName;
						taskStatus.canReward = tasks[i][0].canReward;
						task.isNewUserTask = ti.isNewUserTask;
						// task.taskId = ti.Id;
						// task.taskFinishNum = tasks[i][0].taskFinishNum;
						// let taskId = ti.ctaUrl.replace(/^.+taskId%3D([0-9a-f]{16})(&.+)?/i, '$1');
						let taskId = '';
						const match = ti.ctaUrl.match(/taskId(%3D|=)([a-zA-Z0-9]{16})/);  // .match(/(?<=taskId%3D)[a-zA-Z0-9]+/); //
						// console.log(match);
						if (match) { taskId = match[2]; }

						console.log('taskId : ' + taskId);
						config.taskId = taskId;
						config.canReward = taskStatus.canReward;
						config.hasTileMatch = true;
						config.canTask = !taskStatus.canReward;
						config.task = tasks[i][0];
						break;
					}
				}
			}
		}
		if (found) {
			if (taskStatus.item === 2 && !taskStatus.canReward) {
				found = false;
				console.log(`請手動玩過 ${taskStatus.name}`);
			}
			else if (taskStatus.item === 3 && !taskStatus.canReward) {
			}
			if (found) {
				console.log(`${taskStatus.name} ${(taskStatus.canReward ? '領取水滴💧' : '執行')}`);
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
		let obj = JSON.parse(data);
		// console.log(obj);
		if (obj.code === 0) {
			// console.log(obj.data);
			// console.log(ut);
			let ut = obj.data.user_task;
			if (ut && ut.task) {
				let t = ut.task;
				if (t.action_key == 'act_browse_livestream' || t.action_key == 'act_browse_video') {
					if (ut.task_finish_status != 3) { //  && !ut.can_reward
						console.log(t.task_name);
						if ('rcmd_shop_info' in ut && ut.rcmd_shop_info) {
							config.shop_id = ut.rcmd_shop_info.shop_id;
						}
						else { config.shop_id = ''; }
						config.hasTask = true;
						// config.canTask = true;
						found = true;
						let assets_config = JSON.parse(t.assets_config);
						config.completion_time = assets_config.browse_time_range;
						config.report_token = obj.data.report_token;
						console.log(config.report_token);
					}


					// console.log(t);
				}

				if (t.action_key == 'act_browseshoppage' || t.action_key == 'act_browsemicrosite'
					// || t.action_key == 'act_browse_livestream' || t.action_key == 'act_browse_video'
				) { //  &&t.task_name.includes('限時瀏覽優選商店') || t.task_name.includes('限時瀏覽贊助賣場')
					// console.log(ut);
					if (ut.task_finish_status != 3) { //  && !ut.can_reward
						console.log(t.task_name);
						if ('rcmd_shop_info' in ut && ut.rcmd_shop_info) {
							config.shop_id = ut.rcmd_shop_info.shop_id;
						}
						else { config.shop_id = ''; }
						config.hasTask = true;
						// config.canTask = true;
						found = true;
						let assets_config = JSON.parse(t.assets_config);
						config.completion_time = assets_config.completion_time;
						config.report_token = obj.data.report_token;
						console.log(config.report_token);
					}
				}
			}
			else {
				console.log('現在沒有任務。');
			}
		}
		else {
			return reject([`執行失敗 ‼️`, obj.msg, data]);
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

async function ProcDataEnd(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;

		let obj = JSON.parse(data);
		if (obj.code === 0) {
			config.RewardCount++;
			console.log(`獲得第 ${config.RewardCount} 獎利，${config.prizeValue}水滴`);
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
		return resolve(found);
	});
}
let UrlData = [[],
['GET', '01 自己果園狀態', '1', 'https://games.shopee.tw/farm/api/orchard/context/get?skipGuidance=0', '', , ProcData1O],
['GET', '02 取得ℹ️任務資訊', '2', 'https://games.shopee.tw/farm/api/task/listV2?groceryEntryOn=true&withMicrosite=1&deviceId={deviceId}', '', ['deviceId'], ProcData1],
['GET', '03 取得ℹ️限時瀏覽優選商店資訊', '2', 'https://games.shopee.tw/gameplatform/api/v3/task/browse/{taskId}?module_id={module_id}', '', ['taskId', 'module_id'], ProcData2],
['POST', '04 完成限時瀏覽優選商店1', '3', 'https://games.shopee.tw/gameplatform/api/v3/task/component/report', '', , ProcData00],
['POST', '05 完成限時瀏覽優選商店2', '3', 'https://games.shopee.tw/farm/api/task/browse/claim', '', , ProcDataEnd],
];
let DataPostBodyList = [, , , , {
	"report_token": ""
},
	{
		"task_id": 66059, "request_id": "__game_platform_task__779422436_681985929_1793749929898", "module_id": "10"
	}, , ,

];


function preInit() {
	config.deviceId = config.shopeeInfo.tokenAll.SPC_F;
	config.device_id = config.shopeeInfo.tokenAll.SPC_F;
	config.userId = config.shopeeInfo.userId;
	config.taskId = '31872770cb7c2a50';
	config.module_id = "10";
	config.shop_id = "0";
	config.task_id = 0;
	config.canReward = false;
	config.hasTileMatch = false;
	config.hasTask = false;
	config.token = '';
	config.completion_time = 0;
	config.task = null;
	DataPostBodyList[4].report_token = '';
	// console.log(config.shopeeInfo);
	config.RoundCount = 0;
	config.RewardCount = 0;
	config.prizeValue = 0;
}
const forMaxCount = 50;
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
			if (i == 3) {
				console.log('');
				// if (runCount > 2) { await delay(3.0); }
			}
			runCount++;
			item = -1;
			if (i === 2) {
				config.taskId = '';
				config.RoundCount++;
				console.log(`\n\n第 ${config.RoundCount} 回`);
				if (config.canWater) { }
				else {
					console.log('目前作物無法澆水。');
					break;
				}
			}
			if (i === 3) {
				if (config.canWater && config.canTask && config.task != null) {
					// let url = config.task.taskInfo.ctaUrl;
					// const match = url.match(/taskId%3D([a-zA-Z0-9]+)/); // .match(/(?<=taskId%3D)[a-zA-Z0-9]+/);

					if (config.taskId != '') {
						config.prizeValue = config.task.taskInfo.prizeValue;
						console.log(`獎利 ${config.prizeValue} 水滴`);
						// config.taskId = match[1];
						// config.module_id = config.task.taskInfo.moduleId;
					}
					else {
						console.log(config.task);
						console.log('任務取得異常');
						break;
					}
				}
				else {
					console.log('沒有任務');
					break;
				}
			}
			if (i === 4) {
				if (config.task != null && config.report_token != '') {
					DataPostBodyList[i].report_token = config.report_token;
					// console.log(DataPostBodyList[i]);
					await delay(config.completion_time * 1.0 + 0.5);
				}
				else {
					console.log('沒有任務');
					break;
				}
			}
			if (i === 5) {
				if (config.task != null) {
					//{"task_id":66059,"request_id":"__game_platform_task__779422436_681985929_1793749929898","module_id":"10"}
					DataPostBodyList[i].task_id = config.task_id;
					DataPostBodyList[i].module_id = `${config.module_id}`;
					DataPostBodyList[i].request_id = '__game_platform_task__' + config.shop_id + '_' + config.userId + '_' + Date.now().toString();
					console.log(DataPostBodyList[i]);
				}
				else {
					console.log('沒有任務');
					break;
				}
			}



			// let dc = GetDataConfig(i, null, null, null, null, func);
			let dc = GetDataConfig(i);
			// if (i == 3) {
			// console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);
			// 	console.log(dc);

			// 	flag = false;
			// }
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}
			if (i >= 5 && flag) {
				i = 1;
				await delay(3.0);
			}
			if (i >= 10) break;
			// 2 領完水後 及  i=? 玩過後 需 要重新取任務
			// if (!flag && i === 2) { flag = true; }
			// if (flag && (i === 4)) { i = 1; config.canTask = false; }
			// if (!flag && i == 3 && config.hasTask) { flag = true; }
			if (runCount >= forMaxCount) { break; }
			if (runCount > 60) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
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

