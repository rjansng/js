// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '🎮完成任務';
const title = '「精選商家」 自動' + caption;
const version = 'v20261111'; // 20241001 start
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
			'User-Agent': shopeeInfo.userAgent,
			'x-csrftoken': shopeeInfo.csrfToken,
			'referer': 'https://games-dailycheckin.shopee.tw/mkt/coins/api/',
			'dci-version': '4009002',
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
		// console.log(obj);
		let mkt_tasks = null;
		if (obj.code === 0) {
			// console.log(obj.data.user_tasks);
			let ut = obj.data.user_tasks;
			config.task_module_id = obj.data.task_module_id;
			// config.ts = [];
			let msg = [];
			if (ut && ut.length > 0) {
				for (let i = 0; i < ut.length; i++) {
					const t = ut[i];
					// console.log(t);
					if ((t.task.action_key == 'act_browse_livestream' || t.task.action_key == 'act_browse_video')
						 && t.task_status == 0) {
						let cta = JSON.parse(t.task.cta_req_payload);
						// console.log(cta);
						if ('videoPayload' in cta) {
							config.taskIdModuleId = cta.videoPayload;
						}
						if ('livestreamPayload' in cta) {
							config.taskIdModuleId = cta.livestreamPayload;

						}
						config.taskIdModuleId = config.taskIdModuleId.replace('taskId=', '').replace('&', '?');
						config.taskId = t.task.id;
						let tt = {
							'can_reward': t.can_reward,
							'task_status': t.task_status,
							'id': t.task.id,
							'task_name': t.task.task_name,
							'prize_value': t.task.prize_value,
							'action_key': t.task.action_key,
							// 'assets_config': JSON.parse(t.task.assets_config),
							// 'cta_req_payload': JSON.parse(t.task.cta_req_payload),
						};
						msg.push(`\n${tt.id.toString().padEnd(6)}\t`);
						msg.push(`${tt.prize_value}\t`);
						if (tt.can_reward) { msg.push(`可領`.padEnd(6)); }
						if (tt.task_status === 3) { msg.push(`已完成`); }
						msg.push(`\t${tt.task_name}`);
						msg.push('\t' + config.taskIdModuleId);
						found = true;

						break;
					}

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
		// $persistentStore.write(mkt_tasks, 'shopee_mkt_coins_tasks' + _ShopeeUserID);
		return resolve(found);
	});
}


async function ProcData00(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;
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
						config.browse_time_range = assets_config.browse_time_range;
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
function generateUpperGUID2() {
	var d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now(); // 增加微秒以提高唯一性
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		//client-request-id: 2278c591-aeaf-4d1e-930a-1327661d2e44.770
	}).toLowerCase();
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

