const request = require('request');
console.log('requesting...');
request.post('http://192.168.11.100:9980/', {json: {key: 1234}}, (err, res, body) => {
	console.log('request finished.');
if (err) console.log(err);
	if (res) console.log(res);
	if (body) console.log(body);
});
console.log('end of script.');
