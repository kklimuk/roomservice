(function(FileLoader, connections) {
	'use strict';

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

})(window.FileLoader, window.connections);