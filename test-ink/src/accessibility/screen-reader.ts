/**
 * Screen Reader Module
 *
 * Provides screen reader output functionality for the TUI framework.
 * Outputs text to screen readers using standard terminal output.
 *
 * @module accessibility/screen-reader
 */

import type {LiveRegionType} from './types.js';
import {LiveRegionType as LiveRegionTypeEnum} from './types.js';

/**
 * Announcement priority
 */
export enum AnnouncementPriority {
	/** Low priority announcement */
	LOW = 0,

	/** Normal priority announcement */
	NORMAL = 1,

	/** High priority announcement */
	HIGH = 2,
}

/**
 * Announcement configuration
 */
export interface AnnouncementConfig {
	/** The text to announce */
	text: string;

	/** The live region type */
	liveRegion?: LiveRegionType;

	/** The announcement priority */
	priority?: AnnouncementPriority;

	/** Whether to queue the announcement */
	queue?: boolean;

	/** Delay before announcement (in milliseconds) */
	delay?: number;

	/** Whether to interrupt current announcement */
	interrupt?: boolean;
}

/**
 * Live region configuration
 */
export interface LiveRegionConfig {
	/** The live region type */
	type: LiveRegionType;

	/** Whether the region is atomic */
	atomic?: boolean;

	/** What types of changes are relevant */
	relevant?: string[];

	/** Whether the region is busy */
	busy?: boolean;
}

/**
 * Screen Reader class for screen reader output
 */
export class ScreenReader {
	/** Whether the screen reader is enabled */
	private _enabled: boolean;

	/** Queue of pending announcements */
	private _announcementQueue: AnnouncementConfig[];

	/** Whether an announcement is currently being spoken */
	private _isSpeaking: boolean;

	/** Live regions by ID */
	private _liveRegions: Map<string, LiveRegionConfig>;

	/** Output stream for announcements */
	private _output: NodeJS.WritableStream;

	/** Timeout for delayed announcements */
	private _delayTimeouts: Map<number, NodeJS.Timeout>;

	/** Next timeout ID */
	private _nextTimeoutId: number;

	/**
	 * Creates a new ScreenReader instance
	 *
	 * @param output - Output stream for announcements (defaults to process.stdout)
	 */
	constructor(output: NodeJS.WritableStream = process.stdout) {
		this._enabled = true;
		this._announcementQueue = [];
		this._isSpeaking = false;
		this._liveRegions = new Map();
		this._output = output;
		this._delayTimeouts = new Map();
		this._nextTimeoutId = 0;
	}

	/**
	 * Gets whether the screen reader is enabled
	 */
	get enabled(): boolean {
		return this._enabled;
	}

	/**
	 * Sets whether the screen reader is enabled
	 */
	set enabled(value: boolean) {
		this._enabled = value;
	}

	/**
	 * Gets whether an announcement is currently being spoken
	 */
	get isSpeaking(): boolean {
		return this._isSpeaking;
	}

	/**
	 * Gets the number of pending announcements
	 */
	get pendingAnnouncements(): number {
		return this._announcementQueue.length;
	}

	/**
	 * Announces text to the screen reader
	 *
	 * @param config - Announcement configuration
	 */
	announce(config: string | AnnouncementConfig): void {
		if (!this._enabled) {
			return;
		}

		const announcement: AnnouncementConfig =
			typeof config === 'string' ? {text: config} : config;

		// Validate announcement text
		if (!announcement.text || announcement.text.trim().length === 0) {
			return;
		}

		// Set defaults
		const finalConfig: AnnouncementConfig = {
			liveRegion: announcement.liveRegion ?? LiveRegionTypeEnum.POLITE,
			priority: announcement.priority ?? AnnouncementPriority.NORMAL,
			queue: announcement.queue ?? true,
			delay: announcement.delay ?? 0,
			interrupt: announcement.interrupt ?? false,
			...announcement,
		};

		// Handle delayed announcements
		if (finalConfig.delay && finalConfig.delay > 0) {
			this._scheduleDelayedAnnouncement(finalConfig);
			return;
		}

		// Handle interrupt
		if (finalConfig.interrupt && this._isSpeaking) {
			this._cancelCurrentAnnouncement();
		}

		// Queue or speak immediately
		if (finalConfig.queue && this._isSpeaking) {
			this._queueAnnouncement(finalConfig);
		} else {
			this._speak(finalConfig);
		}
	}

	/**
	 * Makes a polite announcement (waits until user is idle)
	 *
	 * @param text - Text to announce
	 */
	announcePolite(text: string): void {
		this.announce({
			text,
			liveRegion: LiveRegionTypeEnum.POLITE,
			priority: AnnouncementPriority.NORMAL,
		});
	}

	/**
	 * Makes an assertive announcement (announces immediately)
	 *
	 * @param text - Text to announce
	 */
	announceAssertive(text: string): void {
		this.announce({
			text,
			liveRegion: LiveRegionTypeEnum.ASSERTIVE,
			priority: AnnouncementPriority.HIGH,
			interrupt: true,
		});
	}

