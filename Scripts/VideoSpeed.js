    var RespnseBodyData = $response.body
  //  RespnseBodyData = Json.parse(RespnseBodyData);
    RespnseBodyData.replace('</head>', 'function(){var jsf=document.createElement("script");jsf.setAttribute("type","text/javascript");jsf.setAttribute("src","//www.sdany.org/usjs/sdany_comic_utf8.user.js?_="+(Math.floor(Math.random()*(99999-10000+1))+10000).toString());document.getElementsByTagName("head")[0].appendChild(jsf);}
</head>');
    $done({RespnseBodyData});//修改完成之后需要调用$done

   

 //var Title,SubTitle,Content;
  //   TItle = "我是主标题";
   //  SubTitle  = "我是子标题";
   //  Content = "我是要推送的内容";
   //  $notification.post(Title,SubTitle,Content);