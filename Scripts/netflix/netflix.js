delete $request.headers["X-Xss-Protection"];
delete $request.headers["x-xss-protection"];
delete $request.headers["X-Frame-Options"];
delete $request.headers["x-frame-options"];
$done({headers:$request.headers});
