import React from 'react';

import EventEmitter from './EventEmitter';

describe('EventEmitter', () => {
	it('can run callbacks when events are emitted', () => {
		const eventEmitter = new EventEmitter();
		let callbackDidRun = false,
			otherCallbackDidRun = false;

		eventEmitter.on('test', () => callbackDidRun = true);
		eventEmitter.on('test', () => otherCallbackDidRun = true);

		eventEmitter.emit('test');
		expect(callbackDidRun).toBe(true);
		expect(otherCallbackDidRun).toBe(true);
	});

	it('setting a listener returns its destroyer', () => {
		const eventEmitter = new EventEmitter();
		let callbackRunTimes = 0;

		const destroyer = eventEmitter.on('test', () => ++callbackRunTimes);
		expect(typeof destroyer).toBe('function');

		eventEmitter.emit('test');
		expect(callbackRunTimes).toBe(1);

		destroyer();
		eventEmitter.emit('test');
		expect(callbackRunTimes).toBe(1);
	});

	it('can run a callback once', () => {
		const eventEmitter = new EventEmitter();
		let callbackRunTimes = 0;

		eventEmitter.once('test', () => ++callbackRunTimes);

		eventEmitter.emit('test');
		expect(callbackRunTimes).toBe(1);

		eventEmitter.emit('test');
		expect(callbackRunTimes).toBe(1);
	});

	it('does not crash when a nonexistant event is emitted', () => {
		const eventEmitter = new EventEmitter();
		eventEmitter.emit('random');
	});
});
