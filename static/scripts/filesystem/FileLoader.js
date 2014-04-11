var FileLoader = (function(FileReader, Promise) {
	'use strict';

	function Directive(el, template, replace) {
		el.innerHTML = document.getElementById(template).innerHTML;

		if (replace) {
			this.el = el.children[0].cloneNode(true);
			if (el.parentNode !== null) {
				el.parentNode.replaceChild(this.el, el);
			}
		} else {
			this.el = el;
		}
	}

	function FileLoader(element) {
		this.constructor(element, 'file-loader');
		this.make_elements();
		this.bind_events();
	}

	FileLoader.blocked_extensions = {}

	FileLoader.get_extension = function(file) {
		return file.split('.').pop();
	};

	FileLoader.prototype = Object.create(Directive.prototype);

	FileLoader.prototype.make_elements = function() {
		this.drag_notification = document.createTextNode('Drag Sounds Here');
		this.input = this.el.querySelector('input');
		this.container = this.el.querySelector('div');
	};

	FileLoader.prototype.bind_events = function() {
		var self = this;
		this.input.addEventListener('change', function() {
			self.onfilesloaded(this.files);
		});

		this.el.addEventListener('dragenter', this.ondragenter.bind(this));
		this.el.addEventListener('dragover', this.ondragover.bind(this));
		this.el.addEventListener('drop', function(event) {
			event.stopPropagation();
			event.preventDefault();
			self.onfilesloaded(event.dataTransfer.files);
			self.ondragleave();
		});

	};

	FileLoader.prototype.ondragenter = function() {
		this.el.appendChild(this.drag_notification);
		this.el.classList.add('dragged');
	};

	FileLoader.prototype.ondragleave = function() {
		this.el.removeChild(this.drag_notification);
		this.el.classList.remove('dragged');
	};

	FileLoader.prototype.ondragover = function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	};

	FileLoader.prototype.onfilesloaded = function(files) {
		var promises = [].map.call(files, function(file) {
			if (FileLoader.get_extension(file.name) in FileLoader.blocked_extensions) {
				return null;
			}

			return file.readAsArrayBuffer();
		}).filter(function(file) { return file; });

		Promise.all(promises).then(function() {
			window.dispatchEvent(new CustomEvent('imported', { detail: files }));
		});
	};

	return FileLoader;
})(window.FileReader, window.Promise);