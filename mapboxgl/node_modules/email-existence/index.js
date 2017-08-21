var dns = require('dns'),
    net = require('net'),
    os = require('os');

module.exports = function (email, callback, timeout, from_email) {
	timeout = timeout || 5000;
	from_email = from_email || email;
	if (!/^\S+@\S+$/.test(email)) {
		callback(null, false);
		return;
	}
	dns.resolveMx(email.split('@')[1], function(err, addresses){
		if (err || addresses.length === 0) {
			callback(err, false);
			return;
		}
		var conn = net.createConnection(25, addresses[0].exchange);
		var commands = [ "helo " + addresses[0].exchange, "mail from: <"+from_email+">", "rcpt to: <"+email+">" ];
		var i = 0;
		conn.setEncoding('ascii');
		conn.setTimeout(timeout);
		conn.on('error', function() {
			conn.emit('false');
		});
		conn.on('false', function () {
			callback(err, false);
			conn.removeAllListeners();
		});
		conn.on('connect', function() {
			conn.on('prompt', function () {
				if(i < 3){
					conn.write(commands[i]);
					conn.write('\r\n');
					i++;
				} else {
					callback(err, true);
					conn.removeAllListeners();
					conn.destroy(); //destroy socket manually
				}
			});
			conn.on('undetermined', function () {
				//in case of an unrecognisable response tell the callback we're not sure
				callback(err, false, true);
				conn.removeAllListeners();
				conn.destroy(); //destroy socket manually
			});
			conn.on('timeout', function () {
				conn.emit('undetermined');
			});
                        conn.on('data', function(data) {
                                if(data.indexOf("220") == 0 || data.indexOf("250") == 0 || data.indexOf("\n220") != -1 || data.indexOf("\n250") != -1) {
                                        conn.emit('prompt');
                                } else if(data.indexOf("\n550") != -1 || data.indexOf("550") == 0) {
                                        conn.emit('false');
                                } else {
                                        conn.emit('undetermined');
                                }
                        });
		});
	});
};

// compatibility
module.exports.check = module.exports;