let firstData = {
	"code": 0,
	"msg": "success",
	"data": {
		"user_tasks": [
			{
				"user_id": 0,
				"can_reward": false,
				"task": {
					"prize_key": "prize_coins",
					"index": 1,
					"id": 58414,
					"assets_config": "{\"display_end_time\":0,\"display_start_time\":1793347821,\"image_task_icon\":\"tw-11134001-820l7-mprlbhzmtfyn60\",\"shouldManualUpgrade\":false}",
					"action_key": "act_register_Shopee_VIP",
					"cta_url": "https://shopee.tw/shopee-plus",
					"prize_value": "10",
					"cycle_type": "lifetime",
					"task_name": "免費訂閱VIP，領10蝦幣",
					"cooldown_time": 0,
					"cta_url_type": 1,
					"cta_req_payload": "",
					"join_times": 1,
					"finish_times": 0,
					"reward_times": 0,
					"shop_ads_custom": "",
					"action_type": 26
				},
				"task_status": 1,
				"is_highlight": false
			},
			{
				"user_id": 0,
				"can_reward": false,
				"task": {
					"prize_key": "prize_coins",
					"index": 13,
					"id": 66534,
					"assets_config": "{\"background_image\":\"tw-11134001-7r991-lwmp5zvb6qli32\",\"browse_time_range\":10,\"display_end_time\":0,\"display_start_time\":1793329991,\"distribute_prize_spex_cmd\":\"game.daily_check_in.distribute_task_reward\",\"image_task_icon\":\"tw-11134001-7r98y-lwwq669f8c9y77\",\"prize_icon\":\"tw-11134001-7r98v-lwwqlcvhbvvq1a\",\"prize_url\":\"https://games-dailycheckin.shopee.tw/mkt/coins/api/v2/task/claim\",\"progress_bar_color\":[\"#ee4d2d\\n\"],\"rule_toast\":\"完成觀看任務，即可領取蝦幣獎勵\",\"source_key\":\"game_check_in_ls\",\"task_completing_toast\":\"完成任務，獎勵已派發！\",\"tips_when_entering\":\"觀看直播10秒可領蝦幣獎勵\"}",
					"action_key": "act_browse_livestream",
					"cta_url": "n/SHOPEE_LIVE_STREAM_SHOW",
					"prize_value": "0.02",
					"cycle_type": "per_day",
					"task_name": "觀看直播10秒",
					"cooldown_time": 0,
					"cta_url_type": 2,
					"cta_req_payload": "{\"source\":\"game_check_in_ls\",\"from\":\"list\",\"sessionId\":8177313,\"isNoSessionId\":false,\"recommendationAlgorithm\":\"QUE:ADS-GAME,QUES:ADS-GAME,QUESEXC:ADS-GAME\",\"recommendationInfo\":\"QUE:ADS-GAME,QUES:ADS-GAME,QUESEXC:ADS-GAME,QLVS:-1,RNK:urank_livestream_global_rank_calib_v1_final:{SCORE:0.00000000031743610679587126},REQID:88add0a4600fb6aafe67005e7da5ba00,RNKMOD:cvr=0.0000026321793029637774,EXTRA:RULES@483-3062##CHAN@ADS2##dispatch@org,SCENE:livestream_game,BG:preload,UAF:0,CHAN:ADS2,STIME:1794470465828,HOSTID:181229583,BND:livestream_game,plmt:3348,ent:48,PIN:0\",\"livestreamPayload\":\"taskId=2e1049d77f8316c9\\u0026moduleId=567\",\"recommendationExt\":{\"ads_reason\":{\"ads_id\":1036668336,\"ads_tracking_data\":\"CtgBfG5ld19hYl9zaWdufDc1MDQwMnw3MzE5MjB8NzU5NzM0fDYyMDIxM3w2NTc1NTl8NzQyMjcwfDY1ODcxM3w2OTg1Mzl8NzI2MTU4fDU5MzYyN3w0NDI2Mzh8NzY5ODk2fDY4MzUxM3w3NTUyMTF8NzY1MDk1fDY2MzUxNXw3NjIzMzZ8NzY1MTcxfDY4ODIwNnw3MjE1Mzd8NjU2NDM5fDc2NzgxN3w3MzU1Mzh8NzE1MDQ5fDc2NTE0MXw2ODA4MzV8Njg5NDA1fDY4NzUxM3w2NTc2MDl8ELCbqe4DGJex0dEBMkBiR2wyWlMxemRISmxZVzB0WVdSekFHMDI4R1FxYThaS0ppZlNXcjhqK1pXMjNJS2RaV1VyU1pYS1ZoZkY4a1VSSJQaUiA4OGFkZDBhNDYwMGZiNmFhZmU2NzAwNWU3ZGE1YmEwMHEAAAAAAADwP3kAAADgKSfWPpABweTV1waiAUBiR2wyWlMxemRISmxZVzB0WVdSekFHMDI4R1FxYThaS0ppZlNXcjhqK1pXMjNJS2RaV1VyU1pYS1ZoZkY4a1VS4AGUwDLpAQAAAAAAAPA/8QEAAAAA15GQQIgCwPOOqgHIDAngDDDpDAAAAACwAqY/iQ2C/CEg52kBP5ENAAAAQJWXUEGhDQAAABqqZ6VBuQ2Gb2dv0Vq4QMgPAeIZgAJJSzJBN0FJdEdjUDVQalVBQUhCQmFacVptWm1abWZrL2NRQUFBT0FwSjlZK2VRQUFBT0FwSjlZK2dRR0FKQVFrTEhHZFFJa0JnQ1FFSkN4eG5VQ1JBWUFrQkNRc2NaMUFtUUU0NHNOaEdacmJRS0VCT09MRFlSbWEyMENwQVRqaXcyRVptdHRBd1FFQUFBQUFBQUR3UDlFQkFBQUE0Q2tuMWo2aEFvQWtCQ1FzY1oxQTZRSkFoOUNHZEgrYVFMa0RabVptWm1abTVqL0JBNXFabVptWm1lay95UVBOek16TXpNenNQOUVEWm1abVptWm03ai9KQkFBQUFBQUFBUEEv6hkIjweYB6QHrQf6GbAGChEKC3BhZ2Vfb2Zmc2V0EgIQAAoqCh10cmFmZmljX2Jvb3N0X2RlZHVjdGlvbl9wcmljZRIJCQAAAAAAAAAAChQKDnVzZXJfYmxhY2tsaXN0EgIoAAogChNvcmlfZGVkdWN0aW9uX3ByaWNlEgkJAAAAAAAAAAAKFQoPdnNrdV91bmlxdWVfa2V5EgIiAAoUCg5pc19zdXBlcl92aXRlbRICKAAKDQoHaXNfdnNrdRICKAAKGgoNdHJhZmZpY19ib29zdBIJCQAAAAAAAAAAChYKDWJpel9xdWV1ZV9pZHMSBSIDYWRzCiAKE2lkeF9yb2lfdXBwZXJfYm91bmQSCQm6pEX1+UI3QAoSCgx2b3VjaGVyX2xlbnMSAhAACq0BCht1bmlfcGNyX2Nhc2NhZGVfbW9kZWxfbmFtZXMSjQEiigFncHVfcHJvZHVjdF9yYW5rX3YzX2lfa3AwX2thMF9sMnxncHVfZ212X3VwbGlmdF91bmlvbl9sMl9tdWx0aV9kMl95dGx8Z3B1X3Byb2R1Y3RfcmFua19kZWR1Y3RfdjFfaV9rcDRfa2EyX2wyfGdwdV9wZ212X2NhbGlfcjhfaXRlbXl0bF9vMmMKFAoOc2hvcF9ibGFja2xpc3QSAigACikKEHJlY2FsbF9xdWV1ZV9pZHMSFSITNjUzMDMxMjAzLDY1MzAzMTIwNAohChdsaXZlX3Nlc3Npb25fc3RhcnRfdGltZRIGGKqo1dcGCg4KCHZpZGVvX2lkEgIYAAoYChJlbnRyYW5jZV9ncm91cF9pZHgSAhAnChYKEHVzZXJfcHJvZmlsZV90YWcSAhgACiQKF2NwbV9hZHNfZGVkdWN0aW9uX3ByaWNlEgkJAAAAAAAAAAAKGAoScmFwaWRfYm9vc3RfdG9nZ2xlEgIoAAp7ChNlbmdpbmVlcmluZ19tZXRyaWNzEmQiYnsiYXBpNF9sYXRlbmN5X21zIjo1MiwicmV0cmlldmFsX2xhdGVuY3lfbXMiOjEyLCJvbmxpbmVfYmlkZGluZ19sYXRlbmN5X21zIjoyLCJhcGk0X2Fkc19jb3VudCI6MTF9wiUgZ3B1X3Byb2R1Y3RfcmFua192M19pX2twMF9rYTBfbDLyJQpMSVZFU1RSRUFN+CUFuCbFm7VWyCaPsLVW2CaAotLXBvAr+JeV/UiKfQhJTERiQmc9PZB9qqjV1wa4fcHk1dcGiPoBAQ==\",\"ads_tracking_data_tms\":\"CtgBfG5ld19hYl9zaWdufDc1MDQwMnw3MzE5MjB8NzU5NzM0fDYyMDIxM3w2NTc1NTl8NzQyMjcwfDY1ODcxM3w2OTg1Mzl8NzI2MTU4fDU5MzYyN3w0NDI2Mzh8NzY5ODk2fDY4MzUxM3w3NTUyMTF8NzY1MDk1fDY2MzUxNXw3NjIzMzZ8NzY1MTcxfDY4ODIwNnw3MjE1Mzd8NjU2NDM5fDc2NzgxN3w3MzU1Mzh8NzE1MDQ5fDc2NTE0MXw2ODA4MzV8Njg5NDA1fDY4NzUxM3w2NTc2MDl8ELCbqe4DGJex0dEBMkBiR2wyWlMxemRISmxZVzB0WVdSekFHMDI4R1FxYThaS0ppZlNXcjhqK1pXMjNJS2RaV1VyU1pYS1ZoZkY4a1VSSJQaUiA4OGFkZDBhNDYwMGZiNmFhZmU2NzAwNWU3ZGE1YmEwMHEAAAAAAADwP3kAAADgKSfWPpABweTV1waiAUBiR2wyWlMxemRISmxZVzB0WVdSekFHMDI4R1FxYThaS0ppZlNXcjhqK1pXMjNJS2RaV1VyU1pYS1ZoZkY4a1VS4AGUwDLpAQAAAAAAAPA/8QEAAAAA15GQQIgCwPOOqgHIDAngDDDpDAAAAACwAqY/iQ2C/CEg52kBP5ENAAAAQJWXUEGhDQAAABqqZ6VBuQ2Gb2dv0Vq4QMgPAeIZgAJJSzJBN0FJdEdjUDVQalVBQUhCQmFacVptWm1abWZrL2NRQUFBT0FwSjlZK2VRQUFBT0FwSjlZK2dRR0FKQVFrTEhHZFFJa0JnQ1FFSkN4eG5VQ1JBWUFrQkNRc2NaMUFtUUU0NHNOaEdacmJRS0VCT09MRFlSbWEyMENwQVRqaXcyRVptdHRBd1FFQUFBQUFBQUR3UDlFQkFBQUE0Q2tuMWo2aEFvQWtCQ1FzY1oxQTZRSkFoOUNHZEgrYVFMa0RabVptWm1abTVqL0JBNXFabVptWm1lay95UVBOek16TXpNenNQOUVEWm1abVptWm03ai9KQkFBQUFBQUFBUEEv6hkIjweYB6QHrQf6GbAGChgKEmVudHJhbmNlX2dyb3VwX2lkeBICECcKFgoQdXNlcl9wcm9maWxlX3RhZxICGAAKDQoHaXNfdnNrdRICKAAKJAoXY3BtX2Fkc19kZWR1Y3Rpb25fcHJpY2USCQkAAAAAAAAAAAoqCh10cmFmZmljX2Jvb3N0X2RlZHVjdGlvbl9wcmljZRIJCQAAAAAAAAAAChQKDnVzZXJfYmxhY2tsaXN0EgIoAAqtAQobdW5pX3Bjcl9jYXNjYWRlX21vZGVsX25hbWVzEo0BIooBZ3B1X3Byb2R1Y3RfcmFua192M19pX2twMF9rYTBfbDJ8Z3B1X2dtdl91cGxpZnRfdW5pb25fbDJfbXVsdGlfZDJfeXRsfGdwdV9wcm9kdWN0X3JhbmtfZGVkdWN0X3YxX2lfa3A0X2thMl9sMnxncHVfcGdtdl9jYWxpX3I4X2l0ZW15dGxfbzJjChUKD3Zza3VfdW5pcXVlX2tleRICIgAKFAoOaXNfc3VwZXJfdml0ZW0SAigAChYKDWJpel9xdWV1ZV9pZHMSBSIDYWRzCiAKE2lkeF9yb2lfdXBwZXJfYm91bmQSCQm6pEX1+UI3QAohChdsaXZlX3Nlc3Npb25fc3RhcnRfdGltZRIGGKqo1dcGChEKC3BhZ2Vfb2Zmc2V0EgIQAAoOCgh2aWRlb19pZBICGAAKewoTZW5naW5lZXJpbmdfbWV0cmljcxJkImJ7ImFwaTRfbGF0ZW5jeV9tcyI6NTIsInJldHJpZXZhbF9sYXRlbmN5X21zIjoxMiwib25saW5lX2JpZGRpbmdfbGF0ZW5jeV9tcyI6MiwiYXBpNF9hZHNfY291bnQiOjExfQoaCg10cmFmZmljX2Jvb3N0EgkJAAAAAAAAAAAKFAoOc2hvcF9ibGFja2xpc3QSAigACikKEHJlY2FsbF9xdWV1ZV9pZHMSFSITNjUzMDMxMjAzLDY1MzAzMTIwNAoYChJyYXBpZF9ib29zdF90b2dnbGUSAigAChIKDHZvdWNoZXJfbGVucxICEAAKIAoTb3JpX2RlZHVjdGlvbl9wcmljZRIJCQAAAAAAAAAAwiUgZ3B1X3Byb2R1Y3RfcmFua192M19pX2twMF9rYTBfbDLyJQpMSVZFU1RSRUFN+CUFuCbFm7VWyCaPsLVW2CaAotLXBvAr+JeV/UiKfQhJTERiQmc9PZB9qqjV1wa4fcHk1dcG\"}}}",
					"join_times": 1,
					"finish_times": 0,
					"reward_times": 0,
					"shop_ads_custom": "",
					"action_type": 14
				},
				"task_status": 0,
				"is_highlight": false
			},
			{
				"user_id": 0,
				"can_reward": false,
				"task": {
					"prize_key": "prize_coins",
					"index": 14,
					"id": 64575,
					"assets_config": "{\"background_image\":\"tw-11134001-7r991-lwmp5zvb6qli32\",\"browse_time_range\":60,\"display_end_time\":0,\"display_start_time\":1791455899,\"distribute_prize_spex_cmd\":\"game.daily_check_in.distribute_task_reward\",\"image_task_icon\":\"tw-11134001-7rbk8-m8vszzj5gjsped\",\"prize_icon\":\"tw-11134001-7r98v-lwwqlcvhbvvq1a\",\"prize_url\":\"https://games-dailycheckin.shopee.tw/mkt/coins/api/v2/task/claim\",\"progress_bar_color\":[\"#ee4d2d\\n\"],\"rule_toast\":\"完成觀看任務，即可領取蝦幣獎勵\",\"source_key\":\"iaa_game_coins_checkin\",\"task_completing_toast\":\"完成任務，獎勵已派發！\",\"tips_when_entering\":\"觀看蝦皮短影音60秒可領蝦幣獎勵\"}",
					"action_key": "act_browse_video",
					"cta_url": "n/LuckyVideoNativePlayerListRoute",
					"prize_value": "0.02",
					"cycle_type": "per_day",
					"task_name": "觀看蝦皮短影音60秒",
					"cooldown_time": 0,
					"cta_url_type": 2,
					"cta_req_payload": "{\"rnPagePath\":\"BGB_VIDEO_PAGE_COMMON_TIMELINE\",\"fromSource\":\"iaa_game_coins_checkin\",\"videoPayload\":\"taskId=ba0551db0d33540b\\u0026moduleId=567\"}",
					"join_times": 1,
					"finish_times": 0,
					"reward_times": 0,
					"shop_ads_custom": "",
					"action_type": 15
				},
				"task_status": 0,
				"is_highlight": false
			},
			{
				"user_id": 0,
				"can_reward": false,
				"task": {
					"prize_key": "prize_coins",
					"index": 6,
					"id": 64705,
					"assets_config": "{\"display_end_time\":0,\"display_start_time\":1791970468,\"image_task_icon\":\"tw-11134001-81ztd-mg5wlpl4sefib5\",\"spendGameAppId\":\"AxJMo8pm7cs5ca7OM8\"}",
					"action_key": "act_play_candy_game",
					"cta_url": "https://games.shopee.tw/shopeecandy/index.html?activity=1731357eb13431cb",
					"prize_value": "0.1",
					"cycle_type": "per_day",
					"task_name": "今日玩蝦皮消消樂1次",
					"cooldown_time": 0,
					"cta_url_type": 1,
					"cta_req_payload": "",
					"join_times": 1,
					"finish_times": 1,
					"reward_times": 0,
					"shop_ads_custom": "",
					"action_type": 2
				},
				"task_status": 3,
				"is_highlight": false
			},
			{
				"user_id": 0,
				"can_reward": false,
				"task": {
					"prize_key": "prize_coins",
					"index": 10,
					"id": 64727,
					"assets_config": "{\"display_end_time\":0,\"display_start_time\":1793687428,\"image_task_icon\":\"tw-11134001-81ztc-mg5wxy0n8nim0d\",\"shouldManualUpgrade\":false,\"spendGameAppId\":\"sXXLMi0v7R4phDVWk5\"}",
					"action_key": "act_play_bubble_game",
					"cta_url": "https://games.shopee.tw/puzzle-bobble/?activity=282bdb825fa9d0fb",
					"prize_value": "0.1",
					"cycle_type": "per_day",
					"task_name": "天天搶蝦幣",
					"cooldown_time": 0,
					"cta_url_type": 1,
					"cta_req_payload": "",
					"join_times": 1,
					"finish_times": 1,
					"reward_times": 0,
					"shop_ads_custom": "",
					"action_type": 2
				},
				"task_status": 3,
				"is_highlight": false
			},
			{
				"user_id": 0,
				"can_reward": false,
				"task": {
					"prize_key": "prize_coins",
					"index": 15,
					"id": 64728,
					"assets_config": "{\"display_end_time\":0,\"display_start_time\":1791971028,\"image_task_icon\":\"tw-11134001-820lh-mt3mzossfqip4f\"}",
					"action_key": "act_browse_product_ads",
					"cta_url": "",
					"prize_value": "0.02",
					"cycle_type": "per_day",
					"task_name": "瀏覽 推薦商品 30秒(1/2)",
					"cooldown_time": 0,
					"cta_url_type": 1,
					"cta_req_payload": "",
					"join_times": 1,
					"finish_times": 1,
					"reward_times": 1,
					"shop_ads_custom": "07b3694ffd4849c610b5ecca3c2a31353a490358a043c812b55a3fb882306b888c7438cd7a4ee690ffaf34e348d05036c1d2312ccd3d96f3",
					"action_type": 1
				},
				"task_status": 3,
				"is_highlight": false
			},
			{
				"user_id": 0,
				"can_reward": false,
				"task": {
					"prize_key": "prize_coins",
					"index": 16,
					"id": 64729,
					"assets_config": "{\"display_end_time\":0,\"display_start_time\":1791971081,\"image_task_icon\":\"tw-11134001-820lh-mt3mzossfqip4f\"}",
					"action_key": "act_browse_product_ads",
					"cta_url": "",
					"prize_value": "0.08",
					"cycle_type": "per_day",
					"task_name": "瀏覽 推薦商品 30秒(2/2)",
					"cooldown_time": 0,
					"cta_url_type": 1,
					"cta_req_payload": "",
					"join_times": 1,
					"finish_times": 1,
					"reward_times": 1,
					"shop_ads_custom": "07b3694ffd4849c6c4b3e4c400aa83b63a490358a043c812b55a3fb882306b888c7438cd7a4ee690ffaf34e348d05036c1d2312ccd3d96f3",
					"action_type": 1
				},
				"task_status": 3,
				"is_highlight": false
			}
		],
		"task_module_id": 567
	}
};

