/**
 * Performance Demo
 *
 * Showcase performance capabilities including rendering performance (FPS,
 * frame time), event handling performance, and memory efficiency.
 *
 * @module demo/performance
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear, drawProgressBar } from '../rendering/primitives.js';

/**
 * Performance metric
 */
interface PerformanceMetric {
	name: string;
	value: number;
	unit: string;
	history: number[];
}

/**
 * Performance demo state
 */
export interface PerformanceDemoState {
	/** Active view */
	activeView: 'rendering' | 'events' | 'memory' | 'summary';
	/** Frame count */
	frameCount: number;
	/** FPS */
	fps: number;
	/** Frame time (ms) */
	frameTime: number;
	/** Event count */
	eventCount: number;
	/** Memory usage (MB) */
	memoryUsage: number;
	/** Metrics */
	metrics: {
		rendering: PerformanceMetric[];
		events: PerformanceMetric[];
		memory: PerformanceMetric[];
	};
	/** Update interval */
	updateInterval: number;
	/** Auto-benchmark running */
	autoBenchmark: boolean;
}

/**
 * Performance demo configuration
 */
export interface PerformanceDemoConfig {
	/** Target FPS */
	targetFps?: number;
}

/**
 * Performance demo component
 */
export class PerformanceDemo {
	private state: PerformanceDemoState;
	private config: Required<PerformanceDemoConfig>;
	private lastFrameTime = 0;
	private lastUpdateTime = 0;
	private updateTimer?: NodeJS.Timeout;
	private frameTimes: number[] = [];

	constructor(config: PerformanceDemoConfig = {}) {
		this.config = {
			targetFps: config.targetFps || 60,
		};

		this.state = {
			activeView: 'rendering',
			frameCount: 0,
			fps: 0,
			frameTime: 0,
			eventCount: 0,
			memoryUsage: 0,
			metrics: {
				rendering: [
					{ name: 'FPS', value: 0, unit: '', history: [] },
					{ name: 'Frame Time', value: 0, unit: 'ms', history: [] },
					{ name: 'Draw Calls', value: 0, unit: '', history: [] },
				],
				events: [
					{ name: 'Events/sec', value: 0, unit: '', history: [] },
					{ name: 'Avg Latency', value: 0, unit: 'ms', history: [] },
					{ name: 'Peak Latency', value: 0, unit: 'ms', history: [] },
				],
				memory: [
					{ name: 'Heap Used', value: 0, unit: 'MB', history: [] },
					{ name: 'Heap Total', value: 0, unit: 'MB', history: [] },
					{ name: 'External', value: 0, unit: 'MB', history: [] },
				],
			},
			updateInterval: 1000,
			autoBenchmark: true,
		};
	}

	/**
	 * Start performance demo
	 */
	start(): void {
		this.updateTimer = setInterval(() => {
			this.update();
		}, this.state.updateInterval);
	}

