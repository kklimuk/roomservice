var RTCPeerConnection = (function(app, cache) {
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

	// file requests on connection
	RTCPeerConnection.prototype.requestFile = function(file_name) {
		this.queue.push({
			name: file_name,
			buffers: [],
			type: '',
			chunk_count: 0,
			remaining: 0
		});

		if (this.queue.length === 1) {
			this.startRequest();
		}
	};

	RTCPeerConnection.prototype.startRequest = function() {
		this.channel.send(JSON.stringify({
			'type': 'request',
			'data': this.queue[0].name
		}));
	};

	RTCPeerConnection.prototype.send_chunked = function(buffer) {
		var count = Math.ceil(buffer.byteLength / app.MAX_CHUNK_SIZE),
			chunks = [];		

		for (var i = 0; i < count; i++) {
			chunks.push(buffer.slice(app.MAX_CHUNK_SIZE * i, 
				app.MAX_CHUNK_SIZE * (i + 1) > buffer.byteLength ? buffer.byteLength : 
					app.MAX_CHUNK_SIZE * (i + 1)));
		}

		var self = this;
		setTimeout(function send() {
			if (chunks.length === 0)
				return;

			self.channel.send(chunks.shift());
			setTimeout(send, 1000);
		}, 0);
	};

	RTCPeerConnection.prototype.getRequest = function(name) {
		if (name in cache.hash) {
			var file = cache.hash[name];

			var self = this;
			file.readAsArrayBuffer().then(function(buffer) {
				self.channel.send(JSON.stringify({
					'type': 'response',
					'data': {
						'name': name,
						'status': true,
						'type': file.type,
						'length': buffer.byteLength
					}
				}));

				self.send_chunked(buffer);
			});
		} else {
			connection.channel.send(JSON.stringify({
				'type': 'response',
				'data': {
					'name': name,
					'status': false
				}
			}))
		}
	};

	RTCPeerConnection.prototype.getRequestAcknowledgement = function(data) {
		if (!data.status) {
			this.queue.shift();
			if (this.queue.length > 0) {
				this.startRequest();
			}

			return window.alert('Failed to download ' + data.name + '. Please try again.');
		}

		this.queue[0].chunk_count = Math.ceil(data.length / app.MAX_CHUNK_SIZE);
		this.queue[0].remaining = this.queue[0];
		this.queue[0].type = data.type;
	};

	RTCPeerConnection.prototype.getChunk = function(chunk) {
		var compiler = this.queue[0];
		compiler.buffers.push(chunk)
		compiler.remaining -= 1;

		if (compiler.remaining === 0) {
			var blob = new Blob(compiler.buffers, { type: compiler.type });
			blob.name = compiler.name;
			window.dispatchEvent(new CustomEvent('downloadcomplete', { detail: blob }));

			this.queue.shift();
			if (this.queue.length > 0) {
				this.startRequest();
			}
		}
	};

	// setup the channel and handle incoming messages
	RTCPeerConnection.prototype.setupChannel = function() {
		var self = this;
		this.channel.onopen = function() {
			console.warn('Connection open:', self.id);
			window.dispatchEvent(new CustomEvent('connectionopen', { detail: self }));
		};

		this.channel.onmessage = function(message) {
			if (typeof message.data === 'string') {
				try {
					self.channel.oninstruction(JSON.parse(message.data));
				} catch (error) {}
			} else if (message.data instanceof ArrayBuffer) {
				self.getChunk(message.data);
			}
		};

		this.channel.oninstruction = function(instruction) {
			if (instruction.type === 'close') {
				window.dispatchEvent(new CustomEvent('connectionclosed', { detail: self }));
				self.close();
			} else if (instruction.type === 'add') {
				window.dispatchEvent(new CustomEvent('filesarrived', { detail: instruction.data }));
			} else if (instruction.type === 'clear') {
				window.dispatchEvent(new CustomEvent('filescleared', { detail: self }));
			} else if (instruction.type === 'request') {
				self.getRequest(instruction.data);
			} else if (instruction.type === 'response') {
				self.getRequestAcknowledgement(instruction.data);
			}
		};

		this.channel.onerror = app.logError;
	};

	// set the local description and send the offer/answer on its merry way
	RTCPeerConnection.prototype.onlocaldescription = function(description) {
		SignallingChannel.signal({
			'type': 'description',
			'source': app.id,
			'target': this.id,
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
})(window.app, window.cache);
