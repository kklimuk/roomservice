(function(RTCPeerConnection, SignallingChannel) {
	'use strict';


	var connection = new RTCPeerConnection({ 
		"iceServers": [{ "url": "stun:stun.l.google.com:19302" }] 
	}, {
		"optional": [{ "RtpDataChannels": true }]
	});

	connection.onnegotiationneeded = function() { // triggered by channel creation
		this.createOffer(this.onlocaldescription.bind(this), this.logError);
	};

	connection.onicecandidate = function(event) {
		if (event.candidate) {
			SignallingChannel.signal({
				'type': 'candidate',
				'data': event.candidate
			});
		}
	};

	SignallingChannel.listen(connection.onmessage.bind(connection));

})(window.RTCPeerConnection, window.SignallingChannel);