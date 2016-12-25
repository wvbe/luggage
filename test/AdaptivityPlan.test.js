import React from 'react';

import manager from '../src/manager';

jest.mock('../src/classes/Connector', () => require('./mocks/Connector'));

let adaptivityPlan = null;
beforeAll(() => {
	return manager
		.loadInitialData('NN-lwb/NN6-lwb-map.xml', 'adaptivity-test.xml')
		.then(plan => {
			adaptivityPlan = plan;
		});
});

describe('NN-lwb/NN6-lwb-map.xml', () => {
	it('has 75 items', () => expect(manager.items.length).toBe(75));
	it('has 38 learning items', () => expect(manager.items.filter(i => !i.isSwitchItem()).length).toBe(38));
	it('has 37 switch items', () => expect(manager.items.filter(i => i.isSwitchItem()).length).toBe(37));
});

describe('adaptivity-test.xml', () => {
	it('has 5 unique paths', () => expect(adaptivityPlan.paths.length).toBe(5));
	it('has 16 sequences', () => expect(adaptivityPlan.sequences.length).toBe(16));
});
