let headers = $response.headers;
let status = $response.status;
let url = $request.url;

//$notification.post('test', "test1", url);
url = "https://raw.githubusercontent.com/rjansng/js/master/Scripts/Video.js"

$done({
    url
});
//const htmlStr = $response.body;
//let newstr = htmlStr.replace("<head>", "<head><script>alert('測試文字');</script>");
//$notification.post('test', "test1", newstr);
//$done({
//    newstr
//});

   

 //var Title,SubTitle,Content;
  //   TItle = "我是主标题";
   //  SubTitle  = "我是子标题";
   //  Content = "我是要推送的内容";
   //  $notification.post(Title,SubTitle,Content);