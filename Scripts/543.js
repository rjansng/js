let body = $response.body.replace("</body>","<script>(()=>{setTimeout(function(){document.querySelector('div[style] a button').parentElement.parentElement.remove();var xx =document.querySelectorAll('.gadBlock');xx[0].innerHTML="";xx[1].innerHTML="";xx[2].innerHTML="";},500);})();</script></body>");
$done({body});