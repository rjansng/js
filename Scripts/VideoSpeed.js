let headers = $response.headers;
let status = $response.status;

const htmlStr = $response.body;
const startStr = '<script';
const str = htmlStr.substring(htmlStr.indexOf(startStr) + startStr.length, htmlStr.indexOf('</script>'));
//let newstr = htmlStr.replace('</head>', '<script>alert("測試文字");</script></head>');
$notification.post('test', str, "");
//$done({
//    newstr
//});

   

 //var Title,SubTitle,Content;
  //   TItle = "我是主标题";
   //  SubTitle  = "我是子标题";
   //  Content = "我是要推送的内容";
   //  $notification.post(Title,SubTitle,Content);