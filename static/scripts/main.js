var connections = (function(RTCPeerConnection, SignallingChannel, FileLoader) {
	'use strict';

	var connections = [];
	function connect(initiator) {
		var connection = new RTCPeerConnection({ 
			"iceServers": [{ "url": "stun:stun.l.google.com:19302" }] 
		}, {
			"optional": [{ "RtpDataChannels": true }]
		});
		connection.initiator = initiator ? true : false;

		// triggered by channel creation (see RTCPeerConnection)
		connection.onnegotiationneeded = function() {
			this.createOffer(this.onlocaldescription.bind(this), this.logError);
		};

		// once the request/offer process has been completed, send over the candidates
		connection.onicecandidate = function(event) {
			if (event.candidate) {
				SignallingChannel.signal({
					'type': 'candidate',
					'data': event.candidate
				});
			}
		};

		SignallingChannel.listen(connection.onmessage.bind(connection));
		return connection;
	}

	window.addEventListener('DOMContentLoaded', function() {
		new FileLoader(document.querySelector('fileloader'));
	});


	// handle exiting the page
	window.addEventListener('beforeunload', function() {
		connections.forEach(function(connection) {
				if (connection.channel) {
				connection.channel.send(JSON.stringify({
					'type': 'close',
					'data': true
				}));
			}
		});
	});


	// handle remote connection closes
	window.addEventListener('connectionclosed', function(event) {
		var connection = event.detail;
		var index = connections.indexOf(connection);
		if (index !== -1) {
			connections.splice(index, 1);
		}
	});


	connections.push(connect());
	return connections;
})(window.RTCPeerConnection, window.SignallingChannel, window.FileLoader);