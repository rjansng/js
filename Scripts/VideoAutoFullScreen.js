const $ = new Env()
const body = $response.body;
const url = $request.url;
let headers = $response.headers;
let status = $response.status;
status = 302;
var re2 = new RegExp(/.+\/((777tv|gimy|www.ysgc|gimytv)\.(app|me|cc|com))\/.+\.html.*$/i);

var startStr = 'var player_data='; //var player_aaaa
if (/ysgc/.test(url)) {
    startStr = 'var player_aaaa=';
    console.log(startStr);
}
var i1 = body.indexOf(startStr) + startStr.length;
var i2 = body.indexOf('}', i1);

function ysgc(search_url) {
   const options = {
        url: search_url,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios",
       Referer: "https://www.ysgc.cc/"
        }
    }
console.log(search_url);
	$.get(options, (err, resp, data) => {$persistentStore.write(data, 'ysgc');
	})
	 $.done()
}

if (re2.test(url) && i1 > 0 && i2 > i1) {
    try {
        var strr = body.substring(i1, i2 + 1);
        var json = JSON.parse(strr);
        var url2 = url.replace(re2, '$1');
        //console.log('URL2:' + url2 + '\n');
        var str1 = null;
        var str2 = null;
        console.log(url2);
        if (/777/.test(url)) {
            str2 = 'renrenp';
        } else if (/gimy/.test(url)) {
            str2 = 'jcplayer';
        } else if (/ysgc/.test(url)) {
            // json.url = unescape(base64decode(json.url));
         
            ysgc("https://jiexi.ysgc.xyz/duoduo/?url=" + json.url);
		body = $persistentStore.write(data, 'ysgc');
console.log(body);
 	    $done({
                body
            });
            //body = ysgc("https://jiexi.ysgc.xyz/?url=" + json.url);
            //headers.Location = "https://jiexi.ysgc.xyz/?url=" + json.url;
            //headers.Location = "https://jiexi.ysgc.xyz/duoduo/?url=" + json.url;
            //if (json.from == "duoduozy") {
            //    headers.Location = "https://jiexi.ysgc.xyz/?url=" + json.url;
            // } else {
            //    headers.Location = "https://jiexi.ysgc.xyz/?url=" + json.url;
            // }
        } else {
            $done({});
        }
        str1 = 'https://' + url2 + '/' + str2 + '/?url=' + json.url + '&next=//' + json.link_next;
        headers.Location = str1;
    } catch (e) {
        //console.log('ERROR:');
        //console.log(e);
        //console.log('\n');
    }
}
$done({
    status, headers, body
});




function Env() {
  LN = typeof $loon != "undefined"
  SG = typeof $httpClient != "undefined" && !LN
  QX = typeof $task != "undefined"
  read = (key) => {
    if (LN || SG) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG) return $persistentStore.write(key, val); 
    if (QX) return $prefs.setValueForKey(key, val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { "open-url": url })
  }
  get = (url, cb) => {
    if (LN || SG) {$httpClient.get(url, cb)}
    if (QX) {url.method = 'GET'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG) {$httpClient.post(url, cb)}
    if (QX) {url.method = 'POST'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  put = (url, cb) => {
    if (LN || SG) {$httpClient.put(url, cb)}
    if (QX) {url.method = 'PUT'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { LN, SG, QX, read, write, notice, get, post, put, log, done }
}