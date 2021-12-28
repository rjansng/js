    var ExampleUrl = 'javascript:(function(){var jsf=document.createElement("script");jsf.setAttribute("type","text/javascript");jsf.setAttribute("src","//www.sdany.org/usjs/sdany_comic_utf8.user.js?_="+(Math.floor(Math.random()*(99999-10000+1))+10000).toString());document.getElementsByTagName("head")[0].appendChild(jsf);})();';
    $httpClient.get(ExampleUrl,function(error,response,data)
    {
        var StatusCode,ResponseHeaders;
        StatusCode = response.status;
        ResponseHeaders = response.headers;
        //console.log(response);
        //console.log(StatusCode);//400
        //console.log(ResponseHeaders);//Object
        //console.log(error);
        //console.log(data);
        //console.log(Json.parse(data));//if data is Json String
        //Loon支持使用Console.log输出调试信息
    })