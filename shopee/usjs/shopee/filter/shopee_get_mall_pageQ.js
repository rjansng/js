let version = 'v20240816';
let title = 'Shopee Get Mall Page 避開驗證';

if (($persistentStore.read('蝦皮商城過濾') || '') == '是' && ($persistentStore.read('蝦皮商城重新讀取') || '') != '是') {
	let shopee_get_mall_page = $persistentStore.read('shopee_get_mall_page') || '';
	if (shopee_get_mall_page != '') {
		$done({ response: { status: 200, body: shopee_get_mall_page } });
	}
	else { $done({}); }
} else { $done({}); }