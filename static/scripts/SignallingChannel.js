var SignallingChannel = (function(WebSocket) {
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
					self.listeners.forEach(function(listener) {
						listener(decoded);
					});
				};

				socket.onclose = function(event) {
					console.warn("Socket closed:", event.code, event.reason, event.wasClean);
				};

				socket.onerror = reject;
			}).catch(this.logError);
		},

		listen: function(listener) {
			this.listeners.push(listener);
		},

		signal: function(data) {
			this.socket.then(function(socket) {
				socket.send(JSON.stringify(data));
			});
		},

		logError: function(error) {
			if (error.stack) {
				return console.error(error.stack);
			}
			console.error(error.message);
		}
	};

	SignallingChannel.__init__();

	return SignallingChannel;
})(window.WebSocket);