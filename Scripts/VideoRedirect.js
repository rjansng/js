var body = $response.body.match('/renren.*?"');

//if (headers.Location.indexOf('777tv') !== -1) {

//}.replace('"','')


$notification.post("test", "test", body);
$done({});