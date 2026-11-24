function cookieToString(cookieObject) {
	let string = '';
	for (let [key, value] of Object.entries(cookieObject)) {
		if (key !== 'SPC_EC') { string += `${key}=${value};`; }
	}
	return string;
}
let ShopeeInfo = $persistentStore.read('ShopeeInfo');
let shopeeInfo = !ShopeeInfo || ShopeeInfo.length === 0 ? {} : JSON.parse(ShopeeInfo);
let shopeeCookie = `${cookieToString(shopeeInfo.token)}shopee_token=${shopeeInfo.shopeeToken};`;
let shopeeCSRFToken = shopeeInfo.csrfToken;
let useNotify = $persistentStore.read('UseNotify') || '1';
let shopeeHeaders = {
	'Content-Type': 'application/json',
	'Cookie': shopeeCookie,
	//'X-CSRFToken': shopeeCSRFToken,
};
function shopeeNotify(subtitle = '', message = '') {
	var title = '🍤 蝦蝦果園自動收成';
	if (useNotify == '1') { $notification.post(title, subtitle, message, { 'openUrl': 'shopeetw://' }); }
	console.log(title); console.log(subtitle); console.log(message);
	if (($persistentStore.read('TelegramUrl') || '') != '') {
		telegramNotify(title, subtitle, message);
	  }
	};
function telegramNotify(title, subtitle = '', message = '') {
	let TelegramUrl = $persistentStore.read('TelegramUrl') || '';
	if (TelegramUrl != '') {
	  let telegramData = { url: TelegramUrl + encodeURIComponent(title + (subtitle != '' ? '\n' : '') + subtitle + (message != '' ? '\n' : '') + message) };
	  // 已移除外部 Telegram 通知傳送
	}
  }
  
let dataRequest = {
	url: 'https://games.shopee.tw/farm/api/orchard/context/get?skipGuidance=0',
	headers: shopeeHeaders,
};

let harvestRequest = {
	url: 'https://games.shopee.tw/farm/api/orchard/crop/harvest',
	headers: shopeeHeaders,
	body: { deviceId: '', cropId: 0 }
};

if (shopeeInfo.hasOwnProperty('deviceId')) {
	harvestRequest.body.deviceId = shopeeInfo.deviceId;
}
else {
	harvestRequest.body.deviceId = shopeeInfo.token.SPC_F;
}
Date.prototype.format = function (format = '1') {
	if (format === '0') { format = 'yyyy/MM/dd HH:mm:ss.S'; }
	else if (format === '1') { format = 'yyyy/MM/dd HH:mm:ss'; }
	else if (format === '2') { format = 'yyyy/MM/dd'; }
	else if (format === '3') { format = 'HH:mm:ss'; }
	else if (format === '4') { format = 'MM/dd'; }
	else if (format === '5') { format = 'HH:mm'; }
	let o = {
		"M+": this.getMonth() + 1, //month  
		"d+": this.getDate(),    //day  
		"h+": this.getHours(),   //hour  
		"H+": this.getHours(),   //hour  
		"m+": this.getMinutes(), //minute  
		"s+": this.getSeconds(), //second  
		"q+": parseInt((this.getMonth() + 3) / 3),  //quarter 季
		"S": this.getMilliseconds().toString().padEnd(3, '0') //millisecond  
	}
	if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (let k in o) if (new RegExp("(" + k + ")").test(format))
		format = format.replace(RegExp.$1,
			RegExp.$1.length === 1 ? o[k] :
				("00" + o[k]).substr(("" + o[k]).length));
	return format;
};

var calDate = function (a, b) {
	//var a = new Date(2022, 10, 1, 5, 6, 7);
	//var b = new Date(2022, 11, 29, 6, 8, 10);
	var y = parseInt((b.getTime() - a.getTime()) / 1000);
	//var f = y % 1000; y -= f; y = y / 1000;
	var s = y % 60; y -= s; y = y / 60;
	var m = y % 60; y -= m; y = y / 60;
	var h = y % 24; y -= h; y = y / 24;
	var d = y;// % 30; y -= d; y = y / 30;
	//var M = y % 12; y -= M; y = y / 12;
	return `${d}天 ${h}時 ${m}分 ${s}秒`;
	//return `${y}年 ${M}月 ${d}天 ${h}時 ${m}分 ${s}秒`;
};

