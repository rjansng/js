delete $response.headers["X-Xss-Protection"];
delete $response.headers["x-xss-protection"];
delete $response.headers["X-Frame-Options"];
delete $response.headers["x-frame-options"];
$done({headers:$response.headers});
