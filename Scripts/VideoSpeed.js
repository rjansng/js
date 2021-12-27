var body = $response.body.replace('<script>', '<script src="//www.sdany.org/usjs/sdany_comic_utf8.user.js"></script><script>');
$done({
    body
});