function ShowCropInfo(data) {
	try {
		let json = JSON.parse(data);
		//console.log(data);
		//console.log(json.code);
		if (json.code === 0) {
			var crop = json.data.crop;
			var cropName = crop.meta.name;
			var totalExp = crop.meta.config.totalExp;

			console.log(`\n作物名稱：${cropName}`);
			console.log('\n預估時間 (系統)：' + (parseInt(crop.meta.config.needDays) > 0 ? (crop.meta.config.needDays) + '天' : (totalExp / 100) + '小時'))
			console.log('預估時間 (純澆水)：' + (Math.ceil((totalExp / 16) * 100) / 100).toString() + '時；\t'
				+ (Math.ceil((totalExp / 16 / 24) * 100) / 100).toString() + '天。');
			{
				var cct = 0; var h3 = 0; var h2 = 0;
				while (cct < totalExp) {
					if (h2 == 12) { cct += 340; h2 = 0; }
					else { cct += 16; h3++; h2++; } // (60 / 3.6) = 16.66
				}
				var cct2 = 0; var h32 = 0; var h22 = 0;
				while (cct2 < totalExp) {
					if (h22 == 12) { cct2 += 460; h22 = 0; }
					else { cct2 += 16; h32++; h22++; } // (60 / 3.6) = 16.66
				}
				var cct3 = 0; var h33 = 0; var h23 = 0;
				while (cct3 < totalExp) {
					if (h23 == 12) { cct3 += 1170; h23 = 0; }
					else { cct3 += 16; h33++; h23++; } // (60 / 3.6) = 16.66
				}
				var cct4 = 0; var h34 = 0; var h24 = 0;
				while (cct4 < totalExp) {
					if (h24 == 12) { cct4 += 1350; h24 = 0; }
					else { cct4 += 16; h34++; h24++; } // (60 / 3.6) = 16.66
				}
				console.log('預估時間 (1350/D)：' + h34 + '時；\t\t' + (Math.ceil((h34 / 24) * 10) / 10) + '天。');
				console.log('預估時間 (1170/D)：' + h33 + '時；\t\t' + (Math.ceil((h33 / 24) * 10) / 10) + '天。');
				console.log('預估時間 ( 460/D)：' + h32 + '時；\t\t' + (Math.ceil((h32 / 24) * 10) / 10) + '天。');
				console.log('預估時間 ( 340/D)：' + h3 + '時；\t\t' + (Math.ceil((h3 / 24) * 10) / 10) + '天。');
			}
			var ct = new Date(crop.createTime);
			var mt = new Date(crop.modifyTime);
			var st = new Date(crop.selfWaterTime);
			var isHarvest = true;
			if (crop.state == 102 || crop.state == 101) {
				console.log('作物已收成。');
			}
			else if (crop.state == 100) {
				console.log('作物已經可以收成。');
			}
			else {
				isHarvest = false;
				var cl = crop.meta.config.levelConfig[`${crop.state}`];
				//console.log(cl);
				console.log(`\n作物第 ${crop.state} 階段，還需要 ${cl.exp - crop.exp}/${cl.exp} 水量。`);
				var cl1 = crop.meta.config.levelConfig['1'];
				var cl2 = crop.meta.config.levelConfig['2'];
				var cl3 = crop.meta.config.levelConfig['3'];
				var cc = 0;
				if (crop.state > 1) { cc += cl1.exp; }
				if (crop.state > 2) { cc += cl2.exp; }
				cc += crop.exp;
				console.log('\n總需水量：' + totalExp);
				console.log('已澆：' + cc);
				console.log('還需：' + (totalExp - cc));
				var needW = totalExp - cc;

				var cct = cc; var h3 = 0; var h2 = 0;
				while (cct < totalExp) {
					if (h2 == 12) { cct += 340; h2 = 0; }
					else { cct += 16; h3++; h2++; }
				}
				var cct2 = cc; var h32 = 0; var h22 = 0;
				while (cct2 < totalExp) {
					if (h22 == 12) { cct2 += 460; h22 = 0; }
					else { cct2 += 16; h32++; h22++; } // (60 / 3.6) = 16.66
				}

				// console.log('\n預估還需時間 (純澆水)：' + (Math.ceil((needW / 16) * 100) / 100).toString() + '時；\t'
				//     + (Math.ceil((needW / 16 / 24) * 100) / 100).toString() + '天。');
				console.log('預估還需時間 (460/D)：' + h32 + '時；\t\t' + (Math.ceil((h32 / 24) * 10) / 10) + '天。');
				console.log('預估還需時間 (340/D)：' + h3 + '時；\t\t' + (Math.ceil((h3 / 24) * 10) / 10) + '天。');
			}

			console.log('\n種植時間：' + ct.format('yyyy/MM/dd hh:mm:ss'));
			console.log('澆水時間：' + st.format('yyyy/MM/dd hh:mm:ss'));
			console.log('異動時間：' + mt.format('yyyy/MM/dd hh:mm:ss'));
			var cdays = parseInt((st.getTime() - ct.getTime()) / 1000 / 60 / 60 / 24 * 100) / 100;
			console.log('\n作物時間：' + cdays + '天；\t' + calDate(ct, st));
			if (!isHarvest) {
				var cdays2 = cdays + (Math.ceil((h32 / 24) * 10) / 10);
				console.log('作物時間 (460/D)：' + cdays2 + '天');
				var cdays3 = cdays + (Math.ceil((h3 / 24) * 10) / 10);
				console.log('作物時間 (340/D)：' + cdays3 + '天');
			}
		}
	} catch (error) {
		console.log('ERR:' + error);
	}
}

