const htmlStr = $response.body;

const startStr = 'mozallowfullscreen';
const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('framespacing'));

//if (headers.Location.indexOf('777tv') !== -1) {

//}.replace('"','')    .match('link_pre.*https.*?"');

htmlStr = htmlStr.match('link_pre.*https.*?"');

$notification.post("test", "test",  htmlStr);
$done({});



