import React from 'react';

import Perspective from './Perspective';

describe('Perspective', () => {
	describe('integrity', () => {
		it('can round-trip calculations between pixels, world coordinates and back', () => {
			const perspecitive = new Perspective(30, 30),
				pixelCoords = [
					Math.random() * 3000,
					Math.random() * 3000
				],
				worldCoords = perspecitive.toCoordinates(pixelCoords);

			perspecitive.toPixels(worldCoords)
				.forEach((pixelCoord, i) => {
					expect(pixelCoord).toBeCloseTo(pixelCoords[i], 10);
				});
		});

		it('can round-trip calculations between world coordinates, pixels and back', () => {
			const perspecitive = new Perspective(30, 30),
				worldCoords = [
					Math.round(Math.random() * 3000),
					Math.round(Math.random() * 3000), 0
				],
				pixelCoords = perspecitive.toPixels(worldCoords);

			perspecitive.toCoordinates(pixelCoords)
				.forEach((worldCoord, i) => {
					expect(worldCoord).toBeCloseTo(worldCoords[i], 10);
				});
		});
	});

	describe('coordinate system', () => {
		it('has up point to the top', () => {
			const perspecitive = new Perspective(30),
				zerozero = perspecitive.toPixels([0, 0, 0]),
				up = perspecitive.toPixels([0, 0, 1]);

			expect(up[0]).toBe(zerozero[0]);
			expect(up[1]).toBeLessThan(zerozero[1]);
		});

		it('has north point to the top left', () => {
			const perspecitive = new Perspective(30),
				zerozero = perspecitive.toPixels([0, 0, 0]),
				north = perspecitive.toPixels([0, 1, 0]);

			expect(north[0]).toBeLessThan(zerozero[0]);
			expect(north[1]).toBeLessThan(zerozero[1]);
		});

		it('has east point to the top right', () => {
			const perspecitive = new Perspective(30),
				zerozero = perspecitive.toPixels([0, 0, 0]),
				east = perspecitive.toPixels([1, 0, 0]);

			expect(east[0]).toBeGreaterThan(zerozero[0]);
			expect(east[1]).toBeLessThan(zerozero[1]);
		});

		it('has south point to the bottom right', () => {
			const perspecitive = new Perspective(30),
				zerozero = perspecitive.toPixels([0, 0, 0]),
				south = perspecitive.toPixels([0, -1, 0]);

			expect(south[0]).toBeGreaterThan(zerozero[0]);
			expect(south[1]).toBeGreaterThan(zerozero[1]);
		});

		it('has west point to the bottom left', () => {
			const perspecitive = new Perspective(30),
				zerozero = perspecitive.toPixels([0, 0, 0]),
				west = perspecitive.toPixels([-1, 0, 0]);

			expect(west[0]).toBeLessThan(zerozero[0]);
			expect(west[1]).toBeGreaterThan(zerozero[1]);
		});
	});
});
