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

// Imma let you finish, but I've got the best commit of all TIMEEE
// HOW BOUT DAT RPG CHEATIN'??!?!??!?!?

})(window.FileLoader, window.connections);