let bodyQ = $request.body;
let body = $response.body;
if (body) {
	try {
		let json = JSON.parse(body);
		if (json.error === 0) {
			let jsonQ = {};
			if (bodyQ) {
				jsonQ = JSON.parse(bodyQ);
				console.log(bodyQ);
			}
			if (!jsonQ.hasOwnProperty('user_voucher_list_type')) {
				let d = [];
				let dd = json.data.user_voucher_list;
				console.log(dd.length);
				if (dd.length > 0) {
					for (let i = 0; i < dd.length; i++) {
						if (dd[i].customer_reference_id.indexOf('SHOP-') == -1) {
							d.push(dd[i]);
						}
					}

				}
				console.log(d.length);
				json.data.user_voucher_list = d;

				body = JSON.stringify(json);
			}
		}

	} catch (e) {
		console.log(e);
		console.log(body);
		console.log('\n\n');
	}
}
//console.log(body);
$done({ body });
