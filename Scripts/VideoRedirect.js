const htmlStr = $response.body;

const startStr = 'var player_data=';
const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('</script>'));
const cgiDataStr =  JSON.parse(str);


var str1 = null;
var str2 = null;
    if (cgiDataStr.url == undefined ) {
       
    } else {
        str1 = 'https://777tv.me/renrenp/?url=' + cgiDataStr.url + '&next=//777tv.me' + cgiDataStr.link_next;
    }


$notification.post("test", "test",  str1);
$done({ response: { status: 302, headers: { Location: str1 } } });



