var app = (function() {
	'use strict';

	return {
		logError: function(error) {
			if (error.stack) {
				return console.error(error.stack);
			}
			console.error(error.message);
		}
	};
})();