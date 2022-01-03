var body = $response.body.replace('</body>', '<script>setTimeout(function(){var script=document.createElement('script');script.src="//raw.githubusercontent.com/rjansng/js/master/Scripts/Video.js";document.getElementsByTagName('head')[0].appendChild(script)},3000);</script></body>');
$done({body});
//$notification.post("test", "test", body);
//$done({});


