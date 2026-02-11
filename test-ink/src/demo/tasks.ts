/**
 * Tasks Demo
 *
 * Showcase async task processing including queue, pool, scheduler,
 * progress reporting, cancellation, and retry.
 *
 * @module demo/tasks
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear } from '../rendering/primitives.js';
import { generateTaskData } from './data-generator.js';

/**
 * Task status
 */
type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Task item
 */
interface TaskItem {
	id: string;
	name: string;
	priority: 'low' | 'medium' | 'high';
	status: TaskStatus;
	progress: number;
	duration: number;
	startTime?: number;
	endTime?: number;
	retryCount: number;
}

/**
 * Tasks demo state
 */
export interface TasksDemoState {
	/** Active view */
	activeView: 'queue' | 'pool' | 'scheduler' | 'progress';
	/** Task queue */
	queue: TaskItem[];
	/** Task pool */
	pool: TaskItem[];
	/** Scheduled tasks */
	scheduled: TaskItem[];
	/** Task history */
	history: TaskItem[];
	/** Total tasks completed */
	totalCompleted: number;
	/** Total tasks failed */
	totalFailed: number;
	/** Update count */
	updateCount: number;
	/** Auto-generate tasks */
	autoGenerate: boolean;
}

/**
 * Tasks demo configuration
 */
export interface TasksDemoConfig {
	/** Auto-generate tasks interval */
	autoGenerateInterval?: number;
}

/**
 * Tasks demo component
 */
export class TasksDemo {
	private state: TasksDemoState;
	private config: Required<TasksDemoConfig>;
	private updateTimer?: NodeJS.Timeout;

	constructor(config: TasksDemoConfig = {}) {
		this.config = {
			autoGenerateInterval: config.autoGenerateInterval || 2000,
		};

		this.state = {
			activeView: 'queue',
			queue: [],
			pool: [],
			scheduled: [],
			history: [],
			totalCompleted: 0,
			totalFailed: 0,
			updateCount: 0,
			autoGenerate: true,
		};
	}

	/**
	 * Start tasks demo
	 */
	start(): void {
		this.updateTimer = setInterval(() => {
			this.update();
		}, this.config.autoGenerateInterval);
	}

