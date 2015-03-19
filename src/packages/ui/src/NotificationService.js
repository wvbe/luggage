define([
	'tiny-emitter',
	'object-store'
], function(
	EventEmitter,
	ObjectStore
	) {


	function NotificationChannel(id) {
		EventEmitter.call(this);
		this.id = id;
		this.elements = [];
		//this.history = [];
		this.maximumLength = 5;
	}

	NotificationChannel.prototype = Object.create(EventEmitter.prototype);
	NotificationChannel.prototype.constructor = NotificationChannel;

	NotificationChannel.prototype.logMessageOfType = function (type, message) {
		this.elements.forEach(function(element) {
			if(Array.isArray(message))
				this.renderRandomMessageToElement(type, message, element);
			else
				this.renderMessageToElement(type, message, element);
		}.bind(this));
		return this;
	};

	NotificationChannel.prototype.bindToListElement = function (listElement) {
		this.elements.push(listElement);
		return this;
	};

	NotificationChannel.prototype.renderRandomMessageToElement = function (type, messages, element) {
		return this.renderMessageToElement(type, messages[Math.floor(Math.random() * messages.length - 0.00001)], element);
	};
	NotificationChannel.prototype.renderMessageToElement = function (type, message, element) {
		var li = document.createElement('li');
		li.innerHTML = message;
		element.appendChild(li);
		if(this.maximumLength && element.children.length > this.maximumLength)
			element.removeChild(element.firstChild);
		return this;
	};



	function NotificationService () {
		ObjectStore.call(this, {
			requireInstanceOf: NotificationChannel,
			primaryKey: 'id'
		});
	}

	NotificationService.prototype = Object.create(ObjectStore.prototype);
	NotificationService.prototype.constructor = NotificationService;

	NotificationService.prototype.create = function (id) {
		var channel = new NotificationChannel(id);
		return this.set(channel);
	};
	return NotificationService;
});