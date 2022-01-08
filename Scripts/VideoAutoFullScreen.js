const body = $response.body;
const url = $request.url;
let headers = $response.headers;
let status = $response.status;
var re2 = new RegExp(/.+\/((777tv|gimy|www.ysgc)\.(app|me|cc))\/.+\.html.*$/i);

var startStr = 'var player_data='; //var player_aaaa
if (/ysgc/.test(url)){
	startStr = 'var player_aaaa=';
}
var i1 = body.indexOf(startStr) + startStr.length;
var i2 = body.indexOf('}', i1);


if (re2.test(url) && i1 > 0 && i2 > i1) {
    try {
        var str = body.substring(i1, i2 + 1);
        //console.log('STR:' + str + '\n');

        var json = JSON.parse(str);
        //console.log('JSON:');
        //console.log(json);
        //console.log('\n');

        var url2 = url.replace(re2, '$1');
        //console.log('URL2:' + url2 + '\n');
		var str1 = null;
		var str2 = null;
		if (/777/.test(url)){
		    	str2 = 'renrenp';
		}else if (/gimy/.test(url)){
			str2 = 'jcplayer';
		}else if (/ysgc/.test(url)){
			str2 = 'ddplay';
			url2 = 'bo.movie06.com';
			json.url =unescape(base64decode(json.url));
			//https://bo.movie06.com/ddplay/?url=https://fendou.duoduozy.com/m3u8/202112/9/ab83797c2048f6b1875d1e290d5bc392c5a7fb49.m3u8&jump=/vodplay/48098-1-2.html
		}else{
			body = '';
			$done({});
		}
		    str1 = 'https://' + url2 + '/' + str2 + '/?url=' + json.url + '&next=//' + json.link_next;
   
        //console.log('STR1:');
        //console.log(str1);
        //console.log('\n');

        headers.Location = str1;
        status = 302;
        body = '';
    } catch (e) {
        console.log('ERROR:');
        console.log(e);
        console.log('\n');
    }
}
$done({ status, headers, body });