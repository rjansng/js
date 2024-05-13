delete $request.headers["X-Frame-Options"];
$done({headers:$request.headers});