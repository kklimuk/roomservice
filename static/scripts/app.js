var app = (function() {
	'use strict';

	return {
		id: 'self',
		room: window.location.pathname,
		MAX_CHUNK_SIZE: 1024*64,
		HEARTBEAT: 5000,
		
		logError: function(error) {
			if (error.stack) {
				return console.error(error.stack);
			}
			console.error(error.message);
		}
	};
})();