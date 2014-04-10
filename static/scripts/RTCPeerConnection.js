var RTCPeerConnection = (function(app) {
	'use strict';

	var RTCPeerConnection = webkitRTCPeerConnection;

	// respond to signalling channel messages
	RTCPeerConnection.prototype.onmessage = function(message) {
		if (message.type === 'initiator') {
			this.oninit(message);
		} else if (message.type === 'join') {
			this.onremotejoin();
		} else if (message.type === 'description') {
			this.onremotedescription(message);
		} else if (message.type === 'candidate') {
			this.onaddicecandidate(message);
		}
	};

	RTCPeerConnection.prototype.oninit = function(message) {
		this.initiator = message.data;
		if (!this.initiator) {
			var self = this;
			this.ondatachannel = function(event) {
				self.channel = event.channel;
				self.setupChannel();
			};
		}
	};

	// when a remote joins, set up the datachannel
	RTCPeerConnection.prototype.onremotejoin = function() {
		var self = this;
		if (this.initiator) {
			if (!this.channel) {
				this.channel = this.createDataChannel(window.location.pathname);
				this.setupChannel();
			}
		}
	};

	RTCPeerConnection.prototype.setupChannel = function() {
		var self = this;
		this.channel.onopen = function() {
			console.log('Channel open, captain!');
		};

		this.channel.onmessage = function(message) {
			console.log(message);
		};
	};

	// set the local description and send the offer/answer on its merry way
	RTCPeerConnection.prototype.onlocaldescription = function(description) {
		SignallingChannel.signal({
			'type': 'description', 
			'data': description
		});
		this.setLocalDescription(description);
	};

	// a remote description has arrived
	RTCPeerConnection.prototype.onremotedescription = function(message) {
		var self = this;
		this.setRemoteDescription(new RTCSessionDescription(message.data), function() {
			if (message.data.type === 'offer') {
				self.createAnswer(self.onlocaldescription.bind(self), self.logError);
			}
		}, this.logError);
	};

	// when the peers send over ice candidates, add them
	RTCPeerConnection.prototype.onaddicecandidate = function(message) {
		this.addIceCandidate(new RTCIceCandidate(message.data), function () {}, this.logError);
	};

	// logging helper
	RTCPeerConnection.prototype.logError = app.logError;

	return RTCPeerConnection;
})(window.app);