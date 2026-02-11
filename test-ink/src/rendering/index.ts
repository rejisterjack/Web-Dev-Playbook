/**
 * Rendering Engine Module
 *
 * This module provides the high-performance rendering engine for the TUI framework.
 * It includes double buffering, differential rendering, render strategies, drawing
 * primitives, animation support, and performance optimizations.
 *
 * @module rendering
 *
 * @example
 * ```typescript
 * import {
 *   Renderer,
 *   createRenderContext,
 *   createBuffer,
 *   drawBox,
 *   drawText,
 * } from './rendering';
 *
 * // Create renderer
 * const renderer = new Renderer({
 *   width: 80,
 *   height: 24,
 *   targetFps: 60,
 * });
 *
 * // Get back buffer for drawing
 * const buffer = renderer.getBackBuffer();
 * const ctx = createRenderContext(buffer);
 *
 * // Draw some content
 * drawBox(ctx, { x: 0, y: 0, width: 40, height: 10 });
 * drawText(ctx, 'Hello, World!', 2, 1);
 *
 * // Render to screen
 * await renderer.render();
 * ```
 */

// Cell module
export {
	// Types
	Cell,
	CellStyles,
	Color,
	RGBColor,
	// Constants
	DEFAULT_CELL,
	// Functions
	createCell,
	cloneCell,
	mergeCells,
	cellsEqual,
	colorsEqual,
	stylesEqual,
	resetCell,
	copyCell,
} from './cell.js';

// Buffer module
export {
	// Types
	BufferChange,
	DirtyRegion,
	// Classes
	ScreenBuffer,
	// Functions
	createBuffer,
} from './buffer.js';

// Double buffer module
export {
	// Types
	DoubleBufferOptions,
	SwapStats,
	// Classes
	DoubleBufferManager,
	// Functions
	createDoubleBufferManager,
} from './double-buffer.js';

// Differential renderer module
export {
	// Types
	UpdateOperation,
	StyledRun,
	RenderInstruction,
	DifferentialRenderOptions,
	DifferentialStats,
	// Classes
	DifferentialRenderer,
	// Functions
	createDifferentialRenderer,
} from './differential.js';

// Strategy module
export {
	// Types
	RenderStrategy,
	RenderStats,
	RenderContext as StrategyRenderContext,
	FullRenderStrategyOptions,
	DifferentialRenderStrategyOptions,
	SmartRenderStrategyOptions,
	// Classes
	FullRenderStrategy,
	DifferentialRenderStrategy,
	SmartRenderStrategy,
	// Functions
	createRenderStrategy,
} from './strategy.js';

// Renderer module
export {
	// Types
	RendererOptions,
	FrameStats,
	RendererMetrics,
	// Classes
	Renderer,
	// Functions
	createRenderer,
} from './renderer.js';

// Context module
export {
	// Types
	Rect,
	Point,
	ClipRegion,
	RenderContextState,
	RenderContext,
	BoxDrawingChars,
	// Constants
	DEFAULT_BOX_CHARS,
	DOUBLE_BOX_CHARS,
	ROUNDED_BOX_CHARS,
	// Functions
	createRenderContext,
} from './context.js';

// Primitives module
export {
	// Types
	TextAlign,
	TextWrapOptions,
	ProgressBarOptions,
	ShadowOptions,
	// Functions
	drawText,
	drawAlignedText,
	drawLine,
	drawVLine,
	drawLineBetween,
	drawBox,
	drawDoubleBox,
	drawRoundedBox,
	drawFill,
	drawClear,
	drawProgressBar,
	drawShadow,
	drawBoxWithShadow,
	drawGrid,
	drawScrollBar,
	drawCheckbox,
	drawRadioButton,
	drawSeparator,
} from './primitives.js';

// Animation module
export {
	// Types
	AnimationCallback,
	AnimationFrameOptions,
	AnimationFrame,
	AnimationStats,
	// Constants
	Easing,
	// Classes
	AnimationFrameSystem,
	// Functions
	createAnimationFrameSystem,
	interpolate,
	interpolateColor,
} from './animation.js';

// Optimization module
export {
	// Types
	CacheEntry,
	RenderCacheOptions,
	// Classes
	RenderCache,
	DirtyRegionTracker,
	AnsiSequenceBatcher,
	StringBuilder,
	CellPool,
	PerformanceMonitor,
	// Functions
	createRenderCache,
	createDirtyRegionTracker,
	createAnsiSequenceBatcher,
	createStringBuilder,
	createCellPool,
	createPerformanceMonitor,
} from './optimization.js';