let UrlData = [[],
['GET', '取得任務清單', '1', 'https://games-dailycheckin.shopee.tw/mkt/coins/api/v3/tasks?device_id={device_id}&is_supported_widget=true&s={s}112345678901212&view_all_task=false', '', ['device_id', 's'], ProcData1],
['GET', '02 取得ℹ️限時瀏覽優選商店資訊', '2', 'https://games.shopee.tw/gameplatform/api/v3/task/browse/{taskIdModuleId}', '', ['taskIdModuleId'], ProcData2],
// ['GET', '02 取得ℹ️限時瀏覽優選商店資訊', '2', 'https://games.shopee.tw/gameplatform/api/v3/task/browse/{taskId}?module_id={task_module_id}', '', ['taskId', 'task_module_id'], ProcData2],
['POST', '03 完成限時瀏覽優選商店1', '3', 'https://games.shopee.tw/gameplatform/api/v3/task/component/report', '', , ProcData00],
];

let DataPostBodyList = [, , , { "report_token": "" }
	, , , , , ,
];

function preInit() {
	config.deviceId = config.shopeeInfo.tokenAll.SPC_F;
	config.device_id = config.shopeeInfo.tokenAll.SPC_F;
	config.userId = config.shopeeInfo.userId;
	config.task_module_id = '';
	config.taskIdModuleId = '';
	config.canReward = false;
	config.hasTask = false;
	config.token = '';
	config.task = null;
	config.shop_id = '';
	config.AC_CERT_D = '';
	// console.log(config.shopeeInfo);
	// config.s = Aegis.aegisEncrypt(config.shopeeInfo.userId + '|' + parseInt(Date.now() / 1000).toString());
	config.s = '';

	config.dfp = config.shopeeInfo.checkinPayload.dfp;
	if (config.shopeeInfo.RiskTokenRequest) {
		config.dfp = config.shopeeInfo.RiskToken.riskToken;
	}
	config.taskId = '';
	config.RoundCount = 0;
	config.browse_time_range = 0;

}
const forMaxCount = 9;
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
			item = -1;
			if (i == 1) {
				config.s = Aegis.aegisEncrypt(config.userId + '|' + parseInt(Date.now() / 1000).toString());
				// ProcData1(JSON.stringify(firstData), null);
				// i++;
			}
			if (i === 2) {
				config.report_token = '';
				config.taskId = '';
				config.RoundCount++;
				console.log(`\n\n第 ${config.RoundCount} 回`);
			}
			if (i == 3) {
				if (config.report_token != '') {
					DataPostBodyList[i].report_token = config.report_token;
					// console.log(DataPostBodyList[i]);
					await delay(config.browse_time_range * 1.0 + 0.5);
				}
				else {
					console.log('沒有任務');
					break;
				}

			}


			let dc = GetDataConfig(i);
			// let dc = GetDataConfig(i);
			// if (i == 3) {
			// console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);
			// 	console.log(dc);
			// console.log(dc.dataRequest.headers);

			// 	flag = false;
			// }
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}
			if (i >= 3) { i = 0; }
			if (runCount >= forMaxCount) { break; }
			if (runCount > 15) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
		}
		console.log('');
		let msg = '✅ 處理已完成';
		// console.log(msg);
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
