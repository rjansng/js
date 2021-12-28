let headers = $response.headers;
let status = $response.status;
//$notification.post('test', "1", "");
const htmlStr = $response.body;
//const startStr = '<script';
//const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('</script>'));
let newstr = htmlStr.replace("<head>", "<head><script>alert('測試文字');</script>");
$notification.post('test', "test1", newstr);
//$done({
//    newstr
//});

   

 //var Title,SubTitle,Content;
  //   TItle = "我是主标题";
   //  SubTitle  = "我是子标题";
   //  Content = "我是要推送的内容";
   //  $notification.post(Title,SubTitle,Content);