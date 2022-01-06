const htmlStr = $response.body;

const startStr = 'var player_data';
const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('play_but'));
const cgiDataStr =  JSON.parse(str);
var str1 = null;
var str2 = null;
    if (body.url == undefined ) {
       
    } else {
        str1 = body.url;
        str2 = body.link_next;
    }


$notification.post("test", "test",  cgiDataStr);
$done({ response: { status: 302, headers: { Location: str1 } } });



