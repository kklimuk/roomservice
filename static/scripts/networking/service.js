var service = (function(app, cache, ObservableArray) {
	'use strict';

	var opened_connections = new ObservableArray(),
		room_files = new ObservableArray();

	cache.listen(function(files, type, cache) {
		if (type === 'add') {
			room_files.extend(files.map(function(file) {
				return {
					source: app.id,
					name: file.name,
					modified: file.lastModifiedDate
				}
			}));
		}
	});

	window.addEventListener('connectionopen', function(event) {
		var connection = event.detail;
		opened_connections.push(connection);
	});


	window.addEventListener('connectionclosed', function(event) {
		var connection = event.detail;
		opened_connections.remove(connection);
	});

	return {
		connections: opened_connections,
		files: room_files
	};

})(window.app, window.cache, window.ObservableArray)
