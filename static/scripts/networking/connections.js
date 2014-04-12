var connections = (function(app, RTCPeerConnection, SignallingChannel) {
	'use strict';

	var connections = [];
	connections.connect = function connect(initiator, id) {
		var connection = new RTCPeerConnection({ 
			"iceServers": [{ "url": "stun:stun.l.google.com:19302" }] 
		}, {
			"optional": [{ "RtpDataChannels": true }]
		});

		connection.id = id;

		if (!initiator) {
			connection.ondatachannel = function(event) {
				this.channel = event.channel;
				this.setupChannel();
			}.bind(connection);
		} else {
			connection.channel = connection.createDataChannel(app.room);
			connection.setupChannel();
		}

		// triggered by channel creation (see RTCPeerConnection)
		connection.onnegotiationneeded = function() {
			this.createOffer(this.onlocaldescription.bind(this), this.logError);
		};

		// once the request/offer process has been completed, send over the candidates
		connection.onicecandidate = function(event) {
			if (event.candidate) {
				SignallingChannel.signal({
					'type': 'candidate',
					'source': app.id,
					'target': this.id,
					'data': event.candidate
				});
			}
		};

		connection.listener = connection.onmessage.bind(connection);
		connection.listener.id = connection.id;

		SignallingChannel.listen(connection.listener);

		connections.push(connection);
		return connection;
	}


	// handle remote connection closes
	window.addEventListener('connectionclosed', function(event) {
		var connection = event.detail;
		console.warn("Connection closed:", connection.id);

		var index = connections.indexOf(connection);
		if (index !== -1) {
			connections.splice(index, 1);
		}
	});


	return connections;
})(window.app, window.RTCPeerConnection, window.SignallingChannel);