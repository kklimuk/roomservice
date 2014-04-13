var app = (function() {
	'use strict';

	return {
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