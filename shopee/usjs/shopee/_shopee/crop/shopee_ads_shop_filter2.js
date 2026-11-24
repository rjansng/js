// http://sdany.somee.com/usjs/shopee_ads_shop_filter.js

var body = $response.body;
var json = JSON.parse(body);

//console.log(JSON.stringify(json.data.sections[0].data.item[0]));
//console.log(json.data.sections[0].data.item[0]);

//console.log(JSON.stringify(json.data.sections[0].index[0]));
//console.log(json.data.sections[0].index[0]);

//json.data.sections[0].data.item[0].images=[];
//json.data.sections[0].data.item[0].label_ids=[];
//json.data.sections[0].data.item[0].video_info_list=[];
//json.data.sections[0].data.item[0].item_rating.rating_count=[];
//var ta = json.data.sections[0].data.item[0];
//var tb = json.data.sections[0].index[0];

json.data.sections[0].data.item = [];
json.data.sections[0].index = [];
//json.data.sections[0].data.item.push(ta);
//json.data.sections[0].index.push(tb);

//console.log(json.data.sections[0].data.item[0]);
//console.log(json.data.sections[0].index[0]);

//console.log(json);
body = JSON.stringify(json);
//console.log(body);
$done({ body });
