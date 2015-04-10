define([
	'./Tooltip'
], function(
	Tooltip
	) {


	function TooltipService(id) {
		this.slots = {};
		this.opened = {};
	}

	Tooltip.prototype.registerSlot = function (slot, element) {
		this.slots[slot] = element;
	};

	TooltipService.prototype.openSlottedTooltip = function (slot, tooltip) {
		this.elements.forEach(function(element) {
			if(Array.isArray(message))
				this.renderRandomMessageToElement(type, message, element);
			else
				this.renderMessageToElement(type, message, element);
		}.bind(this));
		return this;
	};

	TooltipService.prototype.bindToListElement = function (listElement) {
		this.elements.push(listElement);
		return this;
	};

	TooltipService.prototype.renderRandomMessageToElement = function (type, messages, element) {
		return this.renderMessageToElement(type, messages[Math.floor(Math.random() * messages.length - 0.00001)], element);
	};
	TooltipService.prototype.renderMessageToElement = function (type, message, element) {
		var li = document.createElement('li');
		li.innerHTML = message;
		element.appendChild(li);
		if(this.maximumLength && element.children.length > this.maximumLength)
			element.removeChild(element.firstChild);
		return this;
	};



	function NotificationService () {
		ObjectStore.call(this, {
			requireInstanceOf: TooltipService,
			primaryKey: 'id'
		});
	}

	NotificationService.prototype = Object.create(ObjectStore.prototype);
	NotificationService.prototype.constructor = NotificationService;

	NotificationService.prototype.create = function (id) {
		var channel = new TooltipService(id);
		return this.set(channel);
	};
	return NotificationService;
});