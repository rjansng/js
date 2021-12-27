var body = $response.body.replace('<script>', '<script src="https://www.sdany.org/usjs/sdany_comic_utf8.user.js"></script><script>');
 $notification.post("test", "測試", "寫入測試");
$done({body});