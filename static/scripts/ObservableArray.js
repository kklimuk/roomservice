var ObservableArray = (function() {
	'use strict';

	function ObservableArray() {
		this.length = 0;
		this.listeners = [];
	}

	ObservableArray.prototype.push = function() {
		var self = this;
		Array.prototype.forEach.call(arguments, function(element) {
			Array.prototype.push.call(self, element);
		});

		this.alert([].slice.call(arguments), 'add');
		return this;
	};

	ObservableArray.prototype.extend = function(array) {
		var self = this;
		Array.prototype.forEach.call(array, function(element) {
			Array.prototype.push.call(self, element);
		});
		this.alert(array, 'add');

		return this;
	};

	ObservableArray.prototype.indexOf = function(item) {
		return Array.prototype.indexOf.call(this, item);
	};

	ObservableArray.prototype.clear = function() {
		this.length = 0;
		this.alert([], 'remove');
	};

	ObservableArray.prototype.remove = function() {
		var self = this;
		Array.prototype.forEach.call(arguments, function(element) {
			var index = self.indexOf(element);
			if (index !== -1) {
				Array.prototype.splice.call(self, index, 1);
			}
		});

		this.alert([].slice.call(arguments), 'remove');
		return this;
	};

	ObservableArray.prototype.listen = function(listener) {
		this.listeners.push(listener);

		return this;
	};

	ObservableArray.prototype.unlisten = function(listener) {
		var index = this.listeners.indexOf(listener);
		if (index === -1) {
			throw 'Cannot remove unattached listener.';
		}
		this.listeners.splice(index, 1);

		return this;
	};

	ObservableArray.prototype.alert = function(values, type) {
		var self = this;
		this.listeners.forEach(function(listener) {
			listener(values, type, self);
		});

		return this;
	};

	return ObservableArray;
})();