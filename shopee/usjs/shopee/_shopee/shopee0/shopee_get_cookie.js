// https:\/\/mall\.shopee\.tw\/api\/v2\/user\/profile\/get\/$
// 蝦皮實名認證 , 帳號設定/銀行帳號/信用卡
// https:\/\/mall\.shopee\.tw\/api\/v2\/user\/get_rating_summary\?userid=.+
// 我的評價

function shopeeNotify(subtitle = '', message = '') { console.log(subtitle + '\t' + message); };

const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
if (cookie) {
	// const shopee_token = cookie.split('shopee_token=')[1].split(';')[0];
	// const SPC_EC = cookie.split('SPC_EC=')[1].split(';')[0];
	// const cstfToken = cookie.split('csrftoken=')[1].split(';')[0];
	const SPC_ST = cookie.split('SPC_ST=')[1].split(';')[0];
    const SPC_F = cookie.split('SPC_F=')[1].split(';')[0];
	const deviceId = cookie.split('SPC_DID=')[1].split(';')[0];
	if (deviceId && deviceId.length > 1 && deviceId.match(/[0-9A-Z]+/)) {
		$persistentStore.write(deviceId, 'deviceId');
	}

	// const saveCookie = $persistentStore.write(cookie, 'CookieSP');
	// const saveToken = $persistentStore.write(shopee_token, 'ShopeeToken');
	// const saveSPC_EC = $persistentStore.write(SPC_EC, 'SPC_EC');
	// const saveCsrf = $persistentStore.write(cstfToken, 'CSRFTokenSP');
	const saveSPC_ST = $persistentStore.write(SPC_ST, 'SPC_ST');
	const saveSPC_F = $persistentStore.write(SPC_F, 'SPC_F');
	
	if (!(saveSPC_ST)) {
		shopeeNotify(
			'保存失敗 ‼️',
			'請稍後嘗試'
		);
	} else {
		shopeeNotify(
			'保存成功 🍪',
			''
		);
	}
} else {
	shopeeNotify(
		'保存失敗 ‼️',
		'請重新登入'
	);
}
$done({});
