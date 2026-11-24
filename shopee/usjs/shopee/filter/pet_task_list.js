const version = 'v20230512'; // ID 每期需調整

let rewardID300 = 5307561;
let rewardID10 = 5567601;

var body = $response.body;
var json = JSON.parse(body);
console.log(json.data);

console.log('過濾 只保留點數兌換項目');
// 過濾 只保留點數兌換項目
var sl = [];
json.data.shopRewards.forEach(x => {
    if (x.rewardID === rewardID300 || x.rewardID === rewardID10) {
        sl.push(x);
    }
});
// { 'id': 3041236, 'need': 2, 'name': '💰 在寵物村使用2蝦幣' },
// { 'id': 3014888, 'need': 1, 'name': '💰 使用蝦幣購買服裝' },
console.log('過濾 需要蝦幣的任務');
// 過濾 需要蝦幣的任務
let ts = [];
json.data.tasks.forEach(x => {
    if (x.taskID != 3041236 && x.taskID != 3014888 || x.progress > 0 || x.isClaim) {
        ts.push(x);
    }
});
// for (let i = 0; i < json.data.shopRewards.length; i++) {
//     var s = json.data.shopRewards[i];
//     //console.log(s);
//     if (i === 0 || i === 3) {
//         sl.push(s);
//     }
// }
json.data.tasks = ts;
json.data.shopRewards = sl;
body = JSON.stringify(json);
$done({ body });
