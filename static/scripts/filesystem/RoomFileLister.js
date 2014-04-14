var RoomFileLister = (function(app) {
	'use strict';

	var RoomFileLister = {
		el: document.getElementById('room-files'),
		list: document.querySelector('#room-files ul'),
		template: document.getElementById('file-remote'),

		content: {},
		elements: {},

		__init__: function() {
			this.onfilesloaded([].slice.call(window.service.files), 'add');
			window.service.files.listen(this.onfilesloaded.bind(this));
			
			var self = this;
			window.addEventListener('fileprogress', function(event) {
				var name = event.detail.name,
					completion = event.detail.completion;

				var el = self.elements[name];
				var item = el.querySelector('.progress-item');
				if (!item) {
					item = document.createElement('li');
					item.classList.add('progress-item');
					item.innerHTML = '<div class="progress"><div>0%</div></div>';
					el.querySelector('ul').appendChild(item);
				} else if (completion === 100) {
					item.parentNode.removeChild(item);
				} else {
					var inner = item.querySelector('.progress > div')
					inner.style.width = completion + '%';
					inner.innerHTML = '&nbsp;' +completion + '%';
				}
			});
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

		removeFileContent: function(file) {
			if (file.name in this.content) {
				this.content[file.name] = {
					self: app.id === file.source ? false : this.content[file.name].self,
					files: this.content[file.name].files.filter(function(f) {
						return file.name !== f.name || file.source !== f.source;
					})
				}
			}
		},

		makeElement: function(content) {
			if (content.files.length === 0) {
				return false;
			}

			var el = document.createElement('li'),
				file = content.files[0];
			el.classList.add('group-item');
			el.innerHTML = this.template.innerHTML;

			var a = el.querySelector('a');
			a.href = '#';
			a.innerHTML = '<strong>' + file.name + '</strong>'; 

			var ul = el.querySelector('ul');
			
			var properties = ul.querySelector('li.size');

			var size = file.size / 1024 > 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' Mb' :
				content.files[0].size > 1024 ? (file.size / 1024).toFixed(1) + ' Kb' : content.files[0].size + ' bytes';
			properties.innerHTML = 'Size: <strong>' + size + '</strong>';

			var type = ul.querySelector('li.type');
			if (file.type === '') {
				ul.removeChild(type);
			} else {	
				type.innerHTML = 'Type: <strong>' + (file.type in app.TYPES ? app.TYPES[file.type] : file.type) + '</strong>';	
			}

			var count_item = ul.querySelector('li.shared');
			count_item.innerHTML = 'Shared by: <strong>' + content.files.length + ' ' + 
				(content.files.length > 1 ? 'people' : 'person') + 
				(content.self ? ' (cached)' : '') + '</strong>';

			a.addEventListener('click', function(event){
				var data = content.self ? content.files.filter(function(file) {
					return app.id === file.source;
				}) : content.files;
				window.dispatchEvent(new CustomEvent('filerequest', { detail: data }));
			});

			this.elements[file.name] = el;

			return el;
		},

		onfilesloaded: function(files, type) {
			if (type === 'add') {
				files.forEach(this.addFileContent.bind(this));
			} else if (type === 'remove') {
				files.forEach(this.removeFileContent.bind(this));
			}

			this.list.innerHTML = '';
			for (var index in this.content) {
				var el = this.makeElement(this.content[index]);
				if (el) {
					this.list.appendChild(el);
				}
			}
		}
	};

	return RoomFileLister;
})(window.app);
