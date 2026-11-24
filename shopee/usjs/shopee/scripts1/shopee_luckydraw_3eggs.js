// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

let caption = '「寶箱」活動 (玩寶箱遊戲1次 (特蒐任務 領機會1次))';
let title = '自動抽' + caption;
const version = 'v20230913';
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
		let found = true;
		let json = JSON.parse(data);
		let activityData = {};
		let b1 = json.data.banners;
		for (let i = 0; i < b1.length; i++) {
			let b2 = b1[i].banners;
			for (let j = 0; j < b2.length; j++) {
				let b = b2[j];
				let t = new Date().getTime() / 1000;
				if (b.start < t && b.end > t) {
					let np = b.navigate_params;  // box / 3eggs
					let re = new RegExp('^https:\/\/games\.shopee\.tw\/luckydraw-v2\/\\?game=3eggs&activity=([0-9a-z]+)(&.+)?', 'i');
					if (np.url.match(re)) {
						config.activityId = np.url.replace(re, '$1');
						let re2 = new RegExp('.+&source=(\\d)', 'i');
						let s = '0';
						if (np.url.match(re2)) { s = np.url.replace(re2, '$1'); }
						// console.log(np.url);
						// console.log(config.activityId);
						// console.log(s);
						activityData = {
							'id': config.activityId,
							'title': np.navbar.title,
							'source': parseInt(s)
						};
						console.log(`${i}-${j}:${activityData.id}`);
						config.luckydraw.push(activityData);
						//break;
					}
				}
			}
		}
		return resolve(found);
	});
}
async function ProcData2(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;
		let json = JSON.parse(data);
		let ds = json.data.iframe_list;
		let activityData = {};
		for (let i = 0; i < ds.length; i++) {
			const d = ds[i];
			let re = new RegExp('^https:\/\/games\.shopee\.tw\/luckydraw-v2\/\\?game=3eggs&activity=([0-9a-z]+)(&.+)?', 'i');
			if (d.url.match(re)) {
				config.activityId = d.url.replace(re, '$1');
				let re2 = new RegExp('.+&source=(\\d)', 'i');
				let s = '0';
				if (d.url.match(re2)) { s = d.url.replace(re2, '$1'); }
				// console.log(d.url);
				// console.log(config.activityId);
				// console.log(s);
				activityData = {
					'id': config.activityId,
					'title': d.title,
					'source': parseInt(s)
				};
				console.log(`${i}:${activityData.id}`);
				config.luckydraw.push(activityData);
				//break;
			}
		}
		return resolve(found);
	});
}
async function ProcData3(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			let found2 = 0;
			let basic = json.data.basic;
			let modules = json.data.modules;
			let activity = json.data.activity;
			let ndt = new Date().getTime();
			let dbt = 0;
			let det = 0;
			if (basic.hasOwnProperty('begin_time')) { found2++; dbt = new Date(basic.begin_time * 1000); }
			if (basic.hasOwnProperty('end_time')) { found2++; det = new Date(basic.end_time * 1000); }
			if (basic.hasOwnProperty('game_name')) { found2++; console.log(`名稱G : ${basic.game_name}`); config.gname = basic.game_name; }
			if (basic.hasOwnProperty('slot_name')) { found2++; console.log(`名稱S : ${basic.slot_name}`); }
			if (found2 < 4 && json.data.activity) {
				if (activity.hasOwnProperty('activity_name')) { console.log(`名稱G : ${activity.activity_name}`); config.gname = activity.activity_name; }
			}
			if (found2 >= 4) {
				config.t_id = '3e'; // 豪禮尋寶記
				// if (config.gname.includes('免運寶箱')) { config.t_id = 'B'; }
				// else if (config.gname.includes('蝦幣寶箱')) { config.t_id = 'C'; }
				// else if (config.gname.includes('抽抽樂') || config.gname.includes('蝦蝦寶箱')) { config.t_id = 'D'; }
				if (ndt < det.getTime()) {
					config.event_code = basic.event_code;
					console.log(`EID : ${config.event_code}`)
					for (let i = 0; i < modules.length; i++) {
						if (modules[i].owner === "activity" && modules[i].module_name === 'Service.CHANCE') {
							found = true;
							config.module_id = modules[i].module_id;
							console.log(`MID : ${config.module_id}`)
						} // config.t_id != '3e' && 
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
					console.log('\n活動已結束。');
				}
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
		config.hasChance = false;
		config.hasShareChance = false;
		if (json.code === 0) {
			let jd = json.data;
			// console.log(`⭕️ 執行成功 💯`);
			// console.log(jd.daily_chance);
			// console.log(jd.order_chance);
			// console.log(jd.share_chance);
			// console.log(jd.extra_chance); // 
			// console.log(jd.daily_chance_limit);
			// console.log(jd.share_limit); //
			// console.log(jd.share_remain);
			// console.log(jd);
			// console.log(`每日機會 : ${jd.daily_chance}/${jd.daily_chance_limit}`);
			// console.log(`其它機會 : ${jd.order_chance}/${jd.order_chance_limit}`);
			// console.log(`分享機會 : ${jd.share_chance}`);
			// console.log(`分享取得機會 : ${jd.share_remain}/${jd.share_limit}`);
			let chance = jd.daily_chance + jd.order_chance + jd.share_chance;
			if (jd.hasOwnProperty('extra_chance')) chance += jd.extra_chance;
			let chance_limit = jd.daily_chance_limit;
			if (jd.hasOwnProperty('extra_chance')) chance_limit += jd.extra_chance;
			if (jd.hasOwnProperty('share_limit')) chance_limit += jd.share_limit;

			if (jd.share_remain > 0) {
				found = true;
				config.hasShareChance = true;
			}
			else if (jd.hasOwnProperty('share_limit') && jd.share_limit > 0) {
				console.log(`今日分享已領過❤️`);
			}
			else {
				console.log(`此活動沒有分享機會😢`);
			}
			if (chance > 0) {
				config.chance = chance;
				console.log(`剩餘機會 : ${chance}/${chance_limit}`);
				config.hasChance = true;
				found = true;
			}
			else {
				console.log(`今日有 ${chance_limit} 機會，已用完⭕️`);
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
				if (json.data.incr_share > 0) {
					loonNotify(`獲得機會 ${json.data.incr_share} 次`);

					try {
						let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
						let tsn = 'shopees';
						let tsid = config.t_id + 'S';
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
					console.log(`今天已領過`);
				}
			}
			else {
				return reject([`執行失敗 ‼️`, json.msg, data]);
			}
		} catch (e) { console.log(e); }
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
					//if (t.type >= 1 && t.type <= 2) {
					if (t.type === 1) {
						try {
							let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
							let tsn = 'shopees';
							let tsid = config.t_id + (t.type === 2 ? 'E' : 'B');
							let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
							let tasks = JSON.parse(rs);
							let ts = {}, s = {};
							if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
							if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
							s.s++;
							if (s.s > 0 && s.c > 0) { s.s = s.s - s.c; }
							ts[tsid] = s;
							tasks[tsn] = ts;
							$persistentStore.write(JSON.stringify(tasks), dataName);
						} catch (e) { console.log(e); }
					}
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
				if (s.s > 0) { s.s--; }
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

async function ProcData7(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			if (json.msg === 'success') {
				found = true;
				config.chance--;
				const packageName = json.data.package_name;
				let msg = '🔆' + packageName;
				if (!packageName === '再接再厲') {
					let sN = showNotification;
					showNotification = true;
					loonNotify('領取成功 ✅', '獲得 👉 ' + packageName + ' 💎');
					showNotification = sN;
				}
				else {
					let sN = showNotification;
					showNotification = false;
					loonNotify('領取成功 ✅', '獲得 👉 ' + packageName + ' 💎');
					showNotification = sN;
				}
				try {
					console.log(json.data.prize.settings.ar_notify_title);
					console.log(json.data.prize.settings.ar_notify_body);
				} catch (error) {

				}
				try {
					let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
					let tsn = 'shopees';
					let tsid = config.t_id;
					let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
					let tasks = JSON.parse(rs);
					let ts = {}, s = {};
					if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
					if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
					s.c++;
					s.f = true;
					s.d.push(msg.replace(/\n/g, ''));
					//s.r += '\n' + ;
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

let UrlData = [[],
['POST', '取得banner活動清單', '取得', 'https://mall.shopee.tw/api/v4/banner/batch_list', '', , ProcData1],
['GET', '取得iframe活動清單', '取得', 'https://mall.shopee.tw/api/v4/market_coin/get_iframe_list?region=TW&offset=0&limit=10', '', , ProcData2],
['GET', '取得活動資訊', '取得', 'https://games.shopee.tw/gameplatform/api/v1/game/activity/{activityId}/settings?appid={appid}&basic=false', '', ['appid', 'activityId'], ProcData3],

['GET', '04 取得任務資訊', '取得', 'https://games.shopee.tw/luckydraw/api/v1/activity/{activityId}/task/list?app_id={appid}&request_id={token}', '', ['activityId', 'appid', 'token'], ProcData13],
['GET', '05 取得瀏覽任務 Token', '獲得', 'https://games.shopee.tw/gameplatform/api/v3/task/browse/{task_code}?module_id={task_module_id}', '', ['task_code', 'task_module_id'], ProcData14],
['POST', '06 送出瀏覽任務 Token', '獲得', 'https://games.shopee.tw/gameplatform/api/v3/task/component/report', '', , ProcData15],
['POST', '07 取得瀏覽任務機會', '獲得', 'https://games.shopee.tw/luckydraw/api/v1/task/claim', '', , ProcData16],

['GET', '08 取得活動次數', '取得', 'https://games.shopee.tw/gameplatform/api/v1/chance/{module_id}/event/{event_code}/query?appid={appid}', '', ['appid', 'module_id', 'event_code'], ProcData4],
['POST', '09 分享活動取得一次', '獲得', 'https://games.shopee.tw/gameplatform/api/v2/event/{event_code}/chance/share/{module_id}?appid={appid}', '', ['appid', 'event_code', 'module_id'], ProcData5],
['GET', '10 取得活動次數', '取得', 'https://games.shopee.tw/gameplatform/api/v1/chance/{module_id}/event/{event_code}/query?appid={appid}', '', ['appid', 'module_id', 'event_code'], ProcData4],
['POST', '11 領取活動獎勵', '執行', 'https://games.shopee.tw/luckydraw/api/v1/lucky/event/{event_code}', '', ['event_code'], ProcData7],
];
let DataPostBodyList = [, {
	"types": [{ "type": "coin_carousel" }, { "type": "coin_square" }]
}, , , , ,
	{ 'report_token': '' },
	{
		"module_id": "254",
		"request_id": "",
		"task_id": 4893
	}, , {}, ,
	{
		// 'schedule_ldc_id': 0,
		'request_id': 0,
		'app_id': 'appid',
		'activity_code': 'activityId',
		'source': 0,
	},
];
function preInit() {
	config.SPC_U = config.shopeeInfo.tokenAll.SPC_U;
	config.userName = config.shopeeInfo.userName;
	config.luckydraw = [];
	config.luckydraw_index = -1;
	config.shopeeHeaders['x-user-id'] = config.shopeeInfo.tokenAll.SPC_U;
	config.shopeeHeaders['x-csrftoken'] = config.shopeeInfo.csrfToken;
	config.appid = 'iRQdOrGCUUylcBNa8I'; // luckydraw-2  // 3eggs
	config.activityId = '';
	config.activityName = '';
	config.event_code = '';
	config.module_id = 0;
	config.hasChance = false;
	config.hasShareChance = false;
	config.caption = caption;
	config.title = title;
	config.source = 0;
	config.chance = 0;
	config.end_time = new Date('2023/09/18 23:59:59').getTime();

	config.tasks_isok = false;

	try {
		let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
		let tsn = 'shopees';
		let tsid = '3e';
		let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
		let tasks = JSON.parse(rs);
		let ts = {}, s = {};
		if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
		if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
		config.tasks_isok = s.f;
		ts[tsid] = s;
		tasks[tsn] = ts;
		$persistentStore.write(JSON.stringify(tasks), dataName);
	} catch (e) { console.log(e); }

}

const forMaxCount = 50;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	try {
		await preCheck();
		preInit();
		if (new Date().getTime() > config.end_time) {
			throw ([`執行失敗 ‼️`, '活動已過期 : ' + new Date(config.end_time).format()]);
		}

		let flag = true;
		let runCount = 0;
		let item = -1;
		if (config.tasks_isok) { console.log('玩寶箱遊戲1次 (特蒐任務 領機會1次)。✅已完成✅'); flag = false; }
		for (let i = 1; i < UrlData.length; i++) {
			if (!flag) { break; }
			item = -1;
			runCount++;
			if (i === 3) {
				config.task_module_id = 0;
				config.luckydraw_index++;
				if (config.luckydraw.length > config.luckydraw_index) {
					config.activityId = config.luckydraw[config.luckydraw_index].id;
					config.activityName = config.luckydraw[config.luckydraw_index].title;
					config.source = config.luckydraw[config.luckydraw_index].source;
					caption = config.activityName;
					title = config.activityName;
					console.log(`\n\n${config.luckydraw_index + 1} 活動名稱 : ${config.activityName} (${config.activityId})`);
				}
				else {
					flag = false;
					break;
				}
			}
			else if (i === 9) {
				if (config.hasShareChance) { }
				else {
					i = 11;
					flag = config.hasChance;
				}
			}
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

			if (i === 11) {
				DataPostBodyList[i].activity_code = config.activityId;
				DataPostBodyList[i].request_id = getRnd();
				DataPostBodyList[i].app_id = config.appid;
				DataPostBodyList[i].source = config.source;
				// DataPostBodyList[i].schedule_ldc_id = config.schedule_ldc_id;
				// console.log(DataPostBodyList[i]);
			}
			let dc = GetDataConfig(i);
			//console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);
			//if (i === 9) { console.log(dc); }
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}

			if (runCount >= forMaxCount) { console.log(`超過執行限制次數 ${forMaxCount}，中止執行。`); break; }
			if (runCount > 30) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };

			if (flag && i === 7) { i = 3; }
			else if (!flag && i === 4) { i = 7; flag = true; }

			//if (flag && i >= 7) { await delay(3.0); i = 5; } 

			// if (flag && i >= 11) { if (config.chance > 0) { await delay(3.0); i = 10; } }
			// 僅做每日任務 1 次 for collectible
			if (flag && i >= 11) { flag = false; break; }

			//if (!flag && (i === 4)) { flag = true; }
			if (!flag && (i === 3 || i === 8 || i === 10) || flag && i === 11) {
				// console.log(`DATA : ${config.luckydraw.length}\t${config.luckydraw_index}`)
				if (config.luckydraw.length > config.luckydraw_index) {
					i = 2; flag = true;
				}
			}
			if (flag && i >= 8) await delay(0.5);
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

