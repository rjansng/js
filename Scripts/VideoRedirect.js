const htmlStr = $response.body;

const startStr = 'renrenp';
const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('marginwidth'));

//if (headers.Location.indexOf('777tv') !== -1) {

//}.replace('"','')    .match('/renren.*?"');


$notification.post("test", "test",  str);
$done({});