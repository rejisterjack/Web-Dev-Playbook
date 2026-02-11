/**
 * Unit tests for canvas module
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {Canvas} from '../canvas.js';
import {ScreenBuffer} from '../../rendering/buffer.js';

describe('Canvas', () => {
	let canvas: Canvas;
	let buffer: ScreenBuffer;

	beforeEach(() => {
		buffer = new ScreenBuffer(80, 24);
		canvas = new Canvas(buffer);
	});

	describe('constructor', () => {
		it('should create canvas with buffer', () => {
			expect(canvas).toBeDefined();
			expect(canvas.width).toBe(80);
			expect(canvas.height).toBe(24);
		});
	});

	describe('drawPoint', () => {
		it('should draw a point at specified coordinates', () => {
			canvas.drawPoint(10, 10, 'X');
			const cell = buffer.getCell(10, 10);
			expect(cell?.char).toBe('X');
		});

		it('should not draw point outside bounds', () => {
			canvas.drawPoint(-1, 10, 'X');
			canvas.drawPoint(100, 10, 'X');
			canvas.drawPoint(10, -1, 'X');
			canvas.drawPoint(10, 100, 'X');
			// Should not throw
		});
	});

	describe('drawLine', () => {
		it('should draw horizontal line', () => {
			canvas.drawLine(5, 10, 15, 10, '-');
			for (let x = 5; x <= 15; x++) {
				const cell = buffer.getCell(x, 10);
				expect(cell?.char).toBe('-');
			}
		});

		it('should draw vertical line', () => {
			canvas.drawLine(10, 5, 10, 15, '|');
			for (let y = 5; y <= 15; y++) {
				const cell = buffer.getCell(10, y);
				expect(cell?.char).toBe('|');
			}
		});

		it('should draw diagonal line', () => {
			canvas.drawLine(5, 5, 10, 10, '/');
			// Check that some points are drawn
			const cell1 = buffer.getCell(5, 5);
			const cell2 = buffer.getCell(10, 10);
			expect(cell1?.char).toBe('/');
			expect(cell2?.char).toBe('/');
		});
	});

	describe('drawRect', () => {
		it('should draw rectangle outline', () => {
			canvas.drawRect(5, 5, 10, 5);
			// Check corners
			expect(buffer.getCell(5, 5)?.char).toBe('┌');
			expect(buffer.getCell(15, 5)?.char).toBe('┐');
			expect(buffer.getCell(5, 10)?.char).toBe('└');
			expect(buffer.getCell(15, 10)?.char).toBe('┘');
		});

		it('should draw filled rectangle', () => {
			canvas.drawRect(5, 5, 5, 5, true);
			// Check that interior is filled
			expect(buffer.getCell(7, 7)?.char).toBe(' ');
		});
	});

	describe('drawText', () => {
		it('should draw text at position', () => {
			canvas.drawText(10, 10, 'Hello');
			expect(buffer.getCell(10, 10)?.char).toBe('H');
			expect(buffer.getCell(11, 10)?.char).toBe('e');
			expect(buffer.getCell(12, 10)?.char).toBe('l');
			expect(buffer.getCell(13, 10)?.char).toBe('l');
			expect(buffer.getCell(14, 10)?.char).toBe('o');
		});

		it('should truncate text that exceeds width', () => {
			canvas.drawText(75, 10, 'This is a very long text');
			// Should not throw
		});
	});

	describe('clear', () => {
		it('should clear entire canvas', () => {
			canvas.drawPoint(10, 10, 'X');
			canvas.clear();
			const cell = buffer.getCell(10, 10);
			expect(cell?.char).toBe(' ');
		});

		it('should clear specific region', () => {
			canvas.drawPoint(10, 10, 'X');
			canvas.drawPoint(20, 20, 'Y');
			canvas.clear({x: 5, y: 5, width: 15, height: 15});
			expect(buffer.getCell(10, 10)?.char).toBe(' ');
			expect(buffer.getCell(20, 20)?.char).toBe('Y');
		});
	});

	describe('fill', () => {
		it('should fill region with character', () => {
			canvas.fill(5, 5, 10, 5, '.');
			for (let x = 5; x <= 15; x++) {
				for (let y = 5; y <= 10; y++) {
					expect(buffer.getCell(x, y)?.char).toBe('.');
				}
			}
		});
	});

	describe('pushClip and popClip', () => {
		it('should set clip region', () => {
			canvas.pushClip({x: 5, y: 5, width: 10, height: 10});
			canvas.drawPoint(3, 5, 'X'); // Outside clip
			canvas.drawPoint(10, 10, 'Y'); // Inside clip
			expect(buffer.getCell(3, 5)?.char).toBe(' ');
			expect(buffer.getCell(10, 10)?.char).toBe('Y');
		});

		it('should clear clip region', () => {
			canvas.pushClip({x: 5, y: 5, width: 10, height: 10});
			canvas.popClip();
			canvas.drawPoint(3, 5, 'X');
			expect(buffer.getCell(3, 5)?.char).toBe('X');
		});
	});

	describe('pushTransform and popTransform', () => {
		it('should apply translation', () => {
			canvas.pushTransform({tx: 5, ty: 5, sx: 1, sy: 1});
			canvas.drawPoint(0, 0, 'X');
			expect(buffer.getCell(5, 5)?.char).toBe('X');
		});

		it('should clear transform', () => {
			canvas.pushTransform({tx: 5, ty: 5, sx: 1, sy: 1});
			canvas.popTransform();
			canvas.drawPoint(0, 0, 'X');
			expect(buffer.getCell(0, 0)?.char).toBe('X');
		});
	});

	describe('width and height', () => {
		it('should return correct dimensions', () => {
			expect(canvas.width).toBe(80);
			expect(canvas.height).toBe(24);
		});
	});

	describe('setContext and getContext', () => {
		it('should set and get context', () => {
			canvas.setContext({fg: 'red', bg: 'blue'});
			const context = canvas.getContext();
			expect(context.fg).toBe('red');
			expect(context.bg).toBe('blue');
		});
	});

	describe('transformPoint', () => {
		it('should transform point with translation', () => {
			canvas.pushTransform({tx: 5, ty: 5, sx: 1, sy: 1});
			const pos = canvas.transformPoint(0, 0);
			expect(pos.x).toBe(5);
			expect(pos.y).toBe(5);
		});

		it('should transform point with scale', () => {
			canvas.pushTransform({tx: 0, ty: 0, sx: 2, sy: 2});
			const pos = canvas.transformPoint(5, 5);
			expect(pos.x).toBe(10);
			expect(pos.y).toBe(10);
		});
	});

	describe('isVisible', () => {
		it('should return true for visible points', () => {
			expect(canvas.isVisible(10, 10)).toBe(true);
		});

		it('should return false for points outside bounds', () => {
			expect(canvas.isVisible(-1, 10)).toBe(false);
			expect(canvas.isVisible(100, 10)).toBe(false);
		});

		it('should return false for points outside clip region', () => {
			canvas.pushClip({x: 5, y: 5, width: 10, height: 10});
			expect(canvas.isVisible(3, 5)).toBe(false);
			expect(canvas.isVisible(10, 10)).toBe(true);
		});
	});
});