	/**
	 * Stop tasks demo
	 */
	stop(): void {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = undefined;
		}
	}

	/**
	 * Update tasks state
	 */
	private update(): void {
		this.state.updateCount++;

		if (this.state.autoGenerate) {
			// Add new task to queue
			const newTasks = generateTaskData({
				count: 1,
				taskTypes: ['Process', 'Download', 'Upload', 'Compute', 'Render'],
				priorityDistribution: { low: 0.3, medium: 0.5, high: 0.2 },
				durationRange: { min: 1000, max: 5000 },
			});

			for (const task of newTasks) {
				this.state.queue.push({
					...task,
					status: 'pending',
					progress: 0,
					retryCount: 0,
				});
			}

			// Limit queue size
			if (this.state.queue.length > 20) {
				this.state.queue.shift();
			}
		}

		// Process tasks from queue
		this.processQueue();

		// Process pool tasks
		this.processPool();

		// Process scheduled tasks
		this.processScheduled();
	}

	/**
	 * Process queue tasks
	 */
	private processQueue(): void {
		for (const task of this.state.queue) {
			if (task.status === 'pending' && Math.random() > 0.7) {
				task.status = 'running';
				task.startTime = Date.now();
				task.progress = Math.random() * 50;
			} else if (task.status === 'running') {
				task.progress += Math.random() * 20;
				if (task.progress >= 100) {
					task.status = 'completed';
					task.progress = 100;
					task.endTime = Date.now();
					this.state.totalCompleted++;
					this.state.history.unshift({ ...task });
					if (this.state.history.length > 50) {
						this.state.history.pop();
					}
				}
			}
		}

		// Remove completed tasks from queue
		this.state.queue = this.state.queue.filter((t) => t.status !== 'completed');
	}

	/**
	 * Process pool tasks
	 */
	private processPool(): void {
		// Add tasks to pool if needed
		if (this.state.pool.length < 5 && Math.random() > 0.8) {
			const newTasks = generateTaskData({
				count: 1,
				taskTypes: ['Pool Task'],
				durationRange: { min: 500, max: 2000 },
			});
			for (const task of newTasks) {
				this.state.pool.push({
					...task,
					status: 'pending',
					progress: 0,
					retryCount: 0,
				});
			}
		}

		// Process pool tasks
		for (const task of this.state.pool) {
			if (task.status === 'pending' && Math.random() > 0.5) {
				task.status = 'running';
				task.startTime = Date.now();
			} else if (task.status === 'running') {
				task.progress += Math.random() * 25;
				if (task.progress >= 100) {
					task.status = 'completed';
					task.progress = 100;
					task.endTime = Date.now();
					this.state.totalCompleted++;
					this.state.history.unshift({ ...task });
				}
			}
		}

		// Remove completed tasks from pool
		this.state.pool = this.state.pool.filter((t) => t.status !== 'completed');
	}

	/**
	 * Process scheduled tasks
	 */
	private processScheduled(): void {
		const now = Date.now();

		// Add scheduled tasks
		if (this.state.scheduled.length < 3 && Math.random() > 0.9) {
			const newTasks = generateTaskData({
				count: 1,
				taskTypes: ['Scheduled Task'],
				durationRange: { min: 1000, max: 3000 },
			});
			for (const task of newTasks) {
				this.state.scheduled.push({
					...task,
					status: 'pending',
					progress: 0,
					retryCount: 0,
					startTime: now + Math.random() * 5000,
				});
			}
		}

		// Process scheduled tasks
		for (const task of this.state.scheduled) {
			if (task.status === 'pending' && task.startTime && now >= task.startTime) {
				task.status = 'running';
			} else if (task.status === 'running') {
				task.progress += Math.random() * 20;
				if (task.progress >= 100) {
					task.status = 'completed';
					task.progress = 100;
					task.endTime = Date.now();
					this.state.totalCompleted++;
					this.state.history.unshift({ ...task });
				}
			}
		}

		// Remove completed tasks from scheduled
		this.state.scheduled = this.state.scheduled.filter((t) => t.status !== 'completed');
	}

	/**
	 * Render tasks demo
	 */
	render(ctx: RenderContext, width: number, height: number): void {
		// Clear screen
		drawClear(ctx, { x: 0, y: 0, width, height });

		// Draw header
		this.renderHeader(ctx, width);

		// Draw view navigation
		this.renderViewNavigation(ctx, width);

		// Draw active view
		this.renderActiveView(ctx, width, height);

		// Draw footer
		this.renderFooter(ctx, width, height);
	}

	/**
	 * Render header
	 */
	private renderHeader(ctx: RenderContext, width: number): void {
		drawBox(ctx, { x: 0, y: 0, width, height: 3 });
		drawText(ctx, 'Tasks Demo - Async Task Processing', 2, 1);
		drawText(ctx, `Updates: ${this.state.updateCount}`, width - 15, 1);
	}

	/**
	 * Render view navigation
	 */
	private renderViewNavigation(ctx: RenderContext, width: number): void {
		const views: { key: string; type: TasksDemoState['activeView'] }[] = [
			{ key: '1', type: 'queue' },
			{ key: '2', type: 'pool' },
			{ key: '3', type: 'scheduler' },
			{ key: '4', type: 'progress' },
		];

		const navY = 4;
		drawBox(ctx, { x: 0, y: navY, width, height: 2 });
		drawText(ctx, 'Views: ', 2, navY + 1);

		let xPos = 9;
		for (const view of views) {
			const isActive = view.type === this.state.activeView;
			const label = `${view.key}:${view.type}`;
			if (isActive) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.setStyles({ bold: true });
				drawText(ctx, `[${label}]`, xPos, navY + 1);
				ctx.restore();
			} else {
				drawText(ctx, ` ${label} `, xPos, navY + 1);
			}
			xPos += label.length + 2;
		}
	}

	/**
	 * Render active view
	 */
	private renderActiveView(ctx: RenderContext, width: number, height: number): void {
		const viewY = 7;
		const viewHeight = height - 10;
		const viewWidth = width - 4;

		switch (this.state.activeView) {
			case 'queue':
				this.renderQueueView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
			case 'pool':
				this.renderPoolView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
			case 'scheduler':
				this.renderSchedulerView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
			case 'progress':
				this.renderProgressView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
		}
	}

	/**
	 * Render queue view
	 */
	private renderQueueView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Task Queue - FIFO Processing', x + 2, y + 1);

		const contentY = y + 3;
		const maxTasks = Math.min(this.state.queue.length, height - 6);

		// Draw queue tasks
		for (let i = 0; i < maxTasks; i++) {
			const task = this.state.queue[i];
			const taskY = contentY + i * 2;

			// Draw status indicator
			const statusChar = task.status === 'pending' ? '○' : task.status === 'running' ? '◐' : task.status === 'completed' ? '✓' : '✗';
			drawText(ctx, statusChar, x + 4, taskY);

			// Draw priority
			const priorityColor =
				task.priority === 'high' ? { rgb: [255, 107, 107] as [number, number, number] } :
				task.priority === 'medium' ? { rgb: [255, 234, 167] as [number, number, number] } :
				{ rgb: [150, 206, 180] as [number, number, number] };
			ctx.save();
			ctx.setFg(priorityColor);
			drawText(ctx, task.priority.toUpperCase(), x + 7, taskY);
			ctx.restore();

			// Draw task name
			const nameWidth = width - 25;
			let name = task.name;
			if (name.length > nameWidth) {
				name = name.substring(0, nameWidth - 3) + '...';
			}
			drawText(ctx, name, x + 15, taskY);

			// Draw progress
			if (task.status === 'running') {
				drawText(ctx, `[${Math.floor(task.progress)}%]`, x + width - 8, taskY);
			}
		}

		// Draw queue stats
		drawText(ctx, `Queue: ${this.state.queue.length} | Completed: ${this.state.totalCompleted} | Failed: ${this.state.totalFailed}`, x + 2, y + height - 2);
	}

	/**
	 * Render pool view
	 */
	private renderPoolView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Task Pool - Parallel Execution', x + 2, y + 1);

		const contentY = y + 3;
		const maxTasks = Math.min(this.state.pool.length, height - 6);

		// Draw pool tasks
		for (let i = 0; i < maxTasks; i++) {
			const task = this.state.pool[i];
			const taskY = contentY + i * 2;

			// Draw status indicator
			const statusChar = task.status === 'pending' ? '○' : task.status === 'running' ? '◐' : '✓';
			drawText(ctx, statusChar, x + 4, taskY);

			// Draw task name
			const nameWidth = width - 20;
			let name = task.name;
			if (name.length > nameWidth) {
				name = name.substring(0, nameWidth - 3) + '...';
			}
			drawText(ctx, name, x + 7, taskY);

			// Draw progress
			if (task.status === 'running') {
				const barWidth = 15;
				const filledWidth = Math.floor(barWidth * (task.progress / 100));
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				for (let j = 0; j < filledWidth; j++) {
					ctx.drawChar('█', x + width - 18 + j, taskY);
				}
				ctx.restore();
			}
		}

		// Draw pool stats
		drawText(ctx, `Pool: ${this.state.pool.length} workers | Active: ${this.state.pool.filter((t) => t.status === 'running').length}`, x + 2, y + height - 2);
	}

	/**
	 * Render scheduler view
	 */
	private renderSchedulerView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Task Scheduler - Timed Execution', x + 2, y + 1);

		const contentY = y + 3;
		const maxTasks = Math.min(this.state.scheduled.length, height - 6);

		// Draw scheduled tasks
		for (let i = 0; i < maxTasks; i++) {
			const task = this.state.scheduled[i];
			const taskY = contentY + i * 2;

			// Draw status indicator
			const statusChar = task.status === 'pending' ? '○' : task.status === 'running' ? '◐' : '✓';
			drawText(ctx, statusChar, x + 4, taskY);

			// Draw task name
			const nameWidth = width - 25;
			let name = task.name;
			if (name.length > nameWidth) {
				name = name.substring(0, nameWidth - 3) + '...';
			}
			drawText(ctx, name, x + 7, taskY);

			// Draw scheduled time
			if (task.startTime) {
				const delay = Math.max(0, task.startTime - Date.now());
				drawText(ctx, `in ${Math.floor(delay / 1000)}s`, x + width - 12, taskY);
			}

			// Draw progress
			if (task.status === 'running') {
				drawText(ctx, `[${Math.floor(task.progress)}%]`, x + width - 20, taskY);
			}
		}

		// Draw scheduler stats
		drawText(ctx, `Scheduled: ${this.state.scheduled.length} | Next: ${this.state.scheduled[0]?.name || 'None'}`, x + 2, y + height - 2);
	}

	/**
	 * Render progress view
	 */
	private renderProgressView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Task Progress - Real-time Updates', x + 2, y + 1);

		const contentY = y + 3;
		const maxHistory = Math.min(this.state.history.length, height - 6);

		// Draw history
		for (let i = 0; i < maxHistory; i++) {
			const task = this.state.history[i];
			const taskY = contentY + i * 2;

			// Draw status
			const statusColor = task.status === 'completed' ? { rgb: [78, 205, 196] as [number, number, number] } : { rgb: [255, 107, 107] as [number, number, number] };
			ctx.save();
			ctx.setFg(statusColor);
			drawText(ctx, task.status === 'completed' ? '✓' : '✗', x + 4, taskY);
			ctx.restore();

			// Draw task name
			const nameWidth = width - 20;
			let name = task.name;
			if (name.length > nameWidth) {
				name = name.substring(0, nameWidth - 3) + '...';
			}
			drawText(ctx, name, x + 7, taskY);

			// Draw duration
			if (task.startTime && task.endTime) {
				const duration = task.endTime - task.startTime;
				drawText(ctx, `${Math.floor(duration)}ms`, x + width - 10, taskY);
			}
		}

		// Draw stats
		drawText(ctx, `Completed: ${this.state.totalCompleted} | Failed: ${this.state.totalFailed} | History: ${this.state.history.length}`, x + 2, y + height - 2);
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);
		drawText(ctx, 'Press 1-4 to switch views | Space to toggle auto-generate | q to quit', 2, footerY);
	}

	/**
	 * Handle key input
	 */
	handleKey(key: string): void {
		switch (key) {
			case 'q':
				this.stop();
				break;
			case '1':
				this.state.activeView = 'queue';
				break;
			case '2':
				this.state.activeView = 'pool';
				break;
			case '3':
				this.state.activeView = 'scheduler';
				break;
			case '4':
				this.state.activeView = 'progress';
				break;
			case ' ':
				this.state.autoGenerate = !this.state.autoGenerate;
				break;
		}
	}

	/**
	 * Get current state
	 */
	getState(): TasksDemoState {
		return { ...this.state };
	}
}

/**
 * Create a tasks demo instance
 */
export function createTasksDemo(config?: TasksDemoConfig): TasksDemo {
	return new TasksDemo(config);
}
