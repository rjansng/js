let method = $request.method;
let url = $request.url;
let status = $response.status;
let headers = $response.headers;
let body = $response.body;
let notifiTitle = "影片網頁跳轉到影片player";


if (headers.Location.indexOf('777tv') !== -1) {
body = body.match('/renren.*?"').toString().replace('"','');
}


$notification.post("test", "test", body);
$done({});