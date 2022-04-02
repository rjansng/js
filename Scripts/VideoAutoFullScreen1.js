/*
^https?:\/\/777tv\.app\/vod\/play\/.+\.html
https://777tv.app/renrenp/?url=https://iqiyi.sd-play.com/20220107/ieVuDJPl/index.m3u8&next=//777tv.app
^https?:\/\/777tv\.me\/ep\/.+\.html

^https?:\/\/gimy\.app\/eps\/.+\.html
https://gimy.app/jcplayer/?url=renrenmi-ba79f8a6ea606a42&jctype=renrenmi&next=//gimy.app

https://gimytv.com/ep-9dT-7-16.html
https://gimytv.com/renrenp/?url=renrenmi-f9631745098089a4&jctype=renrenmi&next=//gimytv.com


https://bo.movie06.com/ddplay/?url=https://fendou.duoduozy.com/m3u8/202201/9/d84a206b0e80794396565b71089058e8556cc7ba.m3u8&jump=

https://gimy.app/jcplayer/?url=http://v.qq.com/x/cover/7q544xyrava3vxf/i0042wz6lwl.html&jctype=normal&next=//gimy.app

*/

const url = $request.url;
const body = $response.body;
//let headers = $response.headers;
//let status = $response.status;
var pc = 0;

/*
var headers='';
var status='';
var pc = 1;
var url = location.href;
var body = document.body.innerHTML;
//*/

var ddd = 'player_data';
var dss = 'renrenp';
var dee = '}';
var dpp = '';
var uu = ['777tv.app', '777tv.me', 'gimy.app', 'gimytv.com','ysgc.cc','ysgc.tv','libvio.com'];
var dd = [-1, -1, -1, 'player_aaaa', 'player_aaaa', 'player_aaaa'];
var ss = [-1, -1, 'jcplayer', -1, -1, -1, -1];
var ee = [-1, -1, -1, -1,'<', '<', '<'];
var nn = ['next', 'next', 'next', 'next','jump', 'jump', 'jump'];
//var dpp2 = '&jctype=renrenmi';
var dpp2 = '&jctype=normal';
var pp = [-1, -1, dpp2, dpp2,-1, -1, ];
var url2 = null;
for (var i = 0; i < uu.length; i++) {
    //console.log(uu);
    var re = new RegExp('.+\/\/([^\/]+)?' + uu[i] + '(\/.+\.html)', 'i');
    //console.log(re);
    //console.log('RE TEST');
    //console.log(re.test(url));
    if (re.test(url)) {
        var aa = 0;
        var eps = '';
        // 取得集數
        try {
            var url3 = url.replace(re, '$2');
            //var url3 = location.pathname;
            //var body = document.querySelector('html').innerHTML;
            aa = 2;
            var re2 = new RegExp('\<li[^\<\>]*\>[^\<\>]*\<a[^\<\>]+href="[^\<\>]+"[^\<\>]*\>([^\<\>]+)\<\/a\>[^\<\>]*\<\/li\>', 'ig');
            var res = body.match(re2);
            aa = 3;
            var ress = null;
            res.forEach(function (e) { if (e.match(url3.replace(/\//g, '\\/').replace(/-/g, '\\-').replace(/\./g, '\\.'))) ress = e; });
            aa = 4;
            if (ress != null) {
                //console.log(ress.replace(re, '$1'));
                aa = 5;
                ress = ress.replace(re2, '$1');
                eps = '&eps=' + ress;
                //console.log(eps);
            }

        } catch (e) {
            //    console.log('aa:'+aa);
            //    console.log(e);
        }
        url2 = uu[i];
        if (dd[i] != -1) { ddd = dd[i]; }
        if (ss[i] != -1) { dss = ss[i]; }
        if (pp[i] != -1) { dpp = pp[i]; }
        if (ee[i] != -1) { dee = ee[i]; }
        var startStr = 'var ' + ddd + '=';
        var i1 = body.indexOf(startStr) + startStr.length;
        var i2 = body.indexOf(dee, i1);

        if (url2 != null && i1 > 0 && i2 > i1) {
            try {
                var str = body.substring(i1, i2 + 1);
                  if (ee[i] != -1) { str = str.replace('<',''); }
                if (pc > 0) console.log('STR:' + str + '\n');
  
                var json = JSON.parse(str);
                if (pc > 0) console.log('JSON:');
                if (pc > 0) console.log(json);
                if (pc > 0) console.log('\n');

if (/ysgc/.test(url)) {
           dss = '';
            url2 = 'p.tjomet.com/duoduo';
console.log(str1);
        } else if (/libvio/.test(url)) {
	      dss = '';
            url2='bo.dd520.cc/xplay';
        } else {
           // $done({});
        }


                if (pc > 0) console.log('URL2:' + url2 + '\n');
                var str1 = 'https://' + url2 + '/' + dss + '/?url=' + json.url;
                if (json.url.match(/renrenmi/i)) { dpp = dpp.replace('normal', 'renrenmi'); }
                str1 += dpp;
                str1 += '&' + nn[i] + '=' + '//' + url2 + json.link_next;
                str1 += '&link_pre=' + '//' + url2 + json.link_pre;
                if (eps != '') str1 += eps;

                json.link_next = '//' + url2 + json.link_next;
                json.link_pre = '//' + url2 + json.link_pre;
                if (eps != '') {
                    var red = new RegExp(/[^\d]*(\d+)[^\d]*/i);
                    if (eps != null && eps.match(red)) {
                        eps = eps.replace(red, "$1");
                    }
                    json.eps = eps;
                }

                if (pc > 0) console.log('STR1:');
                if (pc > 0) console.log(str1);
                if (pc > 0) console.log('\n');

                var output = '';
                // 直接改內建播放
                //if (json.url.match(/^http.+\.(mp4|m3u8).*/i)) {
                //    output = '<html><head>'
                //        + '<meta charset="utf-8" />'
                //        + '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=1">'
                //        + '<style>'
                //        + 'body * {box-sizing: border-box!important;}'
                 //       + 'body{width:100vw;height:100vh;margin:auto;padding:0;background-color:black;vertical-align:middle;}'
                //        + 'video{width:100vw;height:100vh;display:block;}'
                 //       + '</style>'
               //         + '<script>var p_d='+JSON.stringify(json)+';</script>'
                //        + '</head><body>'
               //         + '<video src="' + json.url + '" preload="auto" controls webkit-playsinline playsinline autoplay muted></video>'
               //         + '<script src="//sdany.somee.com/usjs/speedvideo2.js'
               //         + '?_=' + (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000).toString()
              //          + '"></script>'
              //          + '</body></html>';
              //      console.log('video url');
             //   }
             //   else
            //    {
                    output = '<html><head><meta http-equiv="refresh" content="0;url=' + str1 + '"/></head><body></body></html>';
                    console.log('Refresh url');
            //    }
                //headers.Location = str1;
                //status = 302;
                //if (pc == 0) { $done({ status, headers }); }

                console.log(output);
                console.log('Run Done 1');
                if (pc == 0) { $done({ body: output }); }
            } catch (e) {
                //        console.log('ERROR:');
                //        console.log(e);
                //        console.log('\n');
            }
        }
        break;
    }
}
//if (status != 302) console.log('No Data');
if (pc == 0) { $done({ body }); }