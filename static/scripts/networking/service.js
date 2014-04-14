var service = (function(app, cache, ObservableArray) {
	'use strict';

	var opened_connections = new ObservableArray(),
		room_files = new ObservableArray();

	// set up a hash based for open connections by id
	opened_connections.hash = {};
	opened_connections.listen(function(connections, type) {
		if (type === 'add') {
			connections.forEach(function(connection) {
				opened_connections.hash[connection.id] = connection;
			});
		} else if (type === 'remove') {
			connections.forEach(function(connection) {
				delete opened_connections.hash[connection.id];
			});
		}
	});

	// when files are removed for a particular source
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

	// load file from a remote peer, based on the queue
	function get_from_remote(sources) {
		var min = Number.MAX_VALUE,
			source_connection = null;
		
		sources.forEach(function(source) {
			var connection = opened_connections.hash[source.source];
			if (connection.queue.length < min) {
				min = connection.queue.length;
				source_connection = connection;
			}
		});

		source_connection.requestFile(sources[0].name);
	}

	// give a file, download it
	function force_download(file) {
		var confirm = window.confirm('The file ' + file.name + ' is ready. Confirm to download!');
		if (confirm) {
			var link = document.createElement('a');
			link.href = window.URL.createObjectURL(file);
			link.download = file.name;
			link.click();
		}
	}

	// add files from the cache
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


	// remote peer events
	window.addEventListener('filesarrived', function(event) {
		var files = event.detail;
		room_files.extend(files);
	});

	window.addEventListener('filescleared', function(event) {
		var connection = event.detail;
		clean_room(connection.id);
	});

	// request a file from self or from remote
	window.addEventListener('filerequest', function(event) {
		var sources = event.detail,
			task = null;

		if (sources.length === 1 && sources[0].source === app.id) {
			var file = sources[0];
			force_download(cache.hash[file.name]);
		} else {
			get_from_remote(sources);
		}
	});

	// download for a file has been completed
	window.addEventListener('downloadcomplete', function(event) {
		var blob = event.detail;
		force_download(blob);
	});

	// connection opening and closing
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
