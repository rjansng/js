// 重整配置
let pp1 = null;
pp1 = $persistentStore.read('顯示我的蝦皮錢包') || ''; // ,預設,否,是
if (pp1 != '是') { $persistentStore.write(null, '顯示我的蝦皮錢包'); }
pp1 = $persistentStore.read('用蝦幣抽寵物') || ''; // ,預設,否,是
if (pp1 != '是') { $persistentStore.write(null, '用蝦幣抽寵物'); }
pp1 = $persistentStore.read('桌上曲棍球限名次') || ''; // ,不限制,第1名,第2名,第3名
if (pp1 == '不限制') { $persistentStore.write(null, '桌上曲棍球限名次'); }
pp1 = $persistentStore.read('桌上曲棍球點數不足限名次') || ''; // ,依限名次,第1名,第2名,第3名
if (pp1 == '依限名次') { $persistentStore.write(null, '桌上曲棍球點數不足限名次'); }
pp1 = $persistentStore.read('桌上曲棍球用蝦幣玩') || ''; // ,預設,否,是
if (pp1 != '是') { $persistentStore.write(null, '桌上曲棍球用蝦幣玩'); }
pp1 = $persistentStore.read('貪食蛇用蝦幣玩') || ''; // ,預設,否,是
if (pp1 != '是') { $persistentStore.write(null, '貪食蛇用蝦幣玩'); }
pp1 = $persistentStore.read('貪食蛇視野大小') || ''; // ,預設,2,3,4,5
if (pp1 == '預設') { $persistentStore.write(null, '貪食蛇視野大小'); }
pp1 = $persistentStore.read('彈珠台用蝦幣玩') || ''; // ,預設,否,是
if (pp1 != '是') { $persistentStore.write(null, '彈珠台用蝦幣玩'); }
pp1 = $persistentStore.read('彈珠台過濾機台') || ''; // ,預設,否,是
if (pp1 != '是') { $persistentStore.write(null, '彈珠台過濾機台'); }
pp1 = $persistentStore.read('金頭腦完成標示') || ''; // ,預設,1,2,3
if (pp1 == '預設') { $persistentStore.write(null, '金頭腦完成標示'); }
pp1 = $persistentStore.read('賽跑完成標示') || ''; // ,預設,1,2,3
if (pp1 == '預設') { $persistentStore.write(null, '賽跑完成標示'); }
pp1 = $persistentStore.read('找碴完成標示') || ''; // ,預設,1,2,3
if (pp1 == '預設') { $persistentStore.write(null, '找碴完成標示'); }
pp1 = $persistentStore.read('足球完成標示') || ''; // ,預設,1,2,3
if (pp1 == '預設') { $persistentStore.write(null, '足球完成標示'); }

pp1 = $persistentStore.read('蝦蝦飛刀模式') || '';
if (pp1 == '(預設)') { $persistentStore.write(null, '蝦蝦飛刀模式'); }

pp1 = $persistentStore.read('我的蝦幣清單筆數') || '';
if (pp1 == '300') { $persistentStore.write(null, '我的蝦幣清單筆數'); }
pp1 = $persistentStore.read('模擬彈珠台2') || '';
if (pp1 != '是') { $persistentStore.write(null, '模擬彈珠台2'); }
pp1 = $persistentStore.read('ShowBodyLog') || '';
if (pp1 != '是') { $persistentStore.write(null, 'ShowBodyLog'); }
pp1 = $persistentStore.read('ShowJsonLog') || '';
if (pp1 != '是') { $persistentStore.write(null, 'ShowJsonLog'); }

pp1 = $persistentStore.read('顯示偽裝的資訊') || '';
if (pp1 != '是') { $persistentStore.write(null, '顯示偽裝的資訊'); }
pp1 = $persistentStore.read('顯示偽裝的資訊次要') || '';
if (pp1 != '是') { $persistentStore.write(null, '顯示偽裝的資訊次要'); }
pp1 = $persistentStore.read('顯示偽裝的資訊其它') || '';
if (pp1 != '是') { $persistentStore.write(null, '顯示偽裝的資訊其它'); }
pp1 = $persistentStore.read('偽裝不偵測GWSIGN') || '';
if (pp1 != '是') { $persistentStore.write(null, '偽裝不偵測GWSIGN'); }
pp1 = $persistentStore.read('實名TOKEN過期強制更新') || '';
if (pp1 != '是') { $persistentStore.write(null, '實名TOKEN過期強制更新'); }


let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log('ShopeeUserID: ' + ShopeeUserID); }
let UseUserId = $persistentStore.read('UseUserId') || '';
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

let caption = '蝦皮 Pre Cookie';
let version = 'v20231211';

function getSaveObject(key) { const string = $persistentStore.read(key); return !string || string.length === 0 ? {} : JSON.parse(string); }
function isEmptyObject(obj) { return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false; }
function cookieToString(cookieObject) { let string = ''; for (const [key, value] of Object.entries(cookieObject)) { string += `${key}=${value};` } return string; }

let shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
if (isEmptyObject(shopeeInfo)) {
	console.log('檢查失敗 ‼️\t沒有 蝦皮 Token');
}
else {

	shopeeInfo.cookieToken = cookieToString(shopeeInfo.tokenAll);
	shopeeInfo.cookieAll = cookieToString(shopeeInfo.tokenAll);
	if ('tokenAll' in shopeeInfo) { shopeeInfo.cookieAll = cookieToString(shopeeInfo.tokenAll); }
	if (!shopeeInfo.cookieAll.includes('shopee_token=')) shopeeInfo.cookieAll += `shopee_token=${shopeeInfo.shopeeToken};`;
	if (!shopeeInfo.cookieAll.includes('csrftoken=')) shopeeInfo.cookieAll += `csrftoken=${shopeeInfo.csrfToken};`;
	if (!shopeeInfo.cookieAll.includes('shopid=')) shopeeInfo.cookieAll += `shopid=${shopeeInfo.shopId};`;
	if (!shopeeInfo.cookieAll.includes('userid=')) shopeeInfo.cookieAll += `userid=${shopeeInfo.tokenAll.SPC_U};`;
	if (!shopeeInfo.cookieAll.includes('username=')) shopeeInfo.cookieAll += `username=${shopeeInfo.userName};`;
	if (!shopeeInfo.cookieAll.includes('SPC_EC=')) shopeeInfo.cookieAll += `SPC_EC=${shopeeInfo.tokenAll.SPC_EC};`;
	// shopeeInfo.cookieToken = shopeeInfo.cookieAll;
	// shopeeInfo.cookieShopeeToken = shopeeInfo.cookieAll;
	console.log('');
	console.log('Cookie');
	console.log('Cookie:' + shopeeInfo.cookieToken);
	console.log('');
	console.log('Cookie All');
	console.log('Cookie:' + shopeeInfo.cookieAll);
	let shopeeHeaders = {
		'Cookie': shopeeInfo.cookieAll,
		'Content-Type': 'application/json',
	}
	let config = {
		shopeeHeaders: shopeeHeaders,
		userID: shopeeInfo.tokenAll.SPC_U,
	}
	shopeeInfo.config = config;
	$persistentStore.write(JSON.stringify(shopeeInfo, null, 4), 'ShopeeInfo' + _ShopeeUserID);
}

$done({});
