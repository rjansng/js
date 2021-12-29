var body = $response.body;
body = body.replace("</head>","<script >alert('test');</script></head>";
$done({body});