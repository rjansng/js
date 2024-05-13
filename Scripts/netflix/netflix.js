delete $request.headers["X-Frame-Options"];
delete $request.headers["x-frame-options"];
$done({headers:$request.headers});