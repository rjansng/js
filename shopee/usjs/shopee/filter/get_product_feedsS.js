let title = '💰我的蝦幣 商店 過濾 RES';
let version = 'v20230731';

let body = $response.body;
let json = JSON.parse(body);
//console.log(json);

json.data.feeds.forEach(f => {
	f.ads_unit.item_id = 0;
	f.ads_unit.shop_id = 0;
	f.ads_unit.ads_id = 0;
	f.ads_unit.campaign_id = 0;
	f.ads_unit.deduction_info = '';
	f.ads_unit.info = '';
	
	f.item.itemid = 0;
	f.item.shopid = 0;
	f.item.name = '';
	f.item.shop_name = '';
	f.item.image = '';
	f.item.label_ids = [];
	f.item.images = [];
	f.item.video_info_list = [];
	f.item.tier_variations = [];
	f.item.fe_cat_paths = [];

});

body = JSON.stringify(json);
$done({ body });
