let _ShopeeUserID = '';

function cookieToString(cookieObject) {
	let string = '';
	for (const [key, value] of Object.entries(cookieObject)) {
		if (key !== 'SPC_EC') { string += `${key}=${value};`; }
	}
	return string;
}
const ShopeeInfo = $persistentStore.read('ShopeeInfo');
let shopeeInfo = !ShopeeInfo || ShopeeInfo.length === 0 ? {} : JSON.parse(ShopeeInfo);
let shopeeCookie = `${cookieToString(shopeeInfo.token)}shopee_token=${shopeeInfo.shopeeToken};`; // 
// shopeeCookie+=`;csrftoken=${shopeeInfo.csrfToken}`;
// shopeeCookie+=`;userid=${shopeeInfo.token.SPC_U}`;
// shopeeCookie+=`;shopid=${shopeeInfo.token.SPC_U}`;

// shopeeInfo.cookieAll += `SPC_EC=${shopeeInfo.token.SPC_EC};`;
// shopeeInfo.cookieAll += 'shopee_app_version=31208;shopee_rn_bundle_version=5096019;shopee_rn_version=1700038988;';
// shopeeInfo.cookieAll += 'REC_T_ID=6498a2b1-8070-11ee-8293-089204a3cc67;';
// shopeeInfo.cookieAll += 'SPC_SEC_SI=v1-OWM1ZEdYSDNPVXgwa012VTAj5Pw1Q5+xx83Z/EdHc7KEQ9QGgY9C85jz70VSjfglOrvdLyqi/QgY1J9nAQj0h78EBgYWjBT4FaMAeqFuB7E=;';
// shopeeInfo.cookieAll += 'SPC_B_SI=Q6snZQAAAAA3VndMWXdMYqnipwAAAAAAa3F4YURvR1U=;';
// shopeeCookie = shopeeInfo.cookieAll;

const shopeeCSRFToken = shopeeInfo.csrfToken;
let useNotify = $persistentStore.read('UseNotify') || '1';
const shopeeHeaders = {
	'Cookie': shopeeCookie,
	// 'X-CSRFToken': shopeeCSRFToken,
	// 'games-runtime': 'GamesRuntime',
	// 'games-biz-version': '6.7.0',
	// 'games-app-version': '31208',
	// 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Beeshop locale=zh-Hant version=31208 appver=31208 rnver=1700038988 shopee_rn_bundle_version=5096019 Shopee language=zh-Hant app_type=1 games_runtime=1 runtime_ver=1.0.53 game_bundle=5234 Cronet/102.0.5005.61',
	// 'fruit-app-version': '31208',
	// 'fruit-version-type': 'native',
	// 'accept-encoding': 'gzip, deflate',
	// 'accept-language': 'en-US,en',
	// 'content-type': 'application/json',
};

function telegramNotify(title, subtitle = '', message = '') {
	let TelegramUrl = $persistentStore.read('TelegramUrl') || '';
	if (TelegramUrl != '') {
		let telegramData = { url: TelegramUrl + encodeURIComponent(title + (subtitle != '' ? '\n' : '') + subtitle + (message != '' ? '\n' : '') + message) };
		// 已移除外部 Telegram 通知傳送
	}
}
function shopeeNotify(subtitle = '', message = '', url = 'shopeetw://') {
	var title = '🍤 蝦蝦果園自動澆水';
	if (useNotify === '1') {
		if (($persistentStore.read('TelegramUrl') || '') != '') {
			telegramNotify(title, subtitle, message);
		}
		else {
			$notification.post(title, subtitle, message, { 'openUrl': url });
		}
	}
	console.log(title + '\t' + subtitle + '\t' + message);
};


const dataRequest = {
	url: 'https://games.shopee.tw/farm/api/orchard/context/get?skipGuidance=0',
	headers: shopeeHeaders,
};

function getSaveObject(key) {
	const string = $persistentStore.read(key);
	return !string || string.length === 0 ? {} : JSON.parse(string);
}

let shopeeFarmInfo = getSaveObject('ShopeeFarmInfo' + _ShopeeUserID);

const waterRequest = {
	url: 'https://games.shopee.tw/farm/api/orchard/crop/water', // ?t=' + new Date().getTime(),
	headers: shopeeHeaders,
	body: shopeeFarmInfo.currentCrop,
};

// waterRequest.headers = shopeeFarmInfo.headers;

// const waterRequest = {
// 	url: 'https://games.shopee.tw/farm/api/orchard/crop/water?t=' + new Date().getTime(),
// 	headers: shopeeHeaders,
// 	body: $persistentStore.read('ShopeeCrop'),
// };

