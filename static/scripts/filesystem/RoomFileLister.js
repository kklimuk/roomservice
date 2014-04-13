var RoomFileLister = (function(app) {
	'use strict';

	var RoomFileLister = {
		el: document.getElementById('room-files'),
		list: document.querySelector('#room-files ul'),
		template: document.getElementById('file-local'),

		content: {},

		__init__: function() {
			this.onfilesloaded([].slice.call(window.service.files), 'add');
			window.service.files.listen(this.onfilesloaded.bind(this));
		},

		addFileContent: function(file) {
			if (!(file.name in this.content)) {
				this.content[file.name] = {
					self: false,
					files: []
				};
			}

			if (file.source === app.id) {
				this.content[file.name].self = true;
			}

			this.content[file.name].files.push(file);
		},

		makeElement: function(content) {
			if (content.files.length === 0) {
				return false;
			}

			var el = document.createElement('li');
			el.innerHTML = this.template.innerHTML;
			if (this.content)

			var a = el.querySelector('a');
			a.href = '#';
			a.innerText = content.files[0].name + ' (' + content.files.length + ')';
			if (content.self) {
				a.innerText += ' (cached)';
			}

			a.addEventListener('click', function(event){
				window.dispatchEvent(new CustomEvent('onfilerequested', { detail: content }));
			});

			return el;
		},

		onfilesloaded: function(files, type) {
			if (type === 'add') {
				files.forEach(this.addFileContent.bind(this));

				this.list.innerHTML = '';
				for (var index in this.content) {
					var el = this.makeElement(this.content[index]);
					if (el) {
						this.list.appendChild(el);
					}
				}
			}
		}
	};

	return RoomFileLister;
})(window.app);
