var body = $response.body.replace('</body>', '<script>setTimeout(function(){var dcE=function(ln,o=null){return document.createElement(ln,o)};var w=window;w._v=null;w._f=null;w._v2=null;w._w=w;var gov1=function(ed,ew){if(ed==null){if(ew!=null){w._v2=1}return null};var ov=ed.querySelector(".leleplayer-controller");if(ov==null){var o=ed.querySelectorAll("iframe");for(var i=0;i<o.length;i++){var ov=gov1(o[i].contentDocument,o[i].contentWindow);if(ov!=null){w._w=o[i].contentWindow;break}}}return ov};w._f=gov1(document);w._f.getElementsByClassName("leleplayer-icon leleplayer-full-icon")[0].click()},5000);</script></body>');

$done({body}); 
//$notification.post("test", "test", body);
//$done({});