function getInfo1() {
	$httpClient.get(dataRequest, function (error, response, data) {
		// console.log(error);
		// console.log(response);
		if (error) {
			console.log(error);
			console.log(data);
			$done({});
		} else {
			if (response.status === 200) {
				try {
					let json = JSON.parse(data);
					//console.log(json);
					crop = json.data.crops[0];
					harvestRequest.body.cropId = crop.id;
					console.log('作物名稱 : ' + crop.meta.name + '\n');
					if (crop.lifeStatus == 1) {
						console.log('作物已死亡。');
						$done({});
					}
					else if (crop.state == 100) {
						dataPost1();
					} else if (crop.state >= 101) {
						console.log('作物已收成。');
						$done({});
					}
					else {
						console.log('作物尚未達到收成階段。');
						$done({});
					}

				} catch (error) {
					console.log('ERR:' + error);
					console.log(data);
					$done({});
				}
			} else {
				console.log(response.status);
				console.log(data);
				$done({});
			}
		}
	});

}

function dataPost1() {
	$httpClient.post(harvestRequest, function (error, response, data) {
		if (error) {
			shopeeNotify(
				'收成失敗 ‼️',
				'連線錯誤'
			);

		} else {
			if (response.status === 200) {
				try {
					try {
						ShowCropInfo(data);
					} catch (e) {
						console.log(e);
					}
					let json = JSON.parse(data);
					if (json.code === 0) {
						//console.log(data);
						let cropName = json.data.crop.meta.name;
						let ctaUrl = json.data.reward.rewardItems[0].itemExtraData.ctaUrl;
						let luckyDrawAwardName = json.data.reward.rewardItems[0].itemExtraData.luckyDrawAwardName;
						console.log('');
						if (ctaUrl != '') {
							shopeeNotify(
								'收成成功 ✅',
								`獲得 ${cropName} 🌳\n${luckyDrawAwardName}`
							);

							try {
								let dataName = 'ShopeeGamePlayed';
								let tsn = 'farm' + 's';
								let tsid = 'A2';
								let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
								let tasks = JSON.parse(rs);
								let ts = {}, s = {};
								if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
								if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
								s.c++;
								s.f = true;
								s.r += `\n🌱${cropName}\t🌳${luckyDrawAwardName} : ${(new Date()).format('3')}`;
								ts[tsid] = s;
								tasks[tsn] = ts;
								$persistentStore.write(JSON.stringify(tasks), dataName);
							} catch (e) { console.log(e); }


						} else {
							console.log(`已經收成過 ${cropName} 了`);
						}
						console.log(luckyDrawAwardName);
					}
					else if (json.code === 409004) {
						console.log('作物尚未達到收成階段');
					} else if (json.code === 404000) {
						shopeeNotify(
							'收成失敗 ‼️',
							'找不到作物'
						);
					} else {
						shopeeNotify(
							'收成失敗 ‼️',
							json.code + ' ' + json.msg
						);
					}
				} catch (error) {
					shopeeNotify(
						'收成失敗 ‼️',
						error
					);
				}
			} else {
				shopeeNotify(
					'收成失敗 ‼️',
					response.status
				);
			}
		}
		$done({});
	});
}

getInfo1();