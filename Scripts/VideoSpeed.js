//let body = $response.body;
//body = $response.body.replace("</head>","<script //src='https://raw.githubusercontent.com/rjansng/js/master/Scripts/Video.js'></script></head>");
//$done({body});

var body = $response.body;
body+='<script src="https://raw.githubusercontent.com/rjansng/js/master/Scripts/Video.js"></script>';
$done({
    body
});



//$notification.post('test', "test1", url);
//headers.Location = 'javascript:(function(){var jsf=document.createElement("script");jsf.setAttribute("type","text/javascript");jsf.setAttribute("src","https://raw.githubusercontent.com/rjansng/js/master/Scripts/Video.js?_="+(Math.floor(Math.random()*(99999-10000+1))+10000).toString());document.getElementsByTagName("head")[0].appendChild(jsf);})();'

//$done({
//    headers
//});
//const htmlStr = $request.body;
//let newstr = htmlStr.replace("<head>", "<head>(function(){var jsf=document.createElement('script');jsf.setAttribute('type','text/javascript');jsf.setAttribute('src','https://raw.githubusercontent.com/rjansng/js/master/Scripts/Video.js?_='+(Math.floor(Math.random()*(99999-10000+1))+10000).toString());document.getElementsByTagName('head')[0].appendChild(jsf);})();</script>");
//$notification.post('test', "test1", newstr);
//$done({
//   newstr
//});

