var files = (function(app, LocalLister, FileSystem, ObservableArray) {
	'use strict';

	var fs = new FileSystem(1024*1024*1024),
		room_directory = fs.getRoom(app.room);

	var local_files = new ObservableArray();
	// handle adds and removes on the local files
	local_files.listen(LocalLister.onfilesloaded.bind(LocalLister));

	// handle removes
	local_files.listen(function(cleared, type) {
		if (type === 'remove') {
			room_directory.then(function(room) {
				return room.removeRecursively();
			}).then(function() {
				room_directory = fs.getRoom(app.room);
			});
		}
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
			local_files.extend(files);
		}).catch(app.logError);
	});

	fs.getRoomFiles(app.room).then(function(files) {
		local_files.extend(files);
	});

	return local_files;
})(window.app, window.LocalLister, window.FileSystem, window.ObservableArray)