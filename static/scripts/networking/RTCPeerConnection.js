var RTCPeerConnection = (function(app) {
	'use strict';

	var RTCPeerConnection = webkitRTCPeerConnection;

	// respond to signalling channel messages
	RTCPeerConnection.prototype.onmessage = function(message) {
		if (message.type === 'description') {
			this.onremotedescription(message);
		} else if (message.type === 'candidate') {
			this.onaddicecandidate(message);
		}
	};

	RTCPeerConnection.prototype.setupChannel = function() {
		var self = this;
		this.channel.onopen = function() {
			console.log('Channel open, capitan!');
			window.dispatchEvent(new CustomEvent('connectionopen', { detail: self }));
		};

		this.channel.onmessage = function(message) {
			if (typeof message.data === 'string') {
				self.channel.oninstruction(JSON.parse(message.data));	
			}
		};

		this.channel.oninstruction = function(instruction) {
			if (instruction.type === 'close') {
				window.dispatchEvent(new CustomEvent('connectionclosed', { detail: self }));
				self.close();
			}
		};

		this.channel.onerror = app.logError;
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