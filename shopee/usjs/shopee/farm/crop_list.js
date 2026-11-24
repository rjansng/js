// ver 20230702
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

const caption = '顯示 種子清單';
const title = '蝦蝦果園 ' + caption;
const version = 'v20240523';
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
		if (json.code === 0) {

			let ds2 = [];
			let ds = json.data.cropMetas;
			console.log(ds.length);
			let dn = new Date();
			let dnt = Date.now();
			let _dy = dn.getFullYear();
			let _dm = dn.getMonth();
			let _dd = dn.getDate();
			let hw = 50 / 3; // water/hour 50w/3h

			ds = ds.filter((d) => { return d.rewardMetaVo.type != 5 });
			// ds = ds.map((d) => d.rewardMetaVo.type != 5);
			console.log(ds.length);

			for (let j = 0; j < 30; j++) {

				dn = new Date(_dy, _dm, _dd + j);
				let dnd = (dn.getMonth() + 1) + '/' + dn.getDate();
				//console.log(dnd);
				for (let k = 0; k < 2; k++) {
					if (j === 0) {
						if (k === 0) { console.log('\n免蝦幣'); }
						else { console.log('\n需要蝦幣'); }
					}
					for (let i = 0; i < ds.length; i++) {
						let d = ds[i];
						if (!(k === 0 && d.price === 0 || k === 1 && d.price > 0)) { continue; }
						let sd = new Date(ds[i].config.startTime);
						let ed = new Date(ds[i].config.endTime);
						let dtnt = dnt >= sd && dnt < ed;
						let sdd = (sd.getMonth() + 1) + '/' + sd.getDate();
						let edd = (ed.getMonth() + 1) + '/' + ed.getDate();
						if (j === 0) {
							console.log(`${(i + 1).toString().padStart(3, '0')}:${(dtnt?'★':'')}${d.id},${sd.format('4')}-${ed.format('4')},${d.config.totalExp.toString().padStart(4, ' ')},${d.name}`);
							//console.log(`${(i + 1).toString().padStart(3, '0')}:${sd.format('4')}-${ed.format('4')},${d.rewardMetaVo.type},${d.price != 0 ? 1 : 0},${d.config.totalExp},${d.curNum}/${d.totalNum},${d.name}`);
						}
						if (!ds[i].flag && ds[i].price === 0
							&& (sd <= dn && ed >= dn || sdd === edd && sdd === dnd)
							&& !ds[i].name.includes("不含運") && !ds[i].name.includes("小時免費充電") && !ds[i].name.includes("蝦大")
							&& d.rewardMetaVo.type != 5 && (d.rewardMetaVo.type != 6 || d.rewardMetaVo.type === 6
								&& (ds[i].name.includes('蝦')
									|| ds[i].name.includes('免運')
									|| ds[i].name.includes('限量')
									|| ds[i].name.includes('天天抽')
									|| ds[i].name.includes('免費')
									|| ds[i].name.includes('咖啡')
									|| ds[i].name.includes('CAFE')
									|| ds[i].name.includes('道具')
									|| ds[i].name.includes('&優惠券')
									|| ds[i].name.includes('LiTV')
								))
						) {

							// && (
							// 	sdd != edd && 


							let needDays = parseFloat(ds[i].config.needDays);
							let totalExp = parseInt(ds[i].config.totalExp);
							if (!ds[i].thumbnailText.includes("天) ")) {
								let ii0 = false;
								if (ds[i].thumbnailText.match(/^\d+蝦幣$/i)) { ii0 = true; }
								let cct = 0; let h3 = 0; let h2 = 0; let ii = 0;
								while (cct < totalExp) {
									if (h2 === 12) { if (ii === 0 && ii0 || ii > 0) { cct += 880; } ii++; h2 = 0; }
									else { cct += hw; h3++; h2++; }
								}
								ds[i].thumbnailText = '(' + (Math.ceil((h3 / 24) * 10) / 10).toString() + '天) ' + ds[i].thumbnailText;
							}
							ds[i].flag = true;
							ds2.push(ds[i]);
						}
					}
				}
			}
			console.log('');
			// let isOD = false; // OneDay
			let isMC = false; // Master Crop
			let isMC2 = false; // Master Crop 2
			let isSC = false; // Second Crop
			let watchForCrop = $persistentStore.read('蝦蝦果園預種植作物名稱') || '4蝦幣';
			let watchForCrop2 = $persistentStore.read('蝦蝦果園預種植作物名稱2') || '';
			let watchForCropSS = '最高15蝦幣黃金樹;天天種簽到樹;簽到樹送道具;週末驚喜發財樹;天天種;天天抽;免運券'.split(';');
			// shopeeCropNameS = shopeeCropNameS.split(';')[0];
			// let shopeeCropNameI = $persistentStore.read('作物名稱的判斷') || '0';
			// shopeeCropNameI = shopeeCropNameI.split(';')[0];
			let CS = [];
			for (let i = 0; i < ds2.length; i++) {
				let d = ds2[i];
				let sd = new Date(ds2[i].config.startTime);
				let ed = new Date(ds2[i].config.endTime);
				console.log(`${(i + 1).toString().padStart(3, '0')}:${d.rewardMetaVo.type}:${sd.format('4')}-${ed.format('4')},${d.config.totalExp.toString().padStart(4, ' ')},${d.curNum.toString().padStart((d.curNum === 0 ? 1 : 5), ' ')}/${d.totalNum.toString().padStart(5, ' ')},${d.name}(${d.id})`);
				// if (!isOD && d.name.includes('一日限定')) {
				// 	$persistentStore.write(d.name, 'OD作物名稱');
				// 	$persistentStore.write(sd.format('2').replace(/\//g, '-'), 'OD日期');
				// 	isOD = true;
				// }
				// else 
				if (!isMC) {
					if (d.name.includes(watchForCrop) && d.totalNum > d.curNum && d.price == 0) {
						let ddt = (23 * 60 * 60) * 1000;
						// 現在時間 > 開始時間 - ddt  && 結束時間 - ddt > 現在時間
						if ((dnt > ds2[i].config.startTime - ddt) && (ds2[i].config.endTime - ddt) > dnt) {
							$persistentStore.write(`${d.id}`, '蝦蝦果園待種植作物ID');
							$persistentStore.write(`${d.name}`, '蝦蝦果園待種植作物名稱');
							console.log(`M ${d.id} ${d.name}`);
							isMC = true;
						}
					}
				}
				if (!isMC && !isMC2) {
					if (watchForCrop2!= '' && d.name.includes(watchForCrop2) && d.totalNum > d.curNum && d.price == 0) {
						let ddt = (23 * 60 * 60) * 1000;
						// 現在時間 > 開始時間 - ddt  && 結束時間 - ddt > 現在時間
						if ((dnt > ds2[i].config.startTime - ddt) && (ds2[i].config.endTime - ddt) > dnt) {
							$persistentStore.write(`${d.id}`, '蝦蝦果園待種植作物ID');
							$persistentStore.write(`${d.name}`, '蝦蝦果園待種植作物名稱');
							console.log(`M2 ${d.id} ${d.name}`);
							isMC2 = true;
						}
					}
				}
				watchForCropSS.some(c => {
					if (d.name.includes(c) && d.totalNum > d.curNum && d.price == 0 && d.config.totalExp <= 1000) {
						let ddt = (24 * 60 * 60) * 1000;
						// 現在時間 > 開始時間 - ddt  && 結束時間 - ddt > 現在時間
						if ((dnt > ds2[i].config.startTime - ddt) && (ds2[i].config.endTime - ddt) > dnt) {
							CS.push({ id: d.id, name: d.name });
							return true;
						}
					}
				});
			}
			if (!isMC && !isMC2) {
				$persistentStore.write(null, '蝦蝦果園待種植作物ID');
				$persistentStore.write(null, '蝦蝦果園待種植作物名稱');
			}
			if (CS.length > 0) {
				watchForCropSS.some(c => {
					return CS.some(cc => {
						if (cc.name.includes(c)) {
							$persistentStore.write(`${cc.id}`, '蝦蝦果園待種植作物ID_S');
							$persistentStore.write(`${cc.name}`, '蝦蝦果園待種植作物名稱_S');
							console.log(`S ${cc.id} ${cc.name}`);
							isSC = true;
							if (!isMC && !isMC2) {
								$persistentStore.write(`${cc.id}`, '蝦蝦果園待種植作物ID');
								$persistentStore.write(`${cc.name}`, '蝦蝦果園待種植作物名稱');
								isMC = true;
							}
							return true;
						}
					});
				});
			}
			else {
				$persistentStore.write(null, '蝦蝦果園待種植作物ID_S');
				$persistentStore.write(null, '蝦蝦果園待種植作物名稱_S');
			}
			// console.log(ds2[0]);
			// console.log(ds2[5]);

			console.log('');
			console.log('M ID: ' + $persistentStore.read('蝦蝦果園待種植作物ID'));
			console.log('M NAME: ' + $persistentStore.read('蝦蝦果園待種植作物名稱'));
			console.log('S ID: ' + $persistentStore.read('蝦蝦果園待種植作物ID_S'));
			console.log('S NAME: ' + $persistentStore.read('蝦蝦果園待種植作物名稱_S'));

		}
		else {
			return reject([`執行失敗 ‼️`, json.msg, data]);
		}
		return resolve(found);
	});
}



let UrlData = [[],
['GET', '顯示種子清單', '取得', 'https://games.shopee.tw/farm/api/orchard/crop/meta/get?t={token}', '', ['token'], ProcData1],
];
let DataPostBodyList = [, ,];
function preInit() {
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
			if (!flag) { break; }
			item = -1;
			if (i === 1) {
			}
			let dc = GetDataConfig(i);
			// console.log(`🌐 ${dc.method} URL : ${dc.url}`);
			// console.log(dc);
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

