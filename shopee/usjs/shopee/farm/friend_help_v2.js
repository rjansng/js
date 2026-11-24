

// ver 20261014
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

let caption = '幫好友澆水';
let title = '自動' + caption;
const version = 'v20261014';
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
			'User-Agent': shopeeInfo.userAgent,
			'x-csrftoken': shopeeInfo.csrfToken,
			// 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=31208 appver=31208 rnver=1700038988 shopee_rn_bundle_version=5096019 Shopee language=zh-Hant app_type=1 games_runtime=1 runtime_ver=1.0.53 game_bundle=5234 Cronet/102.0.5005.61',
			// 'games-runtime': 'GamesRuntime',
			// 'fruit-version-type': 'native',

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
		console.log('✅ 檢查成功\n');
		return resolve();
	});
}
// some true ,  every false

async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;
		let obj = JSON.parse(data);
		if (obj.code === 0) {
			for (let i = 0; i < obj.data.friends.length; i++) {
				let f = obj.data.friends[i];
				f.Err = false;
				if (!(config.friends.some(x => x.id == f.id))) {
					config.friends.push(f);
				}
			}
			console.log(`本次好友數 ${obj.data.friends.length}`);
			if ('userWater' in obj.data && obj.data.userWater) {
				config.userWater = obj.data.userWater;
			}
			if ('page' in obj.data && obj.data.page) {
				config.page = obj.data.page;
			}
			if (config.friends.length > 0) {

			}
			else {
				console.log('沒有朋友');
				found = false;
			}
		}
		//console.log(fss);
		return resolve(found);
	});
}
async function ProcData2(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let obj = JSON.parse(data);
		if (obj.code === 0) {
			var user = obj.data.user;
			var crop = obj.data.crops[0];
			let f = config.friends[config.friendIndex];
			config.cropId = crop.id;
			console.log(`${user.id} ${user.name} (${f.contactName}) : ${crop.meta.name}`);
			try {
				config.fss.some((x, i) => {
					if (x.id === user.id) {
						config.fss[i].name = user.name;
						config.fss[i].cropName = crop.meta.name;
						config.fss[i].cropTime = new Date().getTime();
						return true;
					}
				});
				$persistentStore.write(JSON.stringify(config.fss), 'FarmFriendHelpStatus' + _ShopeeUserID);
			} catch (error) { }
			if (crop.lifeStatus == 1) {
				console.log('️❌作物已死亡');
			}
			else if (crop.state == 100) {
				console.log('🌱作物已經可以收成了');
			} else if (crop.state >= 101) {
				console.log('🌱物已收成');
			}
			else if (obj.data.interactData.friendTotalHelpedCnt >= obj.data.userOrchardMeta.maxAcceptFriendHelpPerDay) {
				console.log('🚫已接收最大限制');
			}
			else {
				// console.log(`friendTotalHelpedCnt : ${obj.data.interactData.friendTotalHelpedCnt}`);
				// console.log(`maxAcceptFriendHelpPerDay : ${obj.data.userOrchardMeta.maxAcceptFriendHelpPerDay}`);
				found = true;
			}
		}
		else {
			console.log('❌執行失敗。' + obj.msg);
			console.log(data);
		}
		return resolve(found);
	});
}
async function ProcData3(data, dc) {
	return new Promise((resolve, reject) => {
		let found = true;
		let obj = JSON.parse(data);
		if (obj.code === 0) {
			console.log(`幫助澆水，獲得 ${obj.data.helpWaterSelfExp} 滴水。`)
			// console.log(obj);
			// console.log(`💦 成功 ${config.totalHelpFriendCount - config.remainingHelpFriendCount + 1}`);
			// config.remainingHelpFriendCount--;
		}
		else {
			if (obj.code === 409012 || obj.code === 404000) {
				for (let j = 0; j < config.friends.length; j++) {
					let f = config.friends[j]; if (f.id == DataPostBodyList[3].friendId) {
						config.friends[j].Err = true;
						config.friends[j].interactData.gaveWater = false;
					}
				}
				config.userWater.remainingHelpFriendCount++;
				config.friendsHelpErr.friends.push(DataPostBodyList[3].friendId);
				if (obj.code === 404000) {
					console.log('找不到作物。');
				}
				else {
					console.log('接受幫助已達上限。');
				}
			}
			else {
				console.log('❌ 失敗！\n' + obj.msg);
				console.log(data);
			}
		}

		return resolve(found);
	});
}


