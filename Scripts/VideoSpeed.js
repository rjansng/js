let headers = $response.headers;
let status = $response.status;

const htmlStr = $response.body;
let newstr = htmlStr.replace('</head>', '<script>alert("測試文字");</script></head>');
$done({
    newstr
});

   

 //var Title,SubTitle,Content;
  //   TItle = "我是主标题";
   //  SubTitle  = "我是子标题";
   //  Content = "我是要推送的内容";
   //  $notification.post(Title,SubTitle,Content);