	/**
	 * Announces a live region update
	 *
	 * @param regionId - The live region ID
	 * @param text - Text to announce
	 */
	announceLiveRegion(regionId: string, text: string): void {
		const region = this._liveRegions.get(regionId);
		if (!region) {
			return;
		}

		this.announce({
			text,
			liveRegion: region.type,
			priority: region.type === 'assertive'
				? AnnouncementPriority.HIGH
				: AnnouncementPriority.NORMAL,
		});
	}

	/**
	 * Creates a live region
	 *
	 * @param id - Unique identifier for the live region
	 * @param config - Live region configuration
	 */
	createLiveRegion(id: string, config: LiveRegionConfig): void {
		this._liveRegions.set(id, {
			type: config.type,
			atomic: config.atomic ?? false,
			relevant: config.relevant ?? ['additions', 'removals', 'text'],
			busy: config.busy ?? false,
		});
	}

	/**
	 * Updates a live region
	 *
	 * @param id - The live region ID
	 * @param config - New live region configuration
	 */
	updateLiveRegion(id: string, config: Partial<LiveRegionConfig>): void {
		const existing = this._liveRegions.get(id);
		if (!existing) {
			return;
		}

		this._liveRegions.set(id, {
			...existing,
			...config,
		});
	}

	/**
	 * Removes a live region
	 *
	 * @param id - The live region ID
	 */
	removeLiveRegion(id: string): void {
		this._liveRegions.delete(id);
	}

	/**
	 * Gets a live region by ID
	 *
	 * @param id - The live region ID
	 * @returns The live region configuration, or undefined if not found
	 */
	getLiveRegion(id: string): LiveRegionConfig | undefined {
		return this._liveRegions.get(id);
	}

	/**
	 * Clears all pending announcements
	 */
	clearQueue(): void {
		this._announcementQueue = [];
	}

	/**
	 * Cancels the current announcement
	 */
	cancel(): void {
		this._cancelCurrentAnnouncement();
	}

	/**
	 * Pauses announcements
	 */
	pause(): void {
		this._isSpeaking = false;
	}

	/**
	 * Resumes announcements
	 */
	resume(): void {
		if (this._announcementQueue.length > 0) {
			const next = this._announcementQueue.shift();
			if (next) {
				this._speak(next);
			}
		}
	}

	/**
	 * Destroys the screen reader and cleans up resources
	 */
	destroy(): void {
		// Clear all delayed announcements
		for (const timeout of this._delayTimeouts.values()) {
			clearTimeout(timeout);
		}
		this._delayTimeouts.clear();

		// Clear queue
		this._announcementQueue = [];

		// Clear live regions
		this._liveRegions.clear();

		this._enabled = false;
		this._isSpeaking = false;
	}

	/**
	 * Speaks an announcement
	 *
	 * @param config - Announcement configuration
	 */
	private _speak(config: AnnouncementConfig): void {
		if (!this._enabled) {
			return;
		}

		this._isSpeaking = true;

		// Format the announcement for screen readers
		const formatted = this._formatAnnouncement(config);

		// Write to output stream
		this._output.write(formatted);

		// Simulate speech completion (in a real implementation, this would
		// wait for the screen reader to finish speaking)
		setTimeout(() => {
			this._onSpeechComplete();
		}, 100);
	}

	/**
	 * Formats an announcement for screen readers
	 *
	 * @param config - Announcement configuration
	 * @returns Formatted announcement string
	 */
	private _formatAnnouncement(config: AnnouncementConfig): string {
		// Add screen reader escape sequence
		// This is a simple implementation - real screen readers may require
		// specific escape sequences or APIs
		let formatted = `\x1b]0;${config.text}\x07`;

		// Add live region indicator
		if (config.liveRegion === 'assertive') {
			formatted = `[ALERT] ${formatted}`;
		}

		return formatted + '\n';
	}

	/**
	 * Queues an announcement
	 *
	 * @param config - Announcement configuration
	 */
	private _queueAnnouncement(config: AnnouncementConfig): void {
		// Insert based on priority
		const priority = config.priority ?? AnnouncementPriority.NORMAL;
		let inserted = false;

		for (let i = 0; i < this._announcementQueue.length; i++) {
			const itemPriority = this._announcementQueue[i].priority ?? AnnouncementPriority.NORMAL;
			if (priority > itemPriority) {
				this._announcementQueue.splice(i, 0, config);
				inserted = true;
				break;
			}
		}

		if (!inserted) {
			this._announcementQueue.push(config);
		}
	}

	/**
	 * Schedules a delayed announcement
	 *
	 * @param config - Announcement configuration
	 */
	private _scheduleDelayedAnnouncement(config: AnnouncementConfig): void {
		const timeoutId = this._nextTimeoutId++;
		const timeout = setTimeout(() => {
			this._delayTimeouts.delete(timeoutId);
			this.announce(config);
		}, config.delay);

		this._delayTimeouts.set(timeoutId, timeout);
	}

	/**
	 * Cancels the current announcement
	 */
	private _cancelCurrentAnnouncement(): void {
		this._isSpeaking = false;
	}

	/**
	 * Called when speech is complete
	 */
	private _onSpeechComplete(): void {
		this._isSpeaking = false;

		// Process next announcement in queue
		if (this._announcementQueue.length > 0) {
			const next = this._announcementQueue.shift();
			if (next) {
				this._speak(next);
			}
		}
	}
}
