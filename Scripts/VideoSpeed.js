var body = $response.body.replace('</body>', '<script>setTimeout(function(){var w=window;w._v=null;w._v2=null;w._w=w;var gov=function(ed,ew){if(ed==null){if(ew!=null){w._v2=1}return null};var ov=ed.querySelector("video");if(ov==null){var o=ed.querySelectorAll("iframe");for(var i=0;i<o.length;i++){var ov=gov(o[i].contentDocument,o[i].contentWindow);if(ov!=null){w._w=o[i].contentWindow;break}}}return ov};setTimeout(function(){w._v=gov(document);if(_v==null&&_v2==null){alert("Not Video")}else if(_v2!=null&&_v2==1){alert("跨網域，無法取得 Video！")}else{w._w.rPFS=function(elem){var fs=elem.webkitRequestFullscreen||elem.mozRequestFullScreen||elem.msRequestFullscreen||elem.webkitEnterFullscreen;fs.call(elem)}}w._w.rPFS(w._v)},2000)},7000;)</script></body>');
$done({body});
//$notification.post("test", "test", body);
//$done({});


