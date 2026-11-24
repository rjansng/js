var body = $response.body;
if (body) {
    try {
        var json = JSON.parse(body);
        if (json.error == 0) {
            json.data.recommended_vouchers = [];
            body = JSON.stringify(json);
        }

    } catch (e) {console.log(e); }
}
$done({body});
