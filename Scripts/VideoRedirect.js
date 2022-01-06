const htmlStr = $response.body;

const startStr = 'mozallowfullscreen';
const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('framespacing'));

//if (headers.Location.indexOf('777tv') !== -1) {

//}.replace('"','')    .match('/renren.*?"');


$notification.post("test", "test",  htmlStr);
$done({});


