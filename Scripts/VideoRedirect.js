const htmlStr = $response.body;

const startStr = 'player_video';
const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('play_but'));

//if (headers.Location.indexOf('777tv') !== -1) {

//}.replace('"','')    .match('link_pre.*https.*?"');

str = str.match('link_pre.*m3u8');

$notification.post("test", "test",  str);
$done({});