	/**
	 * Stop performance demo
	 */
	stop(): void {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = undefined;
		}
	}

	/**
	 * Update performance state
	 */
	private update(): void {
		// Simulate frame time
		const now = Date.now();
		const frameTime = this.lastFrameTime ? now - this.lastFrameTime : 16;
		this.lastFrameTime = now;

		// Update frame metrics
		this.state.frameCount++;
		this.state.frameTime = frameTime;
		this.state.fps = Math.round(1000 / frameTime);

		// Update event count
		this.state.eventCount += Math.floor(Math.random() * 100);

		// Update memory usage
		this.state.memoryUsage = Math.floor(50 + Math.random() * 100);

		// Update metrics history
		if (now - this.lastUpdateTime >= 1000) {
			this.lastUpdateTime = now;
			this.updateMetricsHistory();
		}
	}

	/**
	 * Update metrics history
	 */
	private updateMetricsHistory(): void {
		// Keep last 10 values
		const maxHistory = 10;

		// Update rendering metrics
		this.state.metrics.rendering[0].value = this.state.fps;
		this.state.metrics.rendering[0].history.push(this.state.fps);
		if (this.state.metrics.rendering[0].history.length > maxHistory) {
			this.state.metrics.rendering[0].history.shift();
		}

		this.state.metrics.rendering[1].value = this.state.frameTime;
		this.state.metrics.rendering[1].history.push(this.state.frameTime);
		if (this.state.metrics.rendering[1].history.length > maxHistory) {
			this.state.metrics.rendering[1].history.shift();
		}

		this.state.metrics.rendering[2].value = this.state.frameCount;
		this.state.metrics.rendering[2].history.push(this.state.frameCount);
		if (this.state.metrics.rendering[2].history.length > maxHistory) {
			this.state.metrics.rendering[2].history.shift();
		}

		// Update event metrics
		this.state.metrics.events[0].value = this.state.eventCount;
		this.state.metrics.events[0].history.push(this.state.eventCount);
		if (this.state.metrics.events[0].history.length > maxHistory) {
			this.state.metrics.events[0].history.shift();
		}

		const latency = Math.floor(Math.random() * 20);
		this.state.metrics.events[1].value = latency;
		this.state.metrics.events[1].history.push(latency);
		if (this.state.metrics.events[1].history.length > maxHistory) {
			this.state.metrics.events[1].history.shift();
		}

		const peakLatency = latency + Math.floor(Math.random() * 10);
		this.state.metrics.events[2].value = peakLatency;
		this.state.metrics.events[2].history.push(peakLatency);
		if (this.state.metrics.events[2].history.length > maxHistory) {
			this.state.metrics.events[2].history.shift();
		}

		// Update memory metrics
		this.state.metrics.memory[0].value = this.state.memoryUsage;
		this.state.metrics.memory[0].history.push(this.state.memoryUsage);
		if (this.state.metrics.memory[0].history.length > maxHistory) {
			this.state.metrics.memory[0].history.shift();
		}

		this.state.metrics.memory[1].value = Math.floor(this.state.memoryUsage * 1.5);
		this.state.metrics.memory[1].history.push(this.state.metrics.memory[1].value);
		if (this.state.metrics.memory[1].history.length > maxHistory) {
			this.state.metrics.memory[1].history.shift();
		}

		this.state.metrics.memory[2].value = Math.floor(this.state.memoryUsage * 2);
		this.state.metrics.memory[2].history.push(this.state.metrics.memory[2].value);
		if (this.state.metrics.memory[2].history.length > maxHistory) {
			this.state.metrics.memory[2].history.shift();
		}
	}

	/**
	 * Render performance demo
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
		drawText(ctx, 'Performance Demo - Rendering & Memory', 2, 1);
		drawText(ctx, `FPS: ${this.state.fps}`, width - 10, 1);
	}

	/**
	 * Render view navigation
	 */
	private renderViewNavigation(ctx: RenderContext, width: number): void {
		const views: { key: string; type: PerformanceDemoState['activeView'] }[] = [
			{ key: '1', type: 'rendering' },
			{ key: '2', type: 'events' },
			{ key: '3', type: 'memory' },
			{ key: '4', type: 'summary' },
		];

		const navY = 4;
		drawBox(ctx, { x: 0, y: navY, width, height: 2 });
		drawText(ctx, 'Views: ', 2, navY + 1);

		let xPos = 10;
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
			case 'rendering':
				this.renderRenderingView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
			case 'events':
				this.renderEventsView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
			case 'memory':
				this.renderMemoryView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
			case 'summary':
				this.renderSummaryView(ctx, 2, viewY, viewWidth, viewHeight);
				break;
		}
	}

	/**
	 * Render rendering view
	 */
	private renderRenderingView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Rendering Performance', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;

		// Draw FPS chart
		drawText(ctx, 'FPS History:', x + 4, contentY);
		const fpsHistoryY = contentY + 1;
		const chartWidth = width - 8;

		this.state.metrics.rendering[0].history.forEach((fps, i) => {
			const barWidth = Math.floor((chartWidth / 10) * (fps / 60));
			const barX = x + 4 + i * (chartWidth / 10);

			ctx.save();
			ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
			for (let j = 0; j < barWidth; j++) {
				ctx.drawChar('█', barX + j, fpsHistoryY);
			}
			ctx.restore();

			drawText(ctx, `${fps}`, barX, fpsHistoryY + 1);
		});

		// Draw frame time chart
		drawText(ctx, 'Frame Time History:', x + 4, contentY + 4);
		const frameTimeY = contentY + 5;

		this.state.metrics.rendering[1].history.forEach((time, i) => {
			const barWidth = Math.floor((chartWidth / 10) * (time / 50));
			const barX = x + 4 + i * (chartWidth / 10);

			ctx.save();
			ctx.setFg({ rgb: [69, 183, 209] as [number, number, number] });
			for (let j = 0; j < barWidth; j++) {
				ctx.drawChar('█', barX + j, frameTimeY);
			}
			ctx.restore();

			drawText(ctx, `${time}ms`, barX, frameTimeY + 1);
		});

		// Draw current stats
		const statsY = contentY + 9;
		drawText(ctx, `Current FPS: ${this.state.fps} / Target: ${this.config.targetFps}`, x + 4, statsY);
		drawText(ctx, `Frame Time: ${this.state.frameTime}ms`, x + 4, statsY + 1);
		drawText(ctx, `Frames: ${this.state.frameCount}`, x + 4, statsY + 2);
	}

	/**
	 * Render events view
	 */
	private renderEventsView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Event Handling Performance', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;

		// Draw events per second chart
		drawText(ctx, 'Events/sec History:', x + 4, contentY);
		const eventsY = contentY + 1;
		const chartWidth = width - 8;

		this.state.metrics.events[0].history.forEach((events, i) => {
			const barWidth = Math.floor((chartWidth / 10) * (events / 500));
			const barX = x + 4 + i * (chartWidth / 10);

			ctx.save();
			ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
			for (let j = 0; j < barWidth; j++) {
				ctx.drawChar('█', barX + j, eventsY);
			}
			ctx.restore();

			drawText(ctx, `${events}`, barX, eventsY + 1);
		});

		// Draw latency chart
		drawText(ctx, 'Avg Latency History:', x + 4, contentY + 4);
		const latencyY = contentY + 5;

		this.state.metrics.events[1].history.forEach((latency, i) => {
			const barWidth = Math.floor((chartWidth / 10) * (latency / 20));
			const barX = x + 4 + i * (chartWidth / 10);

			ctx.save();
			ctx.setFg({ rgb: [69, 183, 209] as [number, number, number] });
			for (let j = 0; j < barWidth; j++) {
				ctx.drawChar('█', barX + j, latencyY);
			}
			ctx.restore();

			drawText(ctx, `${latency}ms`, barX, latencyY + 1);
		});

		// Draw current stats
		const statsY = contentY + 9;
		drawText(ctx, `Events/sec: ${this.state.eventCount}`, x + 4, statsY);
		drawText(ctx, `Avg Latency: ${this.state.metrics.events[1].value}ms`, x + 4, statsY + 1);
		drawText(ctx, `Peak Latency: ${this.state.metrics.events[2].value}ms`, x + 4, statsY + 2);
	}

	/**
	 * Render memory view
	 */
	private renderMemoryView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Memory Usage', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;

		// Draw memory bars
		drawText(ctx, 'Memory Distribution:', x + 4, contentY);
		const barY = contentY + 1;
		const barWidth = width - 8;

		this.state.metrics.memory.forEach((metric, i) => {
			const metricY = barY + i * 2;
			const metricBarWidth = Math.floor(barWidth * (metric.value / 200));

			drawText(ctx, `${metric.name}:`, x + 4, metricY);

			drawProgressBar(ctx, x + 4, metricY, {
				width: metricBarWidth,
				progress: metric.value / 200,
			});

			drawText(ctx, `${metric.value} ${metric.unit}`, x + 4 + metricBarWidth + 2, metricY);
		});

		// Draw current stats
		const statsY = contentY + 9;
		drawText(ctx, `Heap Used: ${this.state.memoryUsage}MB`, x + 4, statsY);
		drawText(ctx, `Heap Total: ${Math.floor(this.state.memoryUsage * 1.5)}MB`, x + 4, statsY + 1);
		drawText(ctx, `External: ${Math.floor(this.state.memoryUsage * 2)}MB`, x + 4, statsY + 2);
	}

	/**
	 * Render summary view
	 */
	private renderSummaryView(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Performance Summary', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;

		// Draw overall score
		const score = Math.floor((this.state.fps / this.config.targetFps) * 100);
		drawText(ctx, `Performance Score: ${score}/100`, x + 4, contentY);

		// Draw progress bar
		drawProgressBar(ctx, x + 4, contentY + 2, {
			width: width - 8,
			progress: score / 100,
		});

		// Draw recommendations
		drawText(ctx, 'Recommendations:', x + 4, contentY + 4);

		const recommendations: string[] = [];
		if (this.state.fps < 30) {
			recommendations.push('• Consider reducing draw calls');
		}
		if (this.state.frameTime > 33) {
			recommendations.push('• Optimize rendering logic');
		}
		if (this.state.memoryUsage > 150) {
			recommendations.push('• Review memory allocations');
		}

		for (let i = 0; i < recommendations.length && i < 3; i++) {
			drawText(ctx, recommendations[i], x + 4, contentY + 5 + i);
		}

		// Draw benchmark info
		drawText(ctx, `Auto-Benchmark: ${this.state.autoBenchmark ? 'ON' : 'OFF'}`, x + 4, contentY + 9);
		drawText(ctx, `Target FPS: ${this.config.targetFps}`, x + width - 15, contentY + 9);
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);
		drawText(ctx, 'Press 1-4 to switch views | Space to toggle benchmark | q to quit', 2, footerY);
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
				this.state.activeView = 'rendering';
				break;
			case '2':
				this.state.activeView = 'events';
				break;
			case '3':
				this.state.activeView = 'memory';
				break;
			case '4':
				this.state.activeView = 'summary';
				break;
			case ' ':
				this.state.autoBenchmark = !this.state.autoBenchmark;
				break;
		}
	}

	/**
	 * Get current state
	 */
	getState(): PerformanceDemoState {
		return { ...this.state };
	}
}

/**
 * Create a performance demo instance
 */
export function createPerformanceDemo(config?: PerformanceDemoConfig): PerformanceDemo {
	return new PerformanceDemo(config);
}