let UrlData = [[],
['GET', '取得好友清單1', '取得', 'https://games.shopee.tw/farm/api/friend/v2/list?source=&offset=&need_recommend=true&device_id={deviceId}&is_ban_contact=true', '', ['deviceId'], ProcData1],
['GET', '取得好友清單2', '取得', 'https://games.shopee.tw/farm/api/friend/v2/list?source=1&offset=99&need_recommend=false&device_id={deviceId}&is_ban_contact=false', '', ['deviceId'], ProcData1],
//['!GET', '取得好友資訊', '取得', 'https://games.shopee.tw/farm/api/friend/orchard/context/get?friendId={friendId}', '', ['friendId'], ProcData2],
['POST', '幫好友澆水', '執行', 'https://games.shopee.tw/farm/api/friend/v2/help', '', , ProcData3],
];
let DataPostBodyList = [, , , {
	"friendId": 123,
	"friendAvatar": "",
	"cropId": 0,
	"deviceId": "123",
	"scenarioType": 2,
	"friendName": "a***8",
	"s": "AAAAAAAAAAAAAAAAAAAAAHU",
	"encryptFID": "AAAAAAAAAAAAAAAAAAAAAO",
	"friendType": 6,
	"shareKey": ""
},
];
// 32536572 daisquirrel 手動 4蝦幣
// 主要的好友 // sdany9357,sdany5751,jieguan285,zongancai,danny335201314,summer520wind,mybaby7023,eason101520,ww2feel,jen,i12
// let friendsList = [681985929, 732423754, 918908158, 43980511, 313955569, 140595219, 16079058, 981988128, 58710081, 964204346, 664774607];
let friendsList = [];

function preInit() {
	config.friendId = '';
	config.friendIndex = -1;
	config.deviceId = config.shopeeInfo.tokenAll.SPC_F;
	config.userid = config.shopeeInfo.tokenAll.userid;
	config.cropId = '';
	config.caption = caption;
	config.title = title;
	config.friends = [];
	config.friendsHelpErr = JSON.parse($persistentStore.read('ShopeeFriendsHelpErr' + _ShopeeUserID) || '{ "lastDate": 0, "friends": [] }');

	let ldt = new Date((new Date()).format('2')).getTime();

	if (config.friendsHelpErr == {} || config.friendsHelpErr.lastDate < ldt) {
		config.friendsHelpErr = { lastDate: ldt, friends: [] };
	}

	// config.shopeeCropToken = $persistentStore.read('ShopeeCropToken' + _ShopeeUserID) || '';
	// let shopeeFarmInfo = getSaveObject('ShopeeFarmInfo' + _ShopeeUserID);
	// config.shopeeCropToken = shopeeFarmInfo.currentCrop.s;
	// DataPostBodyList[3].s = config.shopeeCropToken;
	// config.totalHelpFriendCount = 0;
	// config.remainingHelpFriendCount = 0;
	// friendsList.some((x, i) => { if (x.toString() === config.userid) { friendsList.splice(i, 1); return true; } });
	// config.friendsCount = friendsList.length;

	// let ShopeeFarmFriendInfo = getSaveObject('ShopeeFarmFriendInfo' + _ShopeeUserID);
	// config.FriendInfo = ShopeeFarmFriendInfo;
	config.userWater = null;
	// let tt = Date.now();
	// DataPostBodyList[3].friendId = 140595219;
	// DataPostBodyList[3].s = Aegis.generateS(tt, config.userid, 1);
	// DataPostBodyList[3].encryptFID = Aegis.generateEncryptFID(DataPostBodyList[3].friendId, tt);
}

