console.log('取得電子券 Link');
let tg = '0';
try {
	if ($argument) { tg = $argument; }
} catch (e) { console.log('Not $argument'); }

function telegramNotify(title, subtitle = '', message = '') {
	let TelegramUrl = $persistentStore.read('TelegramUrl') || '';
	if (TelegramUrl != '') {
		let telegramData = { url: TelegramUrl + encodeURIComponent(title + (subtitle != '' ? '\n' : '') + subtitle + (message != '' ? '\n' : '') + message) };
		// 已移除外部 Telegram 通知傳送
	}
}

let subtitle = '';
let balance = '';
let body = $response.body;
let headers = $request.headers;

let ua = headers['user-agent'] || headers['User-Agent'];
let isBodyAdj = false;
let d = body;
try {
	let a1 = d.indexOf('商品描述');
	let b1 = d.indexOf('<td', a1);
	let b2 = d.indexOf('>', b1);
	let b3 = d.indexOf('<\/td>', b2);
	let d2 = d.substr(b2 + 1, b3 - b2 - 1).replace(/\n/g, '').trim();
	subtitle = d2;
} catch (e) { console.log('Try Error 1:'); console.log(e); }
try {

	let a1 = d.indexOf('序號效期');
	let b1 = d.indexOf('<td', a1);
	let b2 = d.indexOf('>', b1);
	let b3 = d.indexOf('<\/td>', b2);
	let d2 = d.substr(b2 + 1, b3 - b2 - 1).replace(/\n/g, '').trim();
	subtitle += '\n' + d2;
} catch (e) { console.log('Try Error 2:'); console.log(e); }
try {

	let a1 = d.indexOf('var balance = ');
	let b1 = d.indexOf('>', a1);
	let b2 = d.indexOf('<\/', b1);
	let d2 = d.substr(b1 + 1, b2 - b1 - 1).replace(/\n/g, '').trim();
	//console.log(a1, b1, b2, d2);
	balance = d2;
	if (balance.includes('餘額') || balance.includes('剩餘：')) { isBodyAdj = true; }
	subtitle += '\n' + balance;
} catch (e) { console.log('Try Error 3:'); console.log(e); }

console.log(`${subtitle}\n${$request.url}`);
console.log(ua);
if (ua && ua.includes(' Beeshop') && ua.includes(' Shopee')) {
	if (tg === '1') { telegramNotify('取得電子券 Link', subtitle, $request.url); }
}

if (isBodyAdj) {
	console.log('調整 BarCode 距離');
	body = body.replace(/(\<td class="sebarcode-td" style="text-align: center; padding-bottom: )5px(;"\>)/i, '$160px$2');
}
console.log('移除 碳足跡 標示');
body = body.replace(/\<div class="ESG"\>/ig, '<div class="ESG" style="display:none;">');
//let html = document.getElementsByTagName('html')[0].innerHTML;
//console.log(body.match(/\<script\>[^\<\>]+(google-analytics|googletagmanager)[^\<\>]+\<\/script\>/ig));
// body = body.replace(/\<script\>[^\<\>]+www\.(google-analytics|googletagmanager)\.com[^\<\>]+\<\/script\>/ig, '');
// body = body.replace(/\<script[^\<\>]+www\.(google-analytics|googletagmanager)\.com[^\<\>]+\>\<\/script\>/ig, '');
// body = body.replace('</body', '<style type="text/css">td.sebarcode-td{padding-bottom:50px!important;}</style><script>document.addEventListener("DOMContentLoaded", () => {document.querySelector(\'#AnnouncementArea\').style.display=\'\';document.querySelector(\'#AnnouncementContext\').innerText=\'' + balance + '\';});</script></body');
// body = body.replace('</body', '<style type="text/css">td.sebarcode-td{padding-bottom:50px!important;}</style></body');
$done({ body });
// } else {
// 	$done({});
// }
