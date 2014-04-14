var SignallingChannel = (function(app, WebSocket) {
	'use strict';

	var SignallingChannel = {
		listeners: [],

		__init__: function() {
			this.listeners = [];
			this.listener_hash = {};
			this.bindSocket();
		},

		bindSocket: function() {
			var self = this;
			this.socket = new Promise(function(resolve, reject) {
				var socket = new WebSocket('ws://' + window.location.host + '/rooms' + app.room);
				
				socket.onopen = function(event) {
					resolve(socket);

					setInterval(function() {
						self.signal({
							'type': 'heartbeat'
						});
					}, app.HEARTBEAT);
				};

				socket.onmessage = function(message) {
					var decoded = JSON.parse(message.data);

					if (decoded.type === 'joined') {
						app.id = decoded.data.id;
						window.RoomFileLister.__init__();

						decoded.data.nodes.forEach(function(node) {
							window.connections.connect(true, node);
						});
					} else if (decoded.type === 'join') {
						window.connections.connect(false, decoded.data);
					} else if (decoded.source) {
						var target = self.listener_hash[decoded.source];
						if (target) {
							target(decoded);
						}
					} else {
						self.listeners.forEach(function(listener) {
							listener(decoded);
						});
					}
				}

				socket.onclose = function(event) {
					console.warn("Server connection terminated:", event.code);
				};

				socket.onerror = reject;
			}).catch(this.logError);
		},

		listen: function(listener) {
			this.listeners.push(listener);
			this.listener_hash[listener.id] = listener;
		},

		unlisten: function(listener) {
			var index = this.listeners.indexOf(listener);
			if (index !== -1) {
				this.listeners.splice(index, 1);
				delete this.listener_hash[listener.id];
			}
		},

		signal: function(data) {
			this.socket.then(function(socket) {
				socket.send(JSON.stringify(data));
			});
		},

		logError: app.logError
	};

	return SignallingChannel;
})(window.app, window.WebSocket);