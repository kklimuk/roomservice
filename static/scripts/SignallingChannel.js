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
					if (message.data !== '') {
						var decoded = JSON.parse(message.data);
						self.listeners.forEach(function(listener) {
							listener(decoded);
						});
					}
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

		logError: app.logError
	};

	SignallingChannel.__init__();

	return SignallingChannel;
})(window.WebSocket, window.app);