const forMaxCount = 40;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	console.log(`${new Date().format('0')}`);
	try {
		// console.log('1');
		await preCheck();
		// console.log('2');
		preInit();
		// console.log('3');
		let flag = true;
		let runCount = 0;
		let item = -1;
		let kCount = 0;
		for (let i = 1; i < UrlData.length; i++) {
			if (!flag) { break; }
			// console.log(i);
			item = -1;
			// i = 3;
			if (i === 2) {
				if ('has_next_page' in config.page && config.page.has_next_page == true) {
					config.source = config.page.source;
					config.offset = config.page.offset;
				}
				else {
					i++
				}
			}

			if (i === 2) {
				// runCount++;
				// if (config.remainingHelpFriendCount - config.friendsCount > 0) {
				// 	config.friendIndex++;
				// 	let found = false;
				// 	for (let i = config.friendIndex; i < config.friends.length; i++) {
				// 		let f = config.friends[i];
				// 		config.friendId = f.id;
				// 		//item = config.remainingHelpedCount;
				// 		found = true;
				// 		break;
				// 	}
				// 	flag = found;
				// 	if (!found) {
				// 		break;
				// 	}
				// }
				// else {
				// 	flag = false;
				// 	console.log(`🧡幫好友澆水已達上線 ${config.totalHelpFriendCount - config.remainingHelpFriendCount}`);
				// 	if (config.friendsCount > 0 && config.remainingHelpFriendCount > 0) {
				// 		console.log(`❤️ ${config.friendsCount} 給預設名單上的好友，可以手動澆給其他人`);
				// 	}
				// 	break;
				// }
				// i++;
			}
			if (i == 3) {

				// DataPostBodyList[i].cropId = config.cropId;
				// DataPostBodyList[i].friendId = config.friendId;
				/*
				config.friendId = 43980511;

				let ShopeeFarmWaterToken = null;
				let ShopeeFarmInfoWaterToken = JSON.parse($persistentStore.read('ShopeeFarmInfoWaterToken' + _ShopeeUserID) || '{"token":[],"body":null}');
				if (ShopeeFarmInfoWaterToken.token.length == 0) {
					//found = false;
					console.log('沒有TOKEN無法澆水。');
					//$done({});
				}
				else {
					ShopeeFarmWaterToken = ShopeeFarmInfoWaterToken.token[ShopeeFarmInfoWaterToken.token.length - 1];
				}
				if (ShopeeFarmWaterToken && config.FriendInfo.hasOwnProperty(`${config.friendId}`)) {
					// console.log(ShopeeFarmWaterToken);
					DataPostBodyList[i] = JSON.parse(config.FriendInfo[`${config.friendId}`].body);
					console.log(DataPostBodyList[i]);
					// console.log(DataPostBodyList[i]);
					DataPostBodyList[i].cropId = 0;
					DataPostBodyList[i].s = ShopeeFarmWaterToken;
					console.log(DataPostBodyList[i]);
				}
				else {
					console.log(`沒有好友 ${config.friendId} 資料，請先幫好友澆水一次。`);
					break;

				}
					*/

				// console.log(config.friends);
				// console.log(config.fss);
				// flag = false;
			}
			if (i == 2) {
			}
			//console.log(`\n🌐 ${dc.method} URL : ${dc.url}\n`);
			if (i == 3) {
				for (let j = 0; j < config.friends.length; j++) { config.friends[j].Err = false; }
				console.log(`總好友數：${config.friends.length}`);
				// console.log(config.userWater);
				let foundX = false;
				// console.log(config.userWater);
				if (config.userWater != null && config.userWater.remainingHelpFriendCount > 0) {
					let haveHelpCount = 0;
					for (let j = 0; j < config.friends.length; j++) {
						let f = config.friends[j];
						if (f.interactData.gaveWater) { haveHelpCount++; }
					}
					console.log(`可幫助澆水 ${config.userWater.remainingHelpFriendCount}，已幫助 ${haveHelpCount}`);
					console.log(`幫助已滿 ${config.friendsHelpErr.friends.length}`);
					// dc.headers = config.FriendInfo[`${config.friendId}`].headers;
					for (let j = 0; j < config.friends.length; j++) {
						// console.log(j + 1);
						let f = config.friends[j];

						if (config.friendsHelpErr.friends.some(x => x == f.id)) { config.friends[j].Err = true; }

						if (f.Err != null && !f.Err && !f.interactData.gaveWater && f.cropState < 100) {
							console.log(`${f.id} ${f.name}`);
							let tt = Date.now();
							DataPostBodyList[i].friendId = f.id;
							DataPostBodyList[i].friendName = f.name;
							DataPostBodyList[i].deviceId = config.deviceId;
							kCount++;
							DataPostBodyList[i].s = Aegis.generateS(tt, config.userid, kCount);
							DataPostBodyList[i].encryptFID = Aegis.generateEncryptFID(DataPostBodyList[i].friendId, tt);

							// sortType 0 > 6   , 1 > 3 , 2 > 4 , 3 > 7
							DataPostBodyList[i].friendType = f.sortType == 0 ? 6 : (f.sortType == 1 ? 3 : (f.sortType == 2 ? 4 : (f.sortType == 3 ? 7 : 9)));

							// 設定為已幫助
							config.friends[j].interactData.gaveWater = true;
							config.userWater.remainingHelpFriendCount--; // 409012
							foundX = true;
							break;
						}
						// else {
						// 	if (f.interactData.gaveWater) { console.log('已幫助'); }
						// 	else if (f.Err) { console.log('上限'); }
						// 	else if (f.cropState >= 100) { console.log('已滿'); }
						// 	else { console.log('其它') };
						// }
					}
				}
				if (!foundX || config.userWater.remainingHelpFriendCount == 0) { flag = false; }
				// console.log(DataPostBodyList[i]);
				//flag = false;
			}
			// console.log(DataPostBodyList[i]);
			let dc = GetDataConfig(i);
			// console.log(dc);
			if (flag && dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (flag && dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}

			if (runCount >= forMaxCount) { console.log(`超過執行限制次數 ${forMaxCount}，中止執行。`); break; }
			if (runCount > 30) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
			//flag = false;

			// if (i === 2 && !flag) {
			// 	i--;
			// 	flag = true;
			// 	// await delay(0.1);
			// }
			if (i === 3 && flag) {
				//i = 1;
				i = 2;
				// flag = true;
				await delay(1.0);
			}
			else if (i === 3 && !flag) {
				break;
			}
			// console.log(`end ${i}`);

		}
		console.log('');
		// console.log(JSON.stringify(config.fss).replace(/,"last/ig, ',\n"last').replace(/},/ig, '},\n'));
		// console.log('\n有果園狀態');
		// config.fss.forEach((x, xi) => {
		// 	console.log(`${(xi + 1).toString().padStart(2, ' ')}: ${x.id} (${x.name}) ${x.helpMe} (${x.cropName})`);
		// });
		console.log('');
		let msg = '✅ 處理已完成';
		console.log(msg);
		// console.log(config.friendsHelpErr);
		$persistentStore.write(JSON.stringify(config.friendsHelpErr), 'ShopeeFriendsHelpErr' + _ShopeeUserID);

		// try {
		// 	let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
		// 	let tsn = 'farm' + 's';
		// 	let tsid = 'E';
		// 	let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
		// 	let tasks = JSON.parse(rs);
		// 	let ts = {}, s = {};
		// 	if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
		// 	if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
		// 	s.c = config.totalHelpFriendCount - config.remainingHelpFriendCount
		// 	s.s = config.remainingHelpFriendCount;
		// 	s.f = s.c > 0 && s.s === 0;
		// 	ts[tsid] = s;
		// 	tasks[tsn] = ts;
		// 	$persistentStore.write(JSON.stringify(tasks), dataName);
		// } catch (e) { console.log(e); }

		// loonNotify(msg);
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
