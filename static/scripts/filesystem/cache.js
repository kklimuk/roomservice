var cache = (function(app, LocalLister, FileSystem, ObservableArray) {
	'use strict';

	var fs = new FileSystem(1024*1024*1024),
		room_directory = fs.getRoom(app.room);

	// create the cache and hash for files
	var cache = new ObservableArray();
	cache.hash = {};

	// populate the hash
	cache.listen(function(files, type) {
		if (type === 'add') {
			files.forEach(function(file) {
				cache.hash[file.name] = file;
			});
		} else if (type === 'remove') {
			files.forEach(function(file) {
				delete cache.hash[file.name];
			});
		}
	});

	// handle adds on the cache
	cache.listen(LocalLister.onfilesloaded.bind(LocalLister));

	// handle removes
	cache.listen(function(cleared, type) {
		if (type === 'remove' && cleared.length === 0) {
			room_directory.then(function(room) {
				return room.removeRecursively();
			}).then(function() {
				room_directory = fs.getRoom(app.room);
			});
		}
	});

	// handle files that are already cached in the room
	fs.getRoomFiles(app.room).then(function(files) {
		cache.extend(files);
	});

	// handle completed download
	window.addEventListener('downloadcomplete', function(event) {
		var blob = event.detail;

		var cached_entry = null;
		room_directory.then(function(directory) {
			return directory.makeFileEntry(blob.name, true);
		}).then(function(entry) {
			cached_entry = entry;
			return entry.write(blob);
		}).then(function() {
			return cached_entry.getFile();
		}).then(function(file) {
			cache.push(file);
		}).catch(function(error) {
			console.warn('Entry ' + blob.name + ' already previously stored.')
			app.logError(error);
		});
	});

	// handle arriving imports
	window.addEventListener('imported', function(event) {
		var files = event.detail;

		room_directory.then(function(room) {
			var promises = files.map(function(file, i) {
				return room.makeFileEntry(file.name, true).catch(function() {
					return false;
				});
			});

			return Promise.all(promises);
		}).then(function(entries) {
			var duplicates = [];
			entries = entries.filter(function(file, i) {
				if (!file) {
					duplicates.push(files[i]);
				}
				return file;
			});

			duplicates.forEach(function(duplicate) {
				files.splice(files.indexOf(duplicate), 1);
			});

			var promises = entries.map(function(entry, i) {
				entry.write(files[i]);
			});

			return Promise.all(promises);
		}).then(function() {
			cache.extend(files);
		}).catch(app.logError);
	});

	return cache;
})(window.app, window.LocalLister, window.FileSystem, window.ObservableArray)
