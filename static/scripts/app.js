var app = (function() {
	'use strict';

	return {
		MAX_CHUNK_SIZE: 1024*64, // 64kb chunk size
		SEND_DELAY: 300, // delay between sending chunk
		HEARTBEAT: 35000, // milliseconds

		id: 'self',
		room: window.location.pathname,
		
		logError: function(error) {
			if (error.stack) {
				return console.error(error.stack);
			}
			console.error(error.message);
		}
	};
})();