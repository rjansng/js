var url = $request.url;
const url0 = "https://777tv.app/template/mytheme/statics/img/play.png";
if (url.indexOf(url0) != -1) url = 'javascript:(function(){var jsf=document.createElement("script");jsf.setAttribute("type","text/javascript");jsf.setAttribute("src","//www.sdany.org/usjs/sdany_comic_utf8.user.js?_="+(Math.floor(Math.random()*(99999-10000+1))+10000).toString());document.getElementsByTagName("head")[0].appendChild(jsf);})();';
$done({ url });