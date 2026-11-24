var isReq = false;
var body = null;
try {
    body = $response.body;
} catch (e) {
    isReq = true;
}

var url = $request.url;
if (isReq) {
    console.log(url);
    if (url.match(/.+count=.+/i)) {
        $request.url = $request.url.replace(/(.+count=)200(.+)/i, '$11$2');
        console.log($request.url);
        $done({ url: $request.url });
    } else { $done({}); }
}
if (body) {
    var json = JSON.parse(body);
    // console.log('\n');
    // console.log(body);

    try {
        json.data.sections[0].data.ads = [json.data.sections[0].data.ads[0]];

        json.data.sections[0].data.ads[0].label_ids = [];
        json.data.sections[0].data.ads[0].images = [];
        json.data.sections[0].data.ads[0].video_info_list = [];
        json.data.sections[0].data.ads[0].tier_variations = [];
        json.data.sections[0].data.ads[0].item_rating.rating_count = [0, 0, 0, 0, 0, 0];
        //json.data.sections[0].data.ads[0].global_cat.catid = [];
        //json.data.sections[0].data.ads[0].fe_cat_paths[0].fe_cat_ids = [];

        // json.data.sections[0].data.ads[0].is_official_shop = false;
        // json.data.sections[0].data.ads[0].show_official_shop_label = false;
        // json.data.sections[0].data.ads[0].show_official_shop_label_in_title = false;
        // json.data.sections[0].data.ads[0].can_use_bundle_deal = false;
        json.data.sections[0].data.ads[0].image = "";
        json.data.sections[0].data.ads[0].name = "";
        json.data.sections[0].data.ads[0].transparent_background_image = "";
        json.data.sections[0].data.ads[0].shop_name = "";
        json.data.sections[0].data.ads[0].cmt_count = 0;
        json.data.sections[0].data.ads[0].shopid = 0;
        json.data.sections[0].data.ads[0].itemid = 0;

        json.data.sections[0].data.ads[0].price = 0;
        json.data.sections[0].data.ads[0].discount = '';
        json.data.sections[0].data.ads[0].historical_sold = 0;
        json.data.sections[0].data.ads[0].price_min = 0;
        json.data.sections[0].data.ads[0].price_max = 0;



        json.data.sections[0].total = 1;
        json.data.sections[0].index = [json.data.sections[0].index[0]];

        json.data.sections[0].index[0].key = 'ads::0';
    } catch (e) { console.log('ERR : ' + e); }
    body = JSON.stringify(json);

    // console.log('\n');
    // console.log(body);

    $done({ body });
}