// https://mall.shopee.tw/api/v4/market_coin/get_iframe_list?region=TW&offset=0&limit=10

let body = null;
body = $response.body;
if (body) {
	let jb = JSON.parse(body);
	if (jb.error === 0) {
		let sd = $persistentStore.read('我的蝦幣顯示IFRAME') || '';
		sd = sd != '否';
		if (!sd) {
			jb.data.iframe_list = [];
			// jb.data.iframe_list.forEach(x => {
			// 	x.url = 'about:blank';
			// 	x.height = 0;
			// });
		}
		// https://games.shopee.tw/game/iframe/api/h5/get?iframeSource=2
	}
	body = JSON.stringify(jb);
}
$done({ body });
