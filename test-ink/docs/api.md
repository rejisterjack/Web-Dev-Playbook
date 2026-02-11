# API Reference

Complete API reference for the TUI Framework. All modules are exported from the main package.

## Table of Contents

- [Terminal Module](#terminal-module)
- [Rendering Module](#rendering-module)
- [Layout Module](#layout-module)
- [Events Module](#events-module)
- [Theme Module](#theme-module)
- [Accessibility Module](#accessibility-module)
- [Task Module](#task-module)
- [Visualization Module](#visualization-module)

---

## Terminal Module

The terminal module provides low-level terminal control capabilities.

### Terminal Detection

#### `detectCapabilities()`

Detects terminal capabilities and features.

```typescript
function detectCapabilities(): TerminalCapabilities;

interface TerminalCapabilities {
  termType: string;
  colorSupport: ColorSupport;
  mouseSupport: boolean;
  unicodeSupport: boolean;
  trueColorSupport: boolean;
  hyperlinksSupport: boolean;
}

enum ColorSupport {
  NONE = 'none',
  BASIC = 'basic',
  EXTENDED = 'extended',
  TRUECOLOR = 'truecolor',
}
```

**Example:**

```typescript
import { detectCapabilities } from 'tui-framework';

const caps = detectCapabilities();
console.log(`Terminal: ${caps.termType}`);
console.log(`Colors: ${caps.colorSupport}`);
```

#### `isTTY()`

Checks if stdin/stdout is a TTY.

```typescript
function isTTY(): boolean;
```

#### `isCI()`

Detects if running in a CI environment.

```typescript
function isCI(): boolean;
```

### ANSI Escape Codes

#### ANSI Namespace

```typescript
namespace ANSI {
  // Cursor control
  function moveCursor(x: number, y: number): string;
  function moveCursorUp(lines?: number): string;
  function moveCursorDown(lines?: number): string;
  function moveCursorForward(cols?: number): string;
  function moveCursorBackward(cols?: number): string;
  function setCursorColumn(col: number): string;
  function saveCursor(): string;
  function restoreCursor(): string;
  function hideCursor(): string;
  function showCursor(): string;

  // Screen control
  function clearScreen(): string;
  function clearLine(): string;
  function clearLineFromCursor(): string;
  function clearLineToCursor(): string;
  function scrollUp(lines?: number): string;
  function scrollDown(lines?: number): string;

  // Colors
  function setForeground(color: Color): string;
  function setBackground(color: Color): string;
  function setTrueColor(r: number, g: number, b: number): string;
  function setTrueColorBackground(r: number, g: number, b: number): string;
  function resetColor(): string;

  // Styles
  function setBold(): string;
  function setDim(): string;
  function setItalic(): string;
  function setUnderline(): string;
  function setBlink(): string;
  function setReverse(): string;
  function setHidden(): string;
  function setStrikethrough(): string;
  function resetStyle(): string;

  // Modes
  function enableMouse(): string;
  function disableMouse(): string;
  function enableBracketedPaste(): string;
  function disableBracketedPaste(): string;
  function enableAlternateScreen(): string;
  function disableAlternateScreen(): string;
}
```

**Example:**

```typescript
import { ANSI } from 'tui-framework';

// Move cursor and set color
process.stdout.write(ANSI.moveCursor(10, 5));
process.stdout.write(ANSI.setTrueColor(255, 0, 0));
process.stdout.write('Red text');
process.stdout.write(ANSI.resetStyle());
```

### Raw Mode Management

#### `RawModeManager`

Manages terminal raw mode for interactive input.

```typescript
class RawModeManager {
  constructor(options?: RawModeOptions);
  
  async enter(): Promise<void>;
  async exit(): Promise<void>;
  isActive(): boolean;
  
  on(event: 'error', handler: (error: Error) => void): void;
}

interface RawModeOptions {
  stdin?: NodeJS.ReadStream;
  stdout?: NodeJS.WriteStream;
  handleSigint?: boolean;
}
```

**Example:**

```typescript
import { RawModeManager } from 'tui-framework';

const rawMode = new RawModeManager();

await rawMode.enter();
// Raw mode is now active
// Read individual keypresses
await rawMode.exit();
```

#### `supportsRawMode()`

Checks if raw mode is supported.

```typescript
function supportsRawMode(): boolean;
```

### Terminal Size

#### `TerminalSizeManager`

Manages terminal size and resize events.

```typescript
class TerminalSizeManager extends EventEmitter {
  constructor();
  
  getSize(): TerminalSize;
  on(event: 'resize', handler: (size: TerminalSize) => void): this;
  
  static getTerminalSize(): TerminalSize;
}

interface TerminalSize {
  columns: number;
  rows: number;
}
```

**Example:**

```typescript
import { TerminalSizeManager } from 'tui-framework';

const sizeManager = new TerminalSizeManager();

sizeManager.on('resize', (size) => {
  console.log(`Resized to ${size.columns}x${size.rows}`);
});

const { columns, rows } = sizeManager.getSize();
```

### Terminal Input

#### `TerminalInput`

Handles raw terminal input with escape sequence parsing.

```typescript
class TerminalInput extends EventEmitter {
  constructor(options?: TerminalInputOptions);
  
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  
  on(event: 'key', handler: (key: KeyEvent) => void): this;
  on(event: 'mouse', handler: (mouse: MouseEvent) => void): this;
  on(event: 'data', handler: (data: Buffer) => void): this;
}

interface TerminalInputOptions {
  rawMode?: boolean;
  mouseSupport?: boolean;
  stdin?: NodeJS.ReadStream;
}
```

**Example:**

```typescript
import { TerminalInput } from 'tui-framework';

const input = new TerminalInput({ rawMode: true });

input.on('key', (key) => {
  console.log('Key:', key.name, 'Ctrl:', key.ctrl);
});

input.start();
```

### Terminal Output

#### `TerminalOutput`

Buffered terminal output for efficient writing.

```typescript
class TerminalOutput {
  constructor(options?: TerminalOutputOptions);
  
  write(data: string | Buffer): void;
  writeln(data?: string): void;
  async flush(): Promise<void>;
  clearBuffer(): void;
  
  getBufferSize(): number;
}

interface TerminalOutputOptions {
  stdout?: NodeJS.WriteStream;
  bufferSize?: number;
  autoFlush?: boolean;
}
```

**Example:**

```typescript
import { TerminalOutput } from 'tui-framework';

const output = new TerminalOutput();

output.write('Hello ');
output.write('World!');
await output.flush();
```

---

## Rendering Module

The rendering module provides high-performance screen rendering capabilities.

### Cell

#### `Cell` Interface

Represents a single character cell on the screen.

```typescript
interface Cell {
  char: string;
  fg: Color;
  bg: Color;
  styles: CellStyles;
  width: number;
}

interface CellStyles {
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  blink?: boolean;
  reverse?: boolean;
  hidden?: boolean;
  strikethrough?: boolean;
}

type Color =
  | 'default'
  | 'black' | 'red' | 'green' | 'yellow'
  | 'blue' | 'magenta' | 'cyan' | 'white'
  | 'gray'
  | 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow'
  | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite'
  | { index: number }
  | { rgb: [number, number, number] };
```

#### Cell Functions

```typescript
function createCell(char?: string, options?: CellOptions): Cell;
function cloneCell(cell: Cell): Cell;
function mergeCells(base: Cell, overlay: Cell): Cell;
function cellsEqual(a: Cell, b: Cell): boolean;
function resetCell(cell: Cell): void;
function copyCell(source: Cell, target: Cell): void;

const DEFAULT_CELL: Readonly<Cell>;
```

### Screen Buffer

#### `ScreenBuffer`

Represents a 2D grid of cells.

```typescript
class ScreenBuffer {
  constructor(width: number, height: number);
  
  width: number;
  height: number;
  
  getCell(x: number, y: number): Cell | undefined;
  setCell(x: number, y: number, cell: Cell): void;
  getRow(y: number): Cell[];
  clear(): void;
  fill(cell: Cell): void;
  resize(width: number, height: number): void;
  
  getDirtyRegions(): DirtyRegion[];
  clearDirtyRegions(): void;
}

interface DirtyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createBuffer(width: number, height: number): ScreenBuffer;
```

**Example:**

```typescript
import { ScreenBuffer, createCell, createBuffer } from 'tui-framework';

const buffer = createBuffer(80, 24);

// Set a cell
const cell = createCell('A', {
  fg: { rgb: [255, 0, 0] },
  bold: true,
});
buffer.setCell(0, 0, cell);

// Clear buffer
buffer.clear();
```

### Double Buffer

#### `DoubleBufferManager`

Manages front and back buffers for flicker-free rendering.

```typescript
class DoubleBufferManager {
  constructor(options?: DoubleBufferOptions);
  
  getBackBuffer(): ScreenBuffer;
  getFrontBuffer(): ScreenBuffer;
  swap(): void;
  getDiff(): UpdateOperation[];
  getStats(): SwapStats;
  resize(width: number, height: number): void;
}

interface DoubleBufferOptions {
  width: number;
  height: number;
}

interface UpdateOperation {
  x: number;
  y: number;
  cell: Cell;
}

interface SwapStats {
  swapCount: number;
  averageDiffSize: number;
}

function createDoubleBufferManager(options: DoubleBufferOptions): DoubleBufferManager;
```

### Renderer

#### `Renderer`

Main rendering engine.

```typescript
class Renderer {
  constructor(options?: RendererOptions);
  
  getBackBuffer(): ScreenBuffer;
  async render(): Promise<void>;
  resize(width: number, height: number): void;
  setTargetFps(fps: number): void;
  getStats(): RenderStats;
  
  on(event: 'beforeRender', handler: () => void): this;
  on(event: 'afterRender', handler: () => void): this;
}

interface RendererOptions {
  width?: number;
  height?: number;
  targetFps?: number;
  strategy?: RenderStrategy;
}

interface RenderStats {
  frameCount: number;
  averageFrameTime: number;
  lastFrameTime: number;
  totalCells: number;
  changedCells: number;
}
```

**Example:**

```typescript
import { Renderer, createRenderContext } from 'tui-framework';

const renderer = new Renderer({
  width: 80,
  height: 24,
  targetFps: 60,
});

// Get back buffer and draw
const buffer = renderer.getBackBuffer();
const ctx = createRenderContext(buffer);

ctx.drawText('Hello', 0, 0);

// Render to screen
await renderer.render();
```

### Render Context

#### `createRenderContext()`

Creates a rendering context for drawing operations.

```typescript
function createRenderContext(buffer: ScreenBuffer): RenderContext;

interface RenderContext {
  // Properties
  width: number;
  height: number;
  
  // Drawing operations
  clear(): void;
  drawText(text: string, x: number, y: number, styles?: CellStyles): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, styles?: CellStyles): void;
  drawBox(x: number, y: number, width: number, height: number, options?: BoxOptions): void;
  fillRect(x: number, y: number, width: number, height: number, cell: Cell): void;
  
  // Clipping
  pushClip(x: number, y: number, width: number, height: number): void;
  popClip(): void;
  
  // Transformations
  pushTransform(x: number, y: number): void;
  popTransform(): void;
}

interface BoxOptions {
  border?: boolean;
  borderStyle?: 'single' | 'double' | 'round' | 'bold';
  fg?: Color;
  bg?: Color;
}
```

**Example:**

```typescript
import { createRenderContext, createBuffer } from 'tui-framework';

const buffer = createBuffer(80, 24);
const ctx = createRenderContext(buffer);

// Clear and draw
ctx.clear();
ctx.drawText('Title', 2, 1, { bold: true });
ctx.drawBox(0, 0, 40, 10, { border: true });
ctx.drawLine(1, 3, 38, 3);
```

### Drawing Primitives

```typescript
function drawText(
  ctx: RenderContext,
  text: string,
  x: number,
  y: number,
  options?: TextOptions
): void;

function drawBox(
  ctx: RenderContext,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: BoxOptions
): void;

function drawLine(
  ctx: RenderContext,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  styles?: CellStyles
): void;

function drawHorizontalLine(
  ctx: RenderContext,
  x: number,
  y: number,
  length: number,
  styles?: CellStyles
): void;

function drawVerticalLine(
  ctx: RenderContext,
  x: number,
  y: number,
  length: number,
  styles?: CellStyles
): void;

interface TextOptions {
  fg?: Color;
  bg?: Color;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  maxWidth?: number;
  ellipsis?: boolean;
}
```

---

## Layout Module

The layout module provides a Flexbox-like layout system.

### Layout Node

#### `LayoutNode`

Represents a node in the layout tree.

```typescript
class LayoutNode {
  constructor(options?: LayoutNodeOptions);
  
  id: string;
  children: LayoutNode[];
  style: FlexStyle;
  computedLayout: ComputedLayout;
  
  addChild(child: LayoutNode): void;
  removeChild(child: LayoutNode): void;
  insertChildAt(index: number, child: LayoutNode): void;
  getChildAt(index: number): LayoutNode | undefined;
  
  setStyle(style: Partial<FlexStyle>): void;
  getComputedLayout(): ComputedLayout;
  
  measure(constraints: Constraints): Size;
}

interface LayoutNodeOptions {
  id?: string;
  style?: FlexStyle;
  measureFn?: (constraints: Constraints) => Size;
}

interface ComputedLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Flex Container

#### `FlexContainer`

A container that lays out children using Flexbox.

```typescript
class FlexContainer extends LayoutNode {
  constructor(options?: FlexContainerOptions);
  
  setConfig(config: Partial<FlexContainerConfig>): void;
  getConfig(): FlexContainerConfig;
}

interface FlexContainerOptions extends LayoutNodeOptions {
  config?: FlexContainerConfig;
}

interface FlexContainerConfig {
  direction: FlexDirection;
  wrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;
  gap: number;
  rowGap?: number;
  columnGap?: number;
}

enum FlexDirection {
  ROW = 'row',
  ROW_REVERSE = 'row-reverse',
  COLUMN = 'column',
  COLUMN_REVERSE = 'column-reverse',
}

enum FlexWrap {
  NO_WRAP = 'nowrap',
  WRAP = 'wrap',
  WRAP_REVERSE = 'wrap-reverse',
}

enum JustifyContent {
  FLEX_START = 'flex-start',
  FLEX_END = 'flex-end',
  CENTER = 'center',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
  SPACE_EVENLY = 'space-evenly',
}

enum AlignItems {
  FLEX_START = 'flex-start',
  FLEX_END = 'flex-end',
  CENTER = 'center',
  STRETCH = 'stretch',
  BASELINE = 'baseline',
}

enum AlignContent {
  FLEX_START = 'flex-start',
  FLEX_END = 'flex-end',
  CENTER = 'center',
  STRETCH = 'stretch',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
  SPACE_EVENLY = 'space-evenly',
}
```

### Layout Engine

#### `LayoutEngine`

Main layout calculation engine.

```typescript
class LayoutEngine extends EventEmitter {
  constructor(options?: LayoutEngineOptions);
  
  setRoot(root: LayoutNode): void;
  getRoot(): LayoutNode | undefined;
  
  calculateLayout(constraints?: Constraints): void;
  setViewport(width: number, height: number): void;
  getViewport(): Size;
  
  on(event: 'layout', handler: (layout: ComputedLayout) => void): this;
  on(event: LayoutEngineEvent, handler: () => void): this;
}

interface LayoutEngineOptions {
  width?: number;
  height?: number;
  useCache?: boolean;
}

enum LayoutEngineEvent {
  LAYOUT_START = 'layoutStart',
  LAYOUT_COMPLETE = 'layoutComplete',
  LAYOUT_ERROR = 'layoutError',
}
```

**Example:**

```typescript
import { LayoutEngine, FlexContainer, FlexDirection } from 'tui-framework';

const engine = new LayoutEngine({ width: 80, height: 24 });

const container = new FlexContainer({
  config: {
    direction: FlexDirection.ROW,
    gap: 2,
  },
});

const child1 = new LayoutNode({ style: { width: 20, height: 10 } });
const child2 = new LayoutNode({ style: { flex: 1 } });

container.addChild(child1);
container.addChild(child2);

engine.setRoot(container);
engine.calculateLayout();

console.log(child1.getComputedLayout());
console.log(child2.getComputedLayout());
```

### Layout Builder

#### `LayoutBuilder`

Fluent API for building layouts.

```typescript
class LayoutBuilder {
  static row(options?: ContainerOptions): LayoutBuilder;
  static column(options?: ContainerOptions): LayoutBuilder;
  static container(options?: ContainerOptions): LayoutBuilder;
  
  child(node: LayoutNode | LayoutBuilder): this;
  children(nodes: (LayoutNode | LayoutBuilder)[]): this;
  style(style: Partial<FlexStyle>): this;
  config(config: Partial<FlexContainerConfig>): this;
  
  build(): LayoutNode;
}

// Helper functions
function row(options?: ContainerOptions): LayoutBuilder;
function column(options?: ContainerOptions): LayoutBuilder;
function container(options?: ContainerOptions): LayoutBuilder;
function flex(options?: ContainerOptions): LayoutBuilder;
```

**Example:**

```typescript
import { row, column } from 'tui-framework';

const layout = column({ gap: 1 })
  .child(row({ gap: 2 })
    .child(new LayoutNode({ style: { width: 20 } }))
    .child(new LayoutNode({ style: { flex: 1 } }))
  )
  .child(new LayoutNode({ style: { height: 5 } }))
  .build();
```

### Viewport

#### `Viewport`

Manages viewport with scrolling support.

```typescript
class Viewport extends EventEmitter {
  constructor(options?: ViewportOptions);
  
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  
  setSize(width: number, height: number): void;
  setContentSize(width: number, height: number): void;
  
  scrollTo(x: number, y: number): void;
  scrollBy(deltaX: number, deltaY: number): void;
  scrollIntoView(rect: Rect): void;
  
  getScrollOffset(): ScrollOffset;
  getVisibleRect(): Rect;
  
  on(event: 'scroll', handler: (offset: ScrollOffset) => void): this;
}

interface ViewportOptions {
  width?: number;
  height?: number;
  contentWidth?: number;
  contentHeight?: number;
  scrollX?: number;
  scrollY?: number;
}

interface ScrollOffset {
  x: number;
  y: number;
}
```

---

## Events Module

The events module provides comprehensive event handling.

### Event Types

```typescript
interface BaseEvent {
  type: string;
  timestamp: number;
  priority?: EventPriority;
  propagationStopped?: boolean;
  defaultPrevented?: boolean;
}

interface KeyEvent extends BaseEvent {
  type: 'key';
  key: string;
  sequence: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  code?: number;
  repeat?: boolean;
}

interface MouseEvent extends BaseEvent {
  type: 'mouse';
  action: MouseAction;
  button: MouseButton;
  x: number;
  y: number;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  sequence: string;
}

interface ResizeEvent extends BaseEvent {
  type: 'resize';
  columns: number;
  rows: number;
  previousColumns: number;
  previousRows: number;
}

interface FocusEvent extends BaseEvent {
  type: 'focus';
  focusType: FocusType;
}

interface PasteEvent extends BaseEvent {
  type: 'paste';
  text: string;
  length: number;
}

interface SignalEvent extends BaseEvent {
  type: 'signal';
  signal: SignalType;
}

type Event = KeyEvent | MouseEvent | ResizeEvent | FocusEvent | PasteEvent | SignalEvent | CustomEvent;

enum EventPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2,
}

enum MouseButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  RELEASE = 3,
  SCROLL_UP = 4,
  SCROLL_DOWN = 5,
}

enum MouseAction {
  PRESS = 'press',
  RELEASE = 'release',
  DRAG = 'drag',
  MOVE = 'move',
  SCROLL = 'scroll',
}

enum FocusType {
  GAINED = 'gained',
  LOST = 'lost',
}

enum SignalType {
  SIGWINCH = 'SIGWINCH',
  SIGINT = 'SIGINT',
  SIGTERM = 'SIGTERM',
  SIGHUP = 'SIGHUP',
  SIGQUIT = 'SIGQUIT',
  SIGTSTP = 'SIGTSTP',
  SIGCONT = 'SIGCONT',
}
```

### Event Loop

#### `EventLoop`

Main event processing loop.

```typescript
class EventLoop extends EventEmitter {
  constructor(options?: EventLoopOptions);
  
  async start(): Promise<void>;
  stop(): void;
  isRunning(): boolean;
  
  emit(event: Event): void;
  
  enableMouse(): void;
  disableMouse(): void;
  isMouseSupported(): boolean;
  
  on(event: 'key', handler: (event: KeyEvent) => void): this;
  on(event: 'mouse', handler: (event: MouseEvent) => void): this;
  on(event: 'resize', handler: (event: ResizeEvent) => void): this;
  on(event: 'focus', handler: (event: FocusEvent) => void): this;
  on(event: 'paste', handler: (event: PasteEvent) => void): this;
  on(event: 'signal', handler: (event: SignalEvent) => void): this;
}

interface EventLoopOptions {
  mouseSupport?: boolean;
  bracketedPaste?: boolean;
  handleSigint?: boolean;
  stdin?: NodeJS.ReadStream;
}
```

**Example:**

```typescript
import { EventLoop } from 'tui-framework';

const loop = new EventLoop({
  mouseSupport: true,
  bracketedPaste: true,
});

loop.on('key', (event) => {
  console.log('Key:', event.key);
  if (event.key === 'q' && event.ctrl) {
    loop.stop();
  }
});

loop.on('mouse', (event) => {
  console.log('Mouse:', event.x, event.y, event.action);
});

loop.on('resize', (event) => {
  console.log('Resized:', event.columns, event.rows);
});

await loop.start();
```

### Key Bindings

#### `KeyBindings`

Manages keyboard shortcuts.

```typescript
class KeyBindings {
  constructor();
  
  register(binding: KeyBinding): void;
  unregister(id: string): void;
  
  handle(event: KeyEvent): boolean;
  
  getBindings(): KeyBinding[];
  getBinding(id: string): KeyBinding | undefined;
}

interface KeyBinding {
  id: string;
  chords: KeyChord | KeyChord[];
  callback: () => void;
  description?: string;
  scope?: string;
}

interface KeyChord {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
}
```

**Example:**

```typescript
import { KeyBindings } from 'tui-framework';

const bindings = new KeyBindings();

bindings.register({
  id: 'quit',
  chords: { key: 'q', ctrl: true },
  callback: () => {
    console.log('Quitting...');
    process.exit(0);
  },
  description: 'Quit application',
});

bindings.register({
  id: 'save',
  chords: { key: 's', ctrl: true },
  callback: () => console.log('Saving...'),
  description: 'Save file',
});

// In event handler
loop.on('key', (event) => {
  if (!bindings.handle(event)) {
    // Event not handled by any binding
    console.log('Unhandled key:', event.key);
  }
});
```

### Debouncing and Throttling

#### `Debouncer`

```typescript
class Debouncer<T extends (...args: any[]) => any> {
  constructor(fn: T, options?: DebouncerOptions);
  
  invoke(...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  
  isPending(): boolean;
}

interface DebouncerOptions {
  wait: number;
  leading?: boolean;
  trailing?: boolean;
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: DebouncerOptions
): DebouncedFunction<T>;
```

#### `Throttler`

```typescript
class Throttler<T extends (...args: any[]) => any> {
  constructor(fn: T, options?: ThrottlerOptions);
  
  invoke(...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
}

interface ThrottlerOptions {
  interval: number;
  leading?: boolean;
  trailing?: boolean;
}

function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number,
  options?: ThrottlerOptions
): ThrottledFunction<T>;
```

**Example:**

```typescript
import { debounce, throttle } from 'tui-framework';

// Debounced search
const search = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);

search('a');
search('ab');
search('abc'); // Only this triggers after 300ms

// Throttled resize handler
const handleResize = throttle((width: number, height: number) => {
  console.log('Resized to:', width, height);
}, 100);
```

---

## Theme Module

The theme module provides comprehensive color and theming support.

### Color Types

```typescript
type Color = RGBColor | HSLColor | HWBColor | CMYKColor | HexColor | NamedColor;

interface RGBColor {
  type: ColorSpace.RGB;
  red: number;      // 0-255
  green: number;    // 0-255
  blue: number;     // 0-255
  alpha?: number;   // 0-1
}

interface HSLColor {
  type: ColorSpace.HSL;
  hue: number;           // 0-360
  saturation: number;    // 0-100
  lightness: number;     // 0-100
  alpha?: number;        // 0-1
}

interface HWBColor {
  type: ColorSpace.HWB;
  hue: number;       // 0-360
  whiteness: number; // 0-100
  blackness: number; // 0-100
  alpha?: number;    // 0-1
}

interface CMYKColor {
  type: ColorSpace.CMYK;
  cyan: number;    // 0-100
  magenta: number; // 0-100
  yellow: number;  // 0-100
  key: number;     // 0-100
  alpha?: number;  // 0-1
}

interface HexColor {
  type: 'hex';
  value: string; // #RRGGBB or #RRGGBBAA
}

interface NamedColor {
  type: 'named';
  name: string;
}

enum ColorSpace {
  RGB = 'rgb',
  HSL = 'hsl',
  HWB = 'hwb',
  CMYK = 'cmyk',
}
```

### Color Conversion

```typescript
function hexToRgb(hex: string): RGBColor;
function rgbToHex(rgb: RGBColor): string;
function rgbToHsl(rgb: RGBColor): HSLColor;
function hslToRgb(hsl: HSLColor): RGBColor;
function rgbToHwb(rgb: RGBColor): HWBColor;
function hwbToRgb(hwb: HWBColor): RGBColor;
function rgbToCmyk(rgb: RGBColor): CMYKColor;
function cmykToRgb(cmyk: CMYKColor): RGBColor;
function toRgb(color: Color): RGBColor;
function toHsl(color: Color): HSLColor;
function toHex(color: Color): string;
```

**Example:**

```typescript
import { hexToRgb, rgbToHsl, lighten } from 'tui-framework';

const rgb = hexToRgb('#ff0000');
const hsl = rgbToHsl(rgb);
const lighter = lighten(hsl, 20);
```

### Color Manipulation

```typescript
function lighten(color: Color, amount: number): Color;
function darken(color: Color, amount: number): Color;
function saturate(color: Color, amount: number): Color;
function desaturate(color: Color, amount: number): Color;
function rotate(color: Color, degrees: number): Color; // Hue rotation
function mix(color1: Color, color2: Color, weight?: number): Color;
function fade(color: Color, amount: number): Color; // Adjust alpha
function opacify(color: Color, amount: number): Color;
function grayscale(color: Color): Color;
function invert(color: Color): Color;
function complement(color: Color): Color;
function tint(color: Color, amount: number): Color; // Mix with white
function shade(color: Color, amount: number): Color; // Mix with black
function adjust(color: Color, options: AdjustOptions): Color;
function scale(color: Color, options: ScaleOptions): Color;
function isLight(color: Color): boolean;
function isDark(color: Color): boolean;
function getLuminance(color: Color): number;
```

### Contrast and Accessibility

```typescript
function getLuminance(color: Color): number;
function getContrastRatio(color1: Color, color2: Color): number;
function getColorAccessibility(color1: Color, color2: Color): ColorAccessibility;
function isAccessible(color1: Color, color2: Color, level?: ContrastLevel): boolean;
function getAccessibleColor(background: Color, options?: AccessibleColorOptions): Color;
function findBestAccessibleColor(background: Color, candidates: Color[], level?: ContrastLevel): Color | undefined;
function adjustColorForContrast(color: Color, background: Color, level: ContrastLevel): Color;
function getContrastRating(ratio: number): string;
function isReadableOnLight(color: Color, level?: ContrastLevel): boolean;
function isReadableOnDark(color: Color, level?: ContrastLevel): boolean;
function getRecommendedTextColor(background: Color): Color;

interface ColorAccessibility {
  luminance: number;
  contrastRatio: number;
  isAccessibleAA: boolean;
  isAccessibleAAA: boolean;
  isAccessibleLargeTextAA: boolean;
  isAccessibleLargeTextAAA: boolean;
}

enum ContrastLevel {
  AA = 'AA',
  AAA = 'AAA',
  LargeTextAA = 'LargeTextAA',
  LargeTextAAA = 'LargeTextAAA',
}
```

### Theme Manager

#### `ThemeManager`

```typescript
class ThemeManager extends EventEmitter {
  constructor();
  
  setTheme(theme: Theme): void;
  getTheme(): Theme;
  
  registerTheme(name: string, theme: Theme): void;
  getRegisteredTheme(name: string): Theme | undefined;
  
  setColor(name: string, color: Color): void;
  getColor(name: string): Color | undefined;
  
  on(event: 'themeChange', handler: (theme: Theme) => void): this;
}

interface Theme {
  name: string;
  colors: Record<string, Color>;
  styles: Record<string, CellStyles>;
}
```

**Example:**

```typescript
import { ThemeManager, darkTheme, lightTheme } from 'tui-framework';

const themeManager = new ThemeManager();
themeManager.setTheme(darkTheme);

// Switch themes
themeManager.setTheme(lightTheme);

// Custom theme
const myTheme: Theme = {
  name: 'my-theme',
  colors: {
    primary: { type: ColorSpace.RGB, red: 0, green: 120, blue: 255 },
    background: { type: ColorSpace.RGB, red: 30, green: 30, blue: 30 },
  },
  styles: {},
};

themeManager.registerTheme('my-theme', myTheme);
```

### Predefined Themes

```typescript
const darkTheme: Theme;
const lightTheme: Theme;
const highContrastTheme: Theme;
const monochromeTheme: Theme;
```

### Gradients

```typescript
interface ColorStop {
  color: Color;
  position: number; // 0-1
}

interface GradientConfig {
  type: GradientType;
  stops: ColorStop[];
  angle?: number; // For linear gradients, in degrees
}

enum GradientType {
  Linear = 'linear',
  Radial = 'radial',
}

function createGradient(config: GradientConfig): Gradient;
function getGradientColor(gradient: Gradient, position: number): Color;
function renderGradient(gradient: Gradient, length: number): Color[];
```

---

## Accessibility Module

The accessibility module provides comprehensive accessibility support.

### Accessibility Manager

#### `AccessibilityManager`

```typescript
class AccessibilityManager extends EventEmitter {
  constructor(options?: AccessibilityManagerOptions);
  
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
  
  // Screen reader
  announce(message: string, priority?: AnnouncementPriority): void;
  
  // Focus management
  setFocus(widget: Widget): void;
  getFocusedWidget(): Widget | undefined;
  focusNext(): void;
  focusPrevious(): void;
  
  // High contrast
  enableHighContrast(): void;
  disableHighContrast(): void;
  isHighContrastEnabled(): boolean;
  
  // Text scaling
  setTextScale(scale: number): void;
  getTextScale(): number;
  
  // Reduced motion
  enableReducedMotion(): void;
  disableReducedMotion(): void;
  isReducedMotionEnabled(): boolean;
}

interface AccessibilityManagerOptions {
  enabled?: boolean;
  highContrast?: boolean;
  textScale?: number;
  reducedMotion?: boolean;
}
```

### Screen Reader

#### `ScreenReader`

```typescript
class ScreenReader {
  constructor();
  
  announce(message: string, config?: AnnouncementConfig): void;
  clearAnnouncements(): void;
  
  setLiveRegion(element: Element, config: LiveRegionConfig): void;
}

interface AnnouncementConfig {
  priority?: AnnouncementPriority;
  interrupt?: boolean;
}

enum AnnouncementPriority {
  POLITE = 'polite',
  ASSERTIVE = 'assertive',
  OFF = 'off',
}

interface LiveRegionConfig {
  type: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: string;
}
```

### Focus Management

#### `AccessibilityFocusManager`

```typescript
class AccessibilityFocusManager extends EventEmitter {
  constructor();
  
  register(widget: Widget): void;
  unregister(widget: Widget): void;
  
  setFocus(widget: Widget): void;
  getFocusedWidget(): Widget | undefined;
  
  focusNext(): void;
  focusPrevious(): void;
  focusFirst(): void;
  focusLast(): void;
  
  setFocusOrder(strategy: FocusOrderStrategy): void;
  
  on(event: FocusEventType, handler: (event: FocusEvent) => void): this;
}

enum FocusOrderStrategy {
  DOM_ORDER = 'domOrder',
  TAB_INDEX = 'tabIndex',
  CUSTOM = 'custom',
}

enum FocusEventType {
  FOCUS_GAINED = 'focusGained',
  FOCUS_LOST = 'focusLost',
  FOCUS_CHANGED = 'focusChanged',
}
```

### Keyboard Navigation

#### `KeyboardNavigation`

```typescript
class KeyboardNavigation {
  constructor();
  
  registerShortcut(shortcut: KeyboardShortcut): void;
  unregisterShortcut(id: string): void;
  
  handleKey(event: KeyEvent): boolean;
  
  setScope(scope: ShortcutScope): void;
  getScope(): ShortcutScope;
}

interface KeyboardShortcut {
  id: string;
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  scope?: ShortcutScope;
  handler: () => void;
}

enum ShortcutScope {
  GLOBAL = 'global',
  LOCAL = 'local',
  MODAL = 'modal',
}
```

### ARIA Attributes

```typescript
// ARIA helper functions
function ariaLabel(label: string): AriaAttribute;
function ariaDescription(description: string): AriaAttribute;
function ariaRole(role: AccessibilityRole): AriaAttribute;
function ariaState(state: AccessibilityState): AriaAttribute;
function ariaValue(value: AriaValue): AriaAttribute;
function ariaChecked(checked: boolean): AriaAttribute;
function ariaSelected(selected: boolean): AriaAttribute;
function ariaExpanded(expanded: boolean): AriaAttribute;
function ariaDisabled(disabled: boolean): AriaAttribute;
function ariaRequired(required: boolean): AriaAttribute;
function ariaReadonly(readonly: boolean): AriaAttribute;
function ariaInvalid(invalid: boolean): AriaAttribute;
function ariaBusy(busy: boolean): AriaAttribute;
function ariaHidden(hidden: boolean): AriaAttribute;
function ariaLive(type: 'polite' | 'assertive' | 'off'): AriaAttribute;
function ariaAtomic(atomic: boolean): AriaAttribute;
function ariaHeadingLevel(level: number): AriaAttribute;
function ariaControls(ids: string[]): AriaAttribute;
function ariaDescribedBy(ids: string[]): AriaAttribute;
function ariaLabelledBy(ids: string[]): AriaAttribute;
function ariaValueNow(value: number): AriaAttribute;
function ariaValueMin(value: number): AriaAttribute;
function ariaValueMax(value: number): AriaAttribute;
function ariaValueText(text: string): AriaAttribute;
function ariaTabIndex(index: number): AriaAttribute;
function ariaFocusable(focusable: boolean): AriaAttribute;
function ariaHint(hint: string): AriaAttribute;

// ARIA namespace
const aria: {
  label: typeof ariaLabel;
  description: typeof ariaDescription;
  role: typeof ariaRole;
  // ... all other functions
};
```

### Accessibility Audit

#### `AccessibilityAudit`

```typescript
class AccessibilityAudit {
  constructor();
  
  run(widget: Widget): AuditReport;
  runAll(widgets: Widget[]): AuditReport;
  
  addRule(rule: AuditRule): void;
  removeRule(id: string): void;
}

interface AuditReport {
  passed: boolean;
  violations: Violation[];
  warnings: Warning[];
  score: number;
}

interface Violation {
  rule: string;
  message: string;
  element: Widget;
  severity: 'error' | 'warning';
}
```

---

## Task Module

The task module provides async task processing capabilities.

### Task Types

```typescript
interface Task<T = unknown> {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  fn: () => Promise<T>;
  options: TaskOptions;
  result?: TaskResult<T>;
  progress?: TaskProgress;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  cancelled: boolean;
  dependencies: string[];
  metadata: Record<string, unknown>;
}

interface TaskOptions {
  timeout?: number;
  retries?: number;
  priority?: TaskPriority;
  delay?: number;
  dependencies?: string[];
  cancellable?: boolean;
  metadata?: Record<string, unknown>;
}

interface TaskResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  executionTime?: number;
}

interface TaskProgress {
  current: number;
  total: number;
  percentage: number;
  stage?: string;
  eta?: number;
}

enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}
```

### Task Manager

#### `TaskManager`

```typescript
class TaskManager extends EventEmitter {
  constructor(options?: TaskManagerOptions);
  
  // Task execution
  add<T>(name: string, fn: () => Promise<T>, options?: TaskOptions): Task<T>;
  async execute<T>(task: Task<T>): Promise<TaskResult<T>>;
  cancel(taskId: string): boolean;
  
  // Task queries
  getTask(id: string): Task | undefined;
  getTasks(filter?: TaskFilter): Task[];
  getStatistics(): TaskStatistics;
  
  // Lifecycle
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  
  on(event: TaskEventType, handler: (event: TaskEvent) => void): this;
}

interface TaskManagerOptions {
  maxConcurrent?: number;
  autoStart?: boolean;
}

interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  name?: string | RegExp;
}

interface TaskStatistics {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
}
```

**Example:**

```typescript
import { TaskManager, TaskPriority } from 'tui-framework';

const taskManager = new TaskManager({ maxConcurrent: 4 });

taskManager.on('completed', (event) => {
  console.log('Task completed:', event.task.name);
});

// Add a task
const task = taskManager.add('fetch-data', async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
}, {
  priority: TaskPriority.HIGH,
  timeout: 5000,
  retries: 3,
});

// Execute
taskManager.start();
```

### Task Queue

#### `TaskQueue`

```typescript
class TaskQueue<T = unknown> {
  constructor(options?: TaskQueueOptions);
  
  enqueue(task: Task<T>): void;
  dequeue(): Task<T> | undefined;
  peek(): Task<T> | undefined;
  
  remove(taskId: string): boolean;
  reprioritize(taskId: string, priority: TaskPriority): void;
  
  size(): number;
  isEmpty(): boolean;
  clear(): void;
  
  toArray(): Task<T>[];
}

interface TaskQueueOptions {
  comparator?: (a: Task, b: Task) => number;
}
```

### Progress Reporter

#### `ProgressReporter`

```typescript
class ProgressReporter extends EventEmitter {
  constructor(task: Task);
  
  report(current: number, total: number, stage?: string): void;
  setStage(stage: string): void;
  
  getProgress(): TaskProgress;
  
  on(event: 'progress', handler: (progress: TaskProgress) => void): this;
}
```

**Example:**

```typescript
import { ProgressReporter } from 'tui-framework';

const task = taskManager.add('process-files', async () => {
  const reporter = new ProgressReporter(task);
  const files = await getFiles();
  
  for (let i = 0; i < files.length; i++) {
    await processFile(files[i]);
    reporter.report(i + 1, files.length, `Processing ${files[i].name}`);
  }
  
  return files;
});
```

### Task Decorators

```typescript
function Retry(options?: RetryOptions): MethodDecorator;
function Timeout(ms: number): MethodDecorator;
function Throttle(interval: number): MethodDecorator;
function Debounce(wait: number): MethodDecorator;
function Memoize(): MethodDecorator;
function Async(): MethodDecorator;
function Catch(handler?: (error: Error) => void): MethodDecorator;
function Log(message?: string): MethodDecorator;
function Measure(): MethodDecorator;
function Once(): MethodDecorator;
function RateLimit(limit: number, interval: number): MethodDecorator;
function CircuitBreaker(options?: CircuitBreakerOptions): MethodDecorator;
function Cache(options?: CacheOptions): MethodDecorator;
function Validate(validator: (args: any[]) => boolean): MethodDecorator;
function Compose(...decorators: MethodDecorator[]): MethodDecorator;
```

**Example:**

```typescript
import { Retry, Timeout, Throttle } from 'tui-framework';

class MyService {
  @Retry({ maxRetries: 3, backoffMultiplier: 2 })
  @Timeout(5000)
  async fetchData(): Promise<Data> {
    const response = await fetch('/api/data');
    return response.json();
  }
  
  @Throttle(1000)
  async search(query: string): Promise<Results> {
    return searchApi(query);
  }
}
```

### Utility Functions

```typescript
function createTask<T>(
  name: string,
  fn: () => Promise<T>,
  options?: TaskOptions
): Task<T>;

function delay(ms: number): Promise<void>;
function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
function timeout<T>(promise: Promise<T>, ms: number): Promise<T>;

function parallel<T>(tasks: Task<T>[], options?: ParallelOptions): Promise<TaskResult<T>[]>;
function series<T>(tasks: Task<T>[]): Promise<TaskResult<T>[]>;
function race<T>(tasks: Task<T>[]): Promise<TaskResult<T>>;
function waterfall<T>(tasks: Task<T>[]): Promise<TaskResult<T>>;

function map<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
  options?: MapOptions
): Promise<R[]>;

function filter<T>(
  items: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T[]>;

function reduce<T, R>(
  items: T[],
  reducer: (acc: R, item: T) => Promise<R>,
  initial: R
): Promise<R>;

function each<T>(
  items: T[],
  iterator: (item: T) => Promise<void>
): Promise<void>;
```

---

## Visualization Module

The visualization module provides data visualization components.

### Chart Types

#### Line Chart

```typescript
class LineChartWidget {
  constructor(props: LineChartProps);
  
  setData(series: Series[]): void;
  updateSeries(id: string, data: DataPoint[]): void;
  
  render(ctx: RenderContext, x: number, y: number): void;
  
  on(event: 'hover', handler: (point: DataPoint) => void): this;
  on(event: 'select', handler: (point: DataPoint) => void): this;
}

interface LineChartProps {
  width: number;
  height: number;
  series: Series[];
  xAxis?: Axis;
  yAxis?: Axis;
  legend?: Legend;
  theme?: ChartTheme;
  animate?: boolean;
}
```

#### Bar Chart

```typescript
class BarChartWidget {
  constructor(props: BarChartProps);
  
  setData(series: Series[]): void;
  setOrientation(orientation: ChartOrientation): void;
  
  render(ctx: RenderContext, x: number, y: number): void;
}

interface BarChartProps {
  width: number;
  height: number;
  series: Series[];
  orientation?: ChartOrientation;
  grouping?: BarGroupingMode;
  xAxis?: Axis;
  yAxis?: Axis;
  theme?: ChartTheme;
}

enum ChartOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

enum BarGroupingMode {
  GROUPED = 'grouped',
  STACKED = 'stacked',
}
```

#### Pie Chart

```typescript
class PieChartWidget {
  constructor(props: PieChartProps);
  
  setData(segments: PieSegment[]): void;
  
  render(ctx: RenderContext, x: number, y: number): void;
}

interface PieChartProps {
  width: number;
  height: number;
  segments: PieSegment[];
  donut?: boolean;
  donutRadius?: number;
  theme?: ChartTheme;
}

interface PieSegment {
  id: string;
  label: string;
  value: number;
  color?: Color;
  explode?: boolean;
}
```

#### Gauge

```typescript
class GaugeWidget {
  constructor(props: GaugeProps);
  
  setValue(value: number): void;
  setRange(min: number, max: number): void;
  
  render(ctx: RenderContext, x: number, y: number): void;
}

interface GaugeProps {
  width: number;
  height: number;
  value: number;
  min?: number;
  max?: number;
  label?: string;
  thresholds?: GaugeThreshold[];
  theme?: ChartTheme;
}

interface GaugeThreshold {
  value: number;
  color: Color;
}
```

#### Sparkline

```typescript
class SparklineWidget {
  constructor(props: SparklineProps);
  
  pushValue(value: number): void;
  setData(values: number[]): void;
  
  render(ctx: RenderContext, x: number, y: number): void;
}

interface SparklineProps {
  width: number;
  height: number;
  data: number[];
  color?: Color;
  fill?: boolean;
  min?: number;
  max?: number;
}
```

#### Table

```typescript
class TableWidget {
  constructor(props: TableProps);
  
  setData(rows: TableRow[]): void;
  setColumns(columns: TableColumn[]): void;
  
  sort(columnId: string, direction?: SortDirection): void;
  filter(predicate: (row: TableRow) => boolean): void;
  
  render(ctx: RenderContext, x: number, y: number): void;
  
  on(event: 'select', handler: (row: TableRow) => void): this;
  on(event: 'sort', handler: (column: TableColumn, direction: SortDirection) => void): this;
}

interface TableProps {
  width: number;
  height: number;
  columns: TableColumn[];
  rows: TableRow[];
  selectable?: boolean;
  sortable?: boolean;
  theme?: ChartTheme;
}

interface TableColumn {
  id: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  formatter?: (value: unknown) => string;
}

interface TableRow {
  id: string;
  cells: Record<string, unknown>;
  selected?: boolean;
}

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
```

### Canvas

#### `Canvas`

```typescript
class Canvas {
  constructor(width: number, height: number);
  
  // Drawing operations
  clear(): void;
  setPixel(x: number, y: number, char: string, styles?: CellStyles): void;
  drawText(text: string, x: number, y: number, styles?: CellStyles): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, char?: string): void;
  drawRect(x: number, y: number, width: number, height: number, options?: RectOptions): void;
  drawCircle(x: number, y: number, radius: number, options?: CircleOptions): void;
  
  // Clipping
  pushClip(x: number, y: number, width: number, height: number): void;
  popClip(): void;
  
  // Transformations
  pushTransform(transform: Transform): void;
  popTransform(): void;
  
  // Render to context
  render(ctx: RenderContext, x: number, y: number): void;
  
  // Export
  toBuffer(): ScreenBuffer;
}

interface Transform {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
}
```

### Scales

```typescript
abstract class Scale {
  abstract domain(min: number, max: number): this;
  abstract range(min: number, max: number): this;
  abstract scale(value: number): number;
  abstract invert(value: number): number;
  abstract ticks(count?: number): number[];
}

class LinearScale extends Scale {
  domain(min: number, max: number): this;
  range(min: number, max: number): this;
  scale(value: number): number;
  invert(value: number): number;
  ticks(count?: number): number[];
}

class LogScale extends Scale {
  domain(min: number, max: number): this;
  range(min: number, max: number): this;
  scale(value: number): number;
  invert(value: number): number;
  ticks(count?: number): number[];
  base(base: number): this;
}

class TimeScale extends Scale {
  domain(start: Date, end: Date): this;
  range(min: number, max: number): this;
  scale(date: Date): number;
  invert(value: number): Date;
  ticks(count?: number): Date[];
  format(formatter: (date: Date) => string): this;
}

class CategoryScale extends Scale {
  domain(categories: string[]): this;
  range(min: number, max: number): this;
  scale(category: string): number;
  invert(value: number): string;
  bandwidth(): number;
}
```

### Real-Time Data

#### `RealTimeDataManager`

```typescript
class RealTimeDataManager extends EventEmitter {
  constructor(config?: RealTimeDataManagerConfig);
  
  addSeries(id: string, options?: SeriesOptions): void;
  removeSeries(id: string): void;
  
  pushValue(seriesId: string, value: number, timestamp?: Date): void;
  pushValues(seriesId: string, values: DataPoint[]): void;
  
  getSeries(id: string): Series | undefined;
  getAllSeries(): Series[];
  
  setWindow(duration: number): void;
  
  on(event: 'data', handler: (seriesId: string, point: DataPoint) => void): this;
  on(event: 'update', handler: () => void): this;
}

interface RealTimeDataManagerConfig {
  windowSize?: number;
  maxPoints?: number;
  aggregation?: AggregationType;
}

enum AggregationType {
  NONE = 'none',
  AVERAGE = 'average',
  SUM = 'sum',
  MIN = 'min',
  MAX = 'max',
  FIRST = 'first',
  LAST = 'last',
}
```

### Animation

#### `AnimationManager`

```typescript
class AnimationManager extends EventEmitter {
  constructor();
  
  animate(
    from: number,
    to: number,
    duration: number,
    options?: AnimationConfig
  ): Animation;
  
  play(animation: Animation): void;
  pause(animation: Animation): void;
  stop(animation: Animation): void;
  
  on(event: 'frame', handler: (state: AnimationState) => void): this;
  on(event: 'complete', handler: (animation: Animation) => void): this;
}

interface AnimationConfig {
  easing?: EasingFunction;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

interface AnimationState {
  value: number;
  progress: number;
  elapsed: number;
}

type EasingFunction = (t: number) => number;

// Built-in easing functions
const Easing: {
  linear: EasingFunction;
  easeInQuad: EasingFunction;
  easeOutQuad: EasingFunction;
  easeInOutQuad: EasingFunction;
  easeInCubic: EasingFunction;
  easeOutCubic: EasingFunction;
  easeInOutCubic: EasingFunction;
  // ... more
};
```

---

## Type Definitions Summary

### Common Types

```typescript
// Geometry
interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Alignment
enum HorizontalAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Stretch = 'stretch',
}

enum VerticalAlignment {
  Top = 'top',
  Center = 'center',
  Bottom = 'bottom',
  Stretch = 'stretch',
}

interface Alignment {
  horizontal: HorizontalAlignment;
  vertical: VerticalAlignment;
}

// Constraints
interface Constraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

// Events
type EventHandler<T = void> = (event: T) => void;
type Unsubscribe = () => void;
```

This API reference covers all major modules and their public APIs. For more detailed examples and usage patterns, see the individual module documentation.