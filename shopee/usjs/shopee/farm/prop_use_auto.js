// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '自動使用 澆水好朋友、特大號水壺、水量補充包 道具';
const title = '蝦蝦果園 ' + caption;
const version = 'v20230720';
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
		console.log('✅ 檢查成功\n');
		return resolve();
	});
}

async function ProcData1(data, dc) {
	return new Promise((resolve, reject) => {
		// console.log(`⭕️ 執行成功 💯`);
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			let crop = json.data.crops[0];
			config.cropId = crop.id;
			console.log(`目前作物: ${crop.meta.name}`); // (${config.cropId})
			if (crop.lifeStatus === 1) {
				console.log('作物已死亡');
			}
			else if (crop.state < 100) {
				found = true;
				let mc = crop.meta.config;
				let totalExp = mc.totalExp;
				let needExp = totalExp;
				for (let i = 1; i <= 3; i++) {
					let mclc = mc.levelConfig[i];
					if (crop.state > i) { needExp -= mclc.exp; }
					else if (crop.state == i) {
						needExp -= crop.exp;
					}
				}
				config.needExp = needExp;
				console.log(`還需要水量: ${needExp}`);

				// console.log(json.data.prop);
				if (json.data.prop) {
					let msg = '使用中道具: ';

					let prop = json.data.prop;
					msg += `${prop.itemId}\t${prop.itemName} ${prop.parameter}`;
					if (item_list.some(x => { if (x.id == prop.itemId) { return true; } })) {
					}
					else {
						msg += '\t(未列表道具)';
					}
					// found = false;
					msg += `\n\t道具使用中，目前無法再使用 澆水好朋友、特大號水壺 道具`;
					console.log(msg);
					config.canUse = false;
				}

				if (needExp < 1200) {
					config.canUseExp = false;
					config.canUse = false;
					// found = false;
					console.log(`作物 需要水滴小於 1200，不使用道具。`);
				}

				console.log('');

			}
			else if (crop.state === 100) {
				console.log('作物可以收成了');
			}
			else if (crop.state >= 101) {
				console.log('作物已收成');
			}
		} else {
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
			found = true;
			let props = json.data.props;
			config.props = props;
			props.forEach(ps => {
				console.log(`${ps.itemId}\t${[ps.name]}\t${[ps.parameter]} ${[ps.itemName]}\t${ps.amount}/${ps.stackLimit}`);
			});
			console.log('');
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
			console.log(`成功 使用 ${config.propItemName}`);

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'farm' + 's';
				let tsid = 'PU';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c++;
				s.f = s.c > 0;
				s.d.push(config.propItemName);
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
async function ProcData4(data, dc) {
	return new Promise((resolve, reject) => {
		let found = false;
		let json = JSON.parse(data);
		if (json.code === 0) {
			found = true;
			console.log(`成功 使用 ${config.propItemName} (${json.data.useNumber})`);
			config.needExp -= json.data.useNumber;
			console.log(`還需要水量: ${config.needExp}`);

			try {
				let dataName = 'ShopeeGamePlayed' + _ShopeeUserID;
				let tsn = 'farm' + 's';
				let tsid = 'PU';
				let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
				let tasks = JSON.parse(rs);
				let ts = {}, s = {};
				if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
				if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
				s.c++;
				s.f = s.c > 0;
				s.d.push(config.propItemName);
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

let item_list = [
	{ id: 2, name: '特大號水壺  25' },
	{ id: 3, name: '特大號水壺  50' },
	{ id: 15, name: '特大號水壺 100' },
	{ id: 13, name: '水量補充包  40' },
	{ id: 7, name: '水量補充包 100' },
	{ id: 6, name: '水量補充包 200' },
	{ id: 10, name: '水量補充包 300' },
	{ id: 4, name: '澆水好朋友  12' },
	{ id: 5, name: '澆水好朋友  24' },
];
let item_order1 = [15, 3, 2, 5, 4];
let item_order2 = [6, 7, 13];

let UrlData = [[],
['GET', '取得ℹ️作物資訊', '取得', 'https://games.shopee.tw/farm/api/orchard/context/get?skipGuidance=0', '', , ProcData1],
['GET', '顯示道具清單', '取得', 'https://games.shopee.tw/farm/api/prop/backpack/list?t={token}', '', ['token'], ProcData2],
['POST', '使用道具', '3', 'https://games.shopee.tw/farm/api/prop/use/v2', '', , ProcData3],
['POST', '使用道具', '4', 'https://games.shopee.tw/farm/api/orchard/crop/use_bottled_water', '', , ProcData4],
];
let DataPostBodyList = [, , ,
	{
		"propItemId": 0,
	},
	{
		"propItemId": 0,
		"cropId": 0
	}
];
function preInit() {
	config.needExp = 0;
	config.propItemId = 0;
	config.propItemName = '';
	config.canUse = true; // 可使用道具 1
	config.canUseExp = true; // 可使用道具 2
	config.props = [];
}

const forMaxCount = 5;
(async () => {
	console.log(`ℹ️ ${title} ${version}`);
	try {
		await preCheck();
		preInit();
		let flag = true;
		let runCount = 0;
		let item = -1;

		for (let i = 1; i < UrlData.length; i++) {
			if (!flag || !config.canUseExp) { break; }
			item = -1;
			if (i == 3) {
				if (config.canUse) {
					if (item_order1.some(io => { // 先使用 3/3 項目
						return config.props.some(ps => {
							if (ps.itemId == io && ps.amount > (ps.stackLimit - 1)) {
								console.log(`使用 ${ps.itemId}\t${[ps.name]}\t${[ps.parameter]} ${[ps.itemName]}\t${ps.amount}/${ps.stackLimit}`);
								config.propItemId = ps.itemId;
								config.propItemName = ps.itemName + ` ${ps.parameter}`;
								return true;
							}
						});

					})) {
						DataPostBodyList[i].propItemId = config.propItemId;
					}
					else {
						if (item_order1.some(io => {
							return config.props.some(ps => {
								if (ps.itemId == io) {
									console.log(`使用 ${ps.itemId}\t${[ps.name]}\t${[ps.parameter]} ${[ps.itemName]}\t${ps.amount}/${ps.stackLimit}`);
									config.propItemId = ps.itemId;
									config.propItemName = ps.itemName + ` ${ps.parameter}`;
									return true;
								}
							});

						})) {
							DataPostBodyList[i].propItemId = config.propItemId;
						}
						else {
							i++;
						}
					}
				} else {
					i++;
				}
			}
			if (i == 4) {
				if (config.canUseExp) {
					if (item_order2.some(io => {
						return config.props.some(ps => {
							if (ps.itemId == io && ps.amount > (ps.stackLimit - 1)) {
								console.log(`使用 ${ps.itemId}\t${[ps.name]}\t${[ps.parameter]} ${[ps.itemName]}\t${ps.amount}/${ps.stackLimit}`);
								config.propItemId = ps.itemId;
								config.propItemName = ps.itemName;
								return true;
							}
						});

					})) {
						DataPostBodyList[i].propItemId = config.propItemId;
						DataPostBodyList[i].cropId = config.cropId;
					}
					else {
						i++;
					}
				} else {
					i++;
				}
			}
			if (i >= 5) { break; }
			let dc = GetDataConfig(i);
			// console.log(`🌐 ${dc.method} URL : ${dc.url}`);
			if (dc.method === 'GET') {
				await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
			} else if (dc.method === 'POST') {
				await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
			}
			//if (flag && i >= 4) { i = 2; }
			if (runCount >= forMaxCount) { break; }
			if (runCount > 10) { console.log(`!! Need Debug !! ★★★ 迴圈 ${runCount}/${forMaxCount} ★★★`) };
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

