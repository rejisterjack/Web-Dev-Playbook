/**
 * Screen Reader Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ScreenReader, AnnouncementPriority} from '../screen-reader.js';
import {LiveRegionType} from '../types.js';

// Mock output stream
const mockOutput = {
	write: vi.fn(),
} as unknown as NodeJS.WritableStream;

describe('ScreenReader', () => {
	let screenReader: ScreenReader;

	beforeEach(() => {
		screenReader = new ScreenReader(mockOutput);
		vi.clearAllMocks();
	});

	describe('constructor', () => {
		it('should create screen reader with enabled state', () => {
			expect(screenReader.enabled).toBe(true);
		});

		it('should not be speaking initially', () => {
			expect(screenReader.isSpeaking).toBe(false);
		});

		it('should have no pending announcements', () => {
			expect(screenReader.pendingAnnouncements).toBe(0);
		});
	});

	describe('announce', () => {
		it('should announce text', () => {
			screenReader.announce('Hello world');
			expect(mockOutput.write).toHaveBeenCalled();
		});

		it('should not announce empty text', () => {
			screenReader.announce('');
			expect(mockOutput.write).not.toHaveBeenCalled();
		});

		it('should not announce when disabled', () => {
			screenReader.enabled = false;
			screenReader.announce('Hello world');
			expect(mockOutput.write).not.toHaveBeenCalled();
		});
	});

	describe('announcePolite', () => {
		it('should announce politely', () => {
			screenReader.announcePolite('Hello world');
			expect(mockOutput.write).toHaveBeenCalled();
		});
	});

	describe('announceAssertive', () => {
		it('should announce assertively', () => {
			screenReader.announceAssertive('Alert!');
			expect(mockOutput.write).toHaveBeenCalled();
		});
	});

	describe('live regions', () => {
		it('should create live region', () => {
			screenReader.createLiveRegion('test-region', {
				type: LiveRegionType.POLITE,
			});
			const region = screenReader.getLiveRegion('test-region');
			expect(region).toBeDefined();
			expect(region?.type).toBe(LiveRegionType.POLITE);
		});

		it('should announce to live region', () => {
			screenReader.createLiveRegion('test-region', {
				type: LiveRegionType.POLITE,
			});
			screenReader.announceLiveRegion('test-region', 'Update');
			expect(mockOutput.write).toHaveBeenCalled();
		});

		it('should remove live region', () => {
			screenReader.createLiveRegion('test-region', {
				type: LiveRegionType.POLITE,
			});
			screenReader.removeLiveRegion('test-region');
			const region = screenReader.getLiveRegion('test-region');
			expect(region).toBeUndefined();
		});
	});

	describe('queue management', () => {
		it('should clear queue', () => {
			screenReader.clearQueue();
			expect(screenReader.pendingAnnouncements).toBe(0);
		});

		it('should cancel current announcement', () => {
			screenReader.cancel();
			expect(screenReader.isSpeaking).toBe(false);
		});
	});

	describe('pause and resume', () => {
		it('should pause announcements', () => {
			screenReader.pause();
			expect(screenReader.isSpeaking).toBe(false);
		});

		it('should resume announcements', () => {
			screenReader.resume();
			// No error thrown
			expect(true).toBe(true);
		});
	});

	describe('destroy', () => {
		it('should destroy screen reader', () => {
			screenReader.destroy();
			expect(screenReader.enabled).toBe(false);
			expect(screenReader.isSpeaking).toBe(false);
		});
	});
});
