var LocalLister = (function() {

	var LocalLister = {
		el: document.getElementById('my-files'),
		list: document.querySelector('#my-files ul'),
		template: document.getElementById('file-local'),

		onfilesloaded: function(files, type) {
			if (type === 'add') {
				var self = this;
				var elements = files.map(function(file) {
					var el = document.createElement('li');
					el.innerHTML = self.template.innerHTML;

					var a = el.querySelector('a');
					a.href = window.URL.createObjectURL(file);
					a.download = file.name;
					a.innerText = file.name;

					return el;
				});

				var data = elements.reduce(function(html, el) {
					html += el.outerHTML;
					return html;
				}, '');

				this.list.innerHTML += data;
			}
		},

		onremovefiles: function() {
			this.list.innerHTML = '';
			files.clear();
		}
	};

	document.querySelector('#my-files h3 > a').addEventListener('click', LocalLister.onremovefiles.bind(LocalLister));

	return LocalLister;

})();