var service = (function(cache, ObservableArray) {
	'use strict';

	var opened_connections = new ObservableArray(),
		room_files = new ObservableArray();

  room_files.listen(RoomFileLister.onfilesloaded.bind(RoomFileLister));

	cache.listen(function(files, type, cache) {
		if (type === 'add') {
			room_files.extend(files.map(function(file) {
				return {
					source: 'self',
					name: file.name,
					modified: file.lastModifiedDate
				}
			}));

			opened_connections.forEach(function(connection) {
				connection.channel.send(JSON.stringify({
					'type': 'add',
					'data': files.map(function(file) {
						return {
							name: file.name,
							modified: file.lastModifiedDate
						};
					})
				}))
			});
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

})(window.cache, window.ObservableArray)
