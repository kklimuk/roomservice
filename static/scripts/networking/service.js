var service = (function(app, cache, ObservableArray) {
	'use strict';

	var opened_connections = new ObservableArray(),
		room_files = new ObservableArray();

	function clean_room(id) {
		var clean_up = [],
			length = room_files.length;
		for (var i = 0; i < length; i++) {
			if (room_files[i].source === id) {
				clean_up.push(room_files[i]);
			}
		}

		room_files.remove.apply(room_files, clean_up);
	}

	room_files.extend([].slice.call(cache));
	cache.listen(function(files, type) {
		if (type === 'add') {
			var added = files.map(function(file) {
				return {
					source: app.id,
					name: file.name
				}
			});
			room_files.extend(added);

			[].forEach.call(opened_connections, function(connection) {
				connection.channel.send(JSON.stringify({
					'type': 'add',
					'data': added
				}));
			});
		} else if (type === 'remove' && files.length === 0) {
			clean_room(app.id);
			[].forEach.call(opened_connections, function(connection) {
				connection.channel.send(JSON.stringify({
					'type': 'clear',
					'data': app.id
				}));
			});
		}
	});

	window.addEventListener('filesarrived', function(event) {
		var files = event.detail;
		room_files.extend(files);
	});

	window.addEventListener('filescleared', function(event) {
		var connection = event.detail;
		clean_room(connection.id);
	});

	window.addEventListener('connectionopen', function(event) {
		var connection = event.detail;
		opened_connections.push(connection);

		connection.channel.send(JSON.stringify({
			'type': 'add',
			'data': [].slice.call(room_files).filter(function(file) {
				return file.source === app.id;
			})
		}));
	});

	window.addEventListener('connectionclosed', function(event) {
		var connection = event.detail;
		opened_connections.remove(connection);
		clean_room(connection.id);
	});

	return {
		connections: opened_connections,
		files: room_files
	};

})(window.app, window.cache, window.ObservableArray)
