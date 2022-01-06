var status = $response.status;
var headers = $response.headers;
var body = $response.body;
let notifiTitle = "影片網頁跳轉到影片player";


//if (headers.Location.indexOf('777tv') !== -1) {
body = body.match('/renren.*?"');
//}.replace('"','')


$notification.post("test", "test", body);
$done({});