let cropName = '';
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
					const json = JSON.parse(data);
					// console.log(json);
					let crop = json.data.crops[0];
					let resource = json.data.resources[0];
					cropName = crop.meta.name;
					console.log('作物名稱 : ' + crop.meta.name + ` (${crop.lifeStatus})\n`);
					let found = false;
					let msg = '';
					waterRequest.body.cropId = crop.id;
					waterRequest.body.resourceId = resource.id;

					if (crop.lifeStatus == 1) {
						msg = '作物已死亡。';
					}
					else if (crop.state == 100) {
						msg = '作物已經可以收成了。';
					} else if (crop.state >= 101) {
						msg = '作物已收成。';
					}
					else {
						found = true;
						msg = '種植中。';
					}

					try {
						let dataName = 'ShopeeGamePlayed';
						let tsn = 'farm' + 's';
						let tsid = 'FW';
						let tsid2 = 'FC';
						let rs = $persistentStore.read(dataName) || '{"gameTime":0}';
						let tasks = JSON.parse(rs);
						let ts = {}, s = {}, s2 = {};
						if (tasks.hasOwnProperty(tsn)) { ts = tasks[tsn]; }
						if (ts.hasOwnProperty(tsid)) { s = ts[tsid]; } else { s = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
						if (ts.hasOwnProperty(tsid2)) { s2 = ts[tsid2]; } else { s2 = { 'c': 0, 'l': 0, 's': 0, 'f': false, 'd': [], 'r': '' }; }
						s2.r = cropName;
						s2.f = true;
						s.r = msg;
						s.f = true;
						ts[tsid2] = s2;
						ts[tsid] = s;
						tasks[tsn] = ts;
						$persistentStore.write(JSON.stringify(tasks), dataName);
					} catch (e) { console.log(e); }

					//console.log(json);
					//console.log(msg);
					console.log(waterRequest.body);
					if (found) {
						dataPost1();

					}
					else {
						console.log(msg);
						$done({});
					}

				} catch (error) {
					console.log('ERR:' + error);
					console.log(data);
					$done({});
				}
			} else {
				try {
					if (response.status === 401) { useNotify = '1'; }
				} catch (e) { console.log(e); }
				shopeeNotify('澆水失敗 ‼️', 'Token過期');

				let ShopeeInfoReUpdate = { 'NeedUpdate': true, 'NeedDate': new Date().getTime() };
				$persistentStore.write(JSON.stringify(ShopeeInfoReUpdate), 'ShopeeInfoReUpdate');
				// $persistentStore.write(null, 'ShopeeInfoReUpdate');

				console.log(response.status);
				console.log(data);
				$done({});
			}
		}
	});

}

function dataPost1() {
	// console.log(waterRequest);
	$httpClient.post(waterRequest, function (error, response, data) {
		if (error) {
			shopeeNotify(
				'澆水失敗 ‼️',
				'連線錯誤'
			);
		} else {
			// console.log(response);
			// console.log(data);

			if (response.status === 200) {
				try {
					let obj = JSON.parse(data);
					let found = false;
					let msg = '';

					if (obj.msg === 'success') {
						let useNumber = obj.data.useNumber;
						let state = obj.data.crop.state;
						let exp = obj.data.crop.exp;
						let levelExp = obj.data.crop.meta.config.levelConfig[state.toString()].exp;
						let remain = levelExp - exp;
						msg = '';
						if (remain === 0) {
							msg = '作物可以收成啦';
							shopeeNotify(
								'澆水成功 ✅',
								'種植完畢，作物可以收成啦 🌳'
							);
						}
						else if (remain < 20) {
							shopeeNotify(
								'澆水成功 ✅',
								'本次澆了：' + useNumber + ' 滴水 💧\n' + '剩餘 ' + remain + ' 滴水成長至下一階段'
							);
						}
						else {
							console.log('本次澆了：' + useNumber + ' 滴水 💧\n' + '剩餘 ' + remain + ' 滴水成長至下一階段');
							// shopeeNotify(
							//   '澆水成功 ✅',
							//   '本次澆了：' + useNumber + ' 滴水 💧\n' + '剩餘 ' + remain + ' 滴水成長至下一階段'
							// );
						}
					} else if (obj.msg === 'resource not enough') {
						shopeeNotify(
							'澆水失敗 ‼️',
							'水壺目前沒水'
						);
					} else if (obj.msg === 'invalid param') {
						shopeeNotify(
							'澆水失敗 ‼️',
							'作物狀態錯誤，請先手動澆水一次'
						);
					} else if (obj.msg === 'invalid crop state') {
						// const cropState = parseInt($persistentStore.read('ShopeeCropState')||'0');
						// if (cropState < 3) {
						// 	$persistentStore.write((cropState + 1).toString(), 'ShopeeCropState');
						shopeeNotify(
							'澆水失敗 ‼️',
							'作物狀態錯誤，請檢查是否已收成'
						);
						// }
					} else {
						shopeeNotify(
							'澆水失敗 ‼️',
							obj.msg
						);
					}

				} catch (error) {
					shopeeNotify(
						'澆水失敗 ‼️',
						error
					);
				}
			}
			else if (response.status == 401) {
				shopeeNotify('澆水失敗 ‼️', '澆水Token過期');

			}
			else {
				shopeeNotify(
					'連線失敗 ‼️',
					response.status
				);
				console.log(data);
			}
		}
		$done({});
	});
}

getInfo1();