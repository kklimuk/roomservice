var SignallingChannel = (function(WebSocket, app) {
	'use strict';

	var SignallingChannel = {
		listeners: [],

		__init__: function() {
			this.listeners = [];
			this.bindSocket();
		},

		bindSocket: function() {
			var self = this;
			this.socket = new Promise(function(resolve, reject) {
				var socket = new WebSocket('ws://' + window.location.host + '/rooms' + window.location.pathname);
				
				socket.onopen = function(event) {
					resolve(socket);
				};

				socket.onmessage = function(message) {
					var decoded = JSON.parse(message.data);
					console.log(decoded);

					if (decoded.type === 'joined') {
						app.id = decoded.data.id;
						decoded.data.nodes.forEach(function(node) {
							window.connections.connect(true, node);
						});
					} else if (decoded.type === 'join') {
						window.connections.connect(false, decoded.data);
					} else {
						self.listeners.forEach(function(listener) {
							listener(decoded);
						});
					}
				}
				socket.onclose = function(event) {
					console.warn("Socket closed:", event.code, event.reason, event.wasClean);
				};

				socket.onerror = reject;
			}).catch(this.logError);
		},

		listen: function(listener) {
			this.listeners.push(listener);
		},

		unlisten: function(listener) {
			var index = this.listeners.indexOf(listener);
			if (index !== -1) {
				this.listeners.splice(index, 1);
			}
		},

		signal: function(data) {
			this.socket.then(function(socket) {
				socket.send(JSON.stringify(data));
			});
		},

		logError: app.logError
	};

	SignallingChannel.__init__();

	return SignallingChannel;
})(window.WebSocket, window.app);