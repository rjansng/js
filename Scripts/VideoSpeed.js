let RespnseBodyData = $response.body;
//RespnseBodyData = '<script>alert("測試文字");</script>';
console.log(RespnseBodyData);//输出数据
    $done({RespnseBodyData});//修改完成之后需要调用$done

   

 //var Title,SubTitle,Content;
  //   TItle = "我是主标题";
   //  SubTitle  = "我是子标题";
   //  Content = "我是要推送的内容";
   //  $notification.post(Title,SubTitle,Content);