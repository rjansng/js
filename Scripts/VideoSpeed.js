var body = $response.body.replace('</body>', '<script>setTimeout(function(){var w=window;w._v=null;w._v2=null;w._w=w;var gov=function(ed,ew){if(ed==null){if(ew!=null){w._v2=1}return null};var ov=ed.querySelector("video");if(ov==null){var o=ed.querySelectorAll("iframe");for(var i=0;i<o.length;i++){var ov=gov(o[i].contentDocument,o[i].contentWindow);if(ov!=null){w._w=o[i].contentWindow;break}}}return ov};w._v=gov(document);w._v.webkitEnterFullScreen()},3000);</script></body>');
$done({body});
//$notification.post("test", "test", body);
//$done({});