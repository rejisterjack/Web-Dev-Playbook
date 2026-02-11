# Advanced Topics

Advanced patterns, techniques, and features for building sophisticated TUI applications.

## Table of Contents

- [Custom Rendering](#custom-rendering)
- [Plugin System](#plugin-system)
- [Worker Threads](#worker-threads)
- [Real-time Data](#real-time-data)
- [Advanced Patterns](#advanced-patterns)
- [Integration Patterns](#integration-patterns)

## Custom Rendering

### Custom Renderers

Create specialized renderers for specific use cases:

```typescript
import { Renderer, RenderContext, ScreenBuffer } from 'tui-framework';

class BufferedRenderer extends Renderer {
  private bufferQueue: ScreenBuffer[] = [];
  private maxBufferSize = 3;
  
  async render(): Promise<void> {
    // Add current buffer to queue
    this.bufferQueue.push(this.getBackBuffer().clone());
    
    // Limit queue size
    if (this.bufferQueue.length > this.maxBufferSize) {
      this.bufferQueue.shift();
    }
    
    return super.render();
  }
  
  // Rewind to previous frame
  rewind(steps = 1): void {
    const buffer = this.bufferQueue[this.bufferQueue.length - 1 - steps];
    if (buffer) {
      this.getBackBuffer().copyFrom(buffer);
    }
  }
}
```

### Custom Drawing Primitives

```typescript
// Draw a circle using Bresenham's algorithm
function drawCircle(
  ctx: RenderContext,
  centerX: number,
  centerY: number,
  radius: number,
  char = '●'
) {
  let x = 0;
  let y = radius;
  let d = 3 - 2 * radius;
  
  while (y >= x) {
    // Draw 8 octants
    ctx.drawText(char, centerX + x, centerY + y);
    ctx.drawText(char, centerX - x, centerY + y);
    ctx.drawText(char, centerX + x, centerY - y);
    ctx.drawText(char, centerX - x, centerY - y);
    ctx.drawText(char, centerX + y, centerY + x);
    ctx.drawText(char, centerX - y, centerY + x);
    ctx.drawText(char, centerX + y, centerY - x);
    ctx.drawText(char, centerX - y, centerY - x);
    
    x++;
    
    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
  }
}

// Draw bezier curve
function drawBezierCurve(
  ctx: RenderContext,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  steps = 100
) {
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cubicBezier(t, p0.x, p1.x, p2.x, p3.x);
    const y = cubicBezier(t, p0.y, p1.y, p2.y, p3.y);
    ctx.drawText('·', Math.round(x), Math.round(y));
  }
}

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}
```

### Shader-like Effects

```typescript
// Gradient fill effect
function gradientFill(
  ctx: RenderContext,
  x: number,
  y: number,
  width: number,
  height: number,
  startColor: Color,
  endColor: Color,
  direction: 'horizontal' | 'vertical' = 'horizontal'
) {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const ratio = direction === 'horizontal'
        ? col / width
        : row / height;
      
      const color = mixColors(startColor, endColor, ratio);
      
      ctx.drawText(' ', x + col, y + row, {
        bg: color,
      });
    }
  }
}

// Noise texture
function noiseFill(
  ctx: RenderContext,
  x: number,
  y: number,
  width: number,
  height: number,
  density = 0.1
) {
  const chars = ['·', '∙', '•'];
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (Math.random() < density) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.drawText(char, x + col, y + row, {
          fg: { rgb: [100, 100, 100] },
        });
      }
    }
  }
}
```

### Custom Cell Rendering

```typescript
// Unicode box drawing with custom styles
const boxDrawingChars = {
  single: {
    horizontal: '─',
    vertical: '│',
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    cross: '┼',
    tDown: '┬',
    tUp: '┴',
    tRight: '├',
    tLeft: '┤',
  },
  double: {
    horizontal: '═',
    vertical: '║',
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    cross: '╬',
    tDown: '╦',
    tUp: '╩',
    tRight: '╠',
    tLeft: '╣',
  },
  round: {
    horizontal: '─',
    vertical: '│',
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    cross: '┼',
    tDown: '┬',
    tUp: '┴',
    tRight: '├',
    tLeft: '┤',
  },
};

function drawStyledBox(
  ctx: RenderContext,
  x: number,
  y: number,
  width: number,
  height: number,
  style: keyof typeof boxDrawingChars,
  color?: Color
) {
  const chars = boxDrawingChars[style];
  
  // Draw corners
  ctx.drawText(chars.topLeft, x, y, { fg: color });
  ctx.drawText(chars.topRight, x + width - 1, y, { fg: color });
  ctx.drawText(chars.bottomLeft, x, y + height - 1, { fg: color });
  ctx.drawText(chars.bottomRight, x + width - 1, y + height - 1, { fg: color });
  
  // Draw edges
  for (let i = 1; i < width - 1; i++) {
    ctx.drawText(chars.horizontal, x + i, y, { fg: color });
    ctx.drawText(chars.horizontal, x + i, y + height - 1, { fg: color });
  }
  
  for (let i = 1; i < height - 1; i++) {
    ctx.drawText(chars.vertical, x, y + i, { fg: color });
    ctx.drawText(chars.vertical, x + width - 1, y + i, { fg: color });
  }
}
```

## Plugin System

### Plugin Architecture

```typescript
// Plugin interface
interface Plugin {
  name: string;
  version: string;
  
  // Lifecycle
  initialize(app: Application): void;
  destroy(): void;
  
  // Hooks
  beforeRender?(ctx: RenderContext): void;
  afterRender?(ctx: RenderContext): void;
  onKey?(event: KeyEvent): boolean;
  onMouse?(event: MouseEvent): boolean;
}

// Plugin manager
class PluginManager {
  private plugins: Plugin[] = [];
  private hooks = new Map<string, Set<Function>>();
  
  register(plugin: Plugin): void {
    this.plugins.push(plugin);
    plugin.initialize(this.app);
    
    // Register hooks
    if (plugin.beforeRender) {
      this.addHook('beforeRender', plugin.beforeRender.bind(plugin));
    }
    if (plugin.afterRender) {
      this.addHook('afterRender', plugin.afterRender.bind(plugin));
    }
  }
  
  unregister(plugin: Plugin): void {
    const index = this.plugins.indexOf(plugin);
    if (index >= 0) {
      plugin.destroy();
      this.plugins.splice(index, 1);
    }
  }
  
  addHook(name: string, fn: Function): void {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, new Set());
    }
    this.hooks.get(name)!.add(fn);
  }
  
  async runHook(name: string, ...args: any[]): Promise<void> {
    const hooks = this.hooks.get(name);
    if (hooks) {
      for (const hook of hooks) {
        await hook(...args);
      }
    }
  }
}
```

### Creating a Plugin

```typescript
// Example: Status Bar Plugin
class StatusBarPlugin implements Plugin {
  name = 'status-bar';
  version = '1.0.0';
  
  private statusBar: StatusBar;
  
  initialize(app: Application): void {
    this.statusBar = new StatusBar();
    app.addWidget(this.statusBar, { position: 'bottom' });
  }
  
  destroy(): void {
    this.statusBar.destroy();
  }
  
  beforeRender(ctx: RenderContext): void {
    this.statusBar.update();
  }
}

// Example: Vim Keybindings Plugin
class VimPlugin implements Plugin {
  name = 'vim-bindings';
  version = '1.0.0';
  
  private mode: 'normal' | 'insert' | 'visual' = 'normal';
  private keyBuffer: string[] = [];
  
  initialize(app: Application): void {
    // Register vim keybindings
  }
  
  destroy(): void {
    // Cleanup
  }
  
  onKey(event: KeyEvent): boolean {
    switch (this.mode) {
      case 'normal':
        return this.handleNormalMode(event);
      case 'insert':
        return this.handleInsertMode(event);
      case 'visual':
        return this.handleVisualMode(event);
    }
  }
  
  private handleNormalMode(event: KeyEvent): boolean {
    this.keyBuffer.push(event.key);
    
    // Check for commands
    const command = this.keyBuffer.join('');
    
    if (command === 'gg') {
      this.goToTop();
      this.keyBuffer = [];
      return true;
    }
    
    if (command === 'dd') {
      this.deleteLine();
      this.keyBuffer = [];
      return true;
    }
    
    if (command === 'i') {
      this.setMode('insert');
      this.keyBuffer = [];
      return true;
    }
    
    // Keep buffering or clear
    if (this.keyBuffer.length >= 2) {
      this.keyBuffer = [];
    }
    
    return false;
  }
}
```

### Plugin Configuration

```typescript
interface PluginConfig {
  name: string;
  enabled: boolean;
  options?: Record<string, unknown>;
}

class ConfigurablePluginManager extends PluginManager {
  private config: PluginConfig[] = [];
  
  loadConfig(configPath: string): void {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    for (const pluginConfig of this.config) {
      if (pluginConfig.enabled) {
        this.loadPlugin(pluginConfig.name, pluginConfig.options);
      }
    }
  }
  
  private loadPlugin(name: string, options?: Record<string, unknown>): void {
    const pluginModule = require(`tui-plugin-${name}`);
    const plugin = new pluginModule.default(options);
    this.register(plugin);
  }
}
```

## Worker Threads

### Worker Pool

```typescript
import { Worker } from 'worker_threads';
import os from 'os';

class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    task: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = [];
  private activeWorkers = 0;
  
  constructor(private maxWorkers = os.cpus().length) {}
  
  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }
  
  private processQueue(): void {
    if (this.queue.length === 0) return;
    if (this.activeWorkers >= this.maxWorkers) return;
    
    const { task, resolve, reject } = this.queue.shift()!;
    
    this.activeWorkers++;
    
    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.activeWorkers--;
        this.processQueue();
      });
  }
  
  terminate(): Promise<void[]> {
    return Promise.all(this.workers.map((w) => w.terminate()));
  }
}
```

### Offloading Heavy Computation

```typescript
// main.ts
import { TaskWorker } from 'tui-framework';

const worker = new TaskWorker('./workers/data-processor.js');

class DataVisualization implements Widget {
  private data: number[] = [];
  private processing = false;
  
  async loadData(filePath: string) {
    this.processing = true;
    
    // Offload to worker
    const result = await worker.execute({
      task: 'processData',
      filePath,
    });
    
    this.data = result.data;
    this.processing = false;
    this.render();
  }
  
  render(ctx: RenderContext) {
    if (this.processing) {
      ctx.drawText('Processing...', 0, 0);
    } else {
      this.chart.render(ctx, this.data);
    }
  }
}

// workers/data-processor.js
const { parentPort } = require('worker_threads');
const fs = require('fs');

parentPort.on('message', async ({ task, filePath }) => {
  if (task === 'processData') {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const lines = rawData.split('\n');
    
    // Heavy processing
    const processed = lines
      .map((line) => parseFloat(line))
      .filter((n) => !isNaN(n))
      .map((n) => n * 1000); // Some transformation
    
    parentPort.postMessage({ data: processed });
  }
});
```

### Parallel Processing

```typescript
class ParallelProcessor {
  private pool: WorkerPool;
  
  constructor() {
    this.pool = new WorkerPool();
  }
  
  async processItems<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const promises = items.map((item) =>
      this.pool.execute(() => processor(item))
    );
    
    return Promise.all(promises);
  }
  
  async mapReduce<T, M, R>(
    items: T[],
    mapper: (item: T) => Promise<M>,
    reducer: (results: M[]) => R
  ): Promise<R> {
    const mapped = await this.processItems(items, mapper);
    return reducer(mapped);
  }
}

// Usage
const processor = new ParallelProcessor();

const results = await processor.processItems(
  largeDataset,
  async (item) => {
    // Expensive operation
    return await expensiveTransform(item);
  }
);
```

## Real-time Data

### Real-time Data Manager

```typescript
import { RealTimeDataManager, AggregationType } from 'tui-framework';

const dataManager = new RealTimeDataManager({
  windowSize: 1000,      // Keep last 1000 points
  maxPoints: 10000,      // Maximum points per series
  aggregation: AggregationType.AVERAGE,
});

// Add series
dataManager.addSeries('cpu', {
  color: { rgb: [0, 255, 0] },
  label: 'CPU Usage',
});

dataManager.addSeries('memory', {
  color: { rgb: [0, 0, 255] },
  label: 'Memory Usage',
});

// Push data
dataManager.pushValue('cpu', 45.2);
dataManager.pushValue('cpu', 46.8);
dataManager.pushValue('memory', 62.5);

// Get data for rendering
const cpuData = dataManager.getSeries('cpu');
```

### WebSocket Integration

```typescript
class RealTimeDashboard implements Widget {
  private ws?: WebSocket;
  private dataManager: RealTimeDataManager;
  private reconnectInterval = 5000;
  
  connect(url: string): void {
    this.ws = new WebSocket(url);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleData(data);
    };
    
    this.ws.onclose = () => {
      setTimeout(() => this.connect(url), this.reconnectInterval);
    };
  }
  
  private handleData(data: DataPoint): void {
    this.dataManager.pushValue(data.series, data.value, new Date(data.timestamp));
    this.requestRender();
  }
  
  render(ctx: RenderContext): void {
    const series = this.dataManager.getAllSeries();
    
    for (const s of series) {
      this.renderSparkline(ctx, s);
    }
  }
}
```

### Data Streaming

```typescript
class DataStream implements Widget {
  private buffer: DataPoint[] = [];
  private maxBufferSize = 1000;
  private streaming = false;
  
  startStream(source: ReadableStream): void {
    this.streaming = true;
    const reader = source.getReader();
    
    const processChunk = async () => {
      while (this.streaming) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        this.buffer.push(value);
        
        // Limit buffer size
        if (this.buffer.length > this.maxBufferSize) {
          this.buffer.shift();
        }
        
        this.requestRender();
      }
    };
    
    processChunk();
  }
  
  stopStream(): void {
    this.streaming = false;
  }
  
  render(ctx: RenderContext): void {
    // Render buffered data
    this.chart.render(ctx, this.buffer);
  }
}
```

### Throttled Updates

```typescript
class ThrottledDataWidget implements Widget {
  private data: DataPoint[] = [];
  private pendingData: DataPoint[] = [];
  private throttledRender: () => void;
  
  constructor() {
    // Limit renders to 30fps
    this.throttledRender = throttle(() => {
      this.data.push(...this.pendingData);
      this.pendingData = [];
      this.render();
    }, 33);
  }
  
  addData(point: DataPoint): void {
    this.pendingData.push(point);
    this.throttledRender();
  }
}
```

## Advanced Patterns

### State Machine

```typescript
type State = 'idle' | 'loading' | 'loaded' | 'error';

type Event = 
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: unknown }
  | { type: 'ERROR'; error: Error }
  | { type: 'RETRY' };

class StateMachineWidget implements Widget {
  private state: State = 'idle';
  private context = { data: null, error: null };
  
  private transitions: Record<State, Partial<Record<Event['type'], State>>> = {
    idle: { FETCH: 'loading' },
    loading: { SUCCESS: 'loaded', ERROR: 'error' },
    loaded: { FETCH: 'loading' },
    error: { RETRY: 'loading', FETCH: 'loading' },
  };
  
  dispatch(event: Event): void {
    const nextState = this.transitions[this.state][event.type];
    
    if (nextState) {
      this.exitState(this.state);
      this.state = nextState;
      this.enterState(this.state, event);
    }
  }
  
  private enterState(state: State, event: Event): void {
    switch (state) {
      case 'loading':
        this.startLoading();
        break;
      case 'loaded':
        if (event.type === 'SUCCESS') {
          this.context.data = event.data;
        }
        break;
      case 'error':
        if (event.type === 'ERROR') {
          this.context.error = event.error;
        }
        break;
    }
    
    this.render();
  }
  
  private exitState(state: State): void {
    // Cleanup
  }
  
  render(ctx: RenderContext): void {
    switch (this.state) {
      case 'idle':
        ctx.drawText('Press Enter to load', 0, 0);
        break;
      case 'loading':
        ctx.drawText('Loading...', 0, 0);
        break;
      case 'loaded':
        ctx.drawText(`Data: ${this.context.data}`, 0, 0);
        break;
      case 'error':
        ctx.drawText(`Error: ${this.context.error}`, 0, 0);
        break;
    }
  }
}
```

### Command Pattern with Undo

```typescript
interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
}

class CommandHistory {
  private history: Command[] = [];
  private index = -1;
  private maxSize = 100;
  
  execute(command: Command): void {
    command.execute();
    
    // Remove any commands after current index
    this.history = this.history.slice(0, this.index + 1);
    
    // Add new command
    this.history.push(command);
    this.index++;
    
    // Limit history size
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.index--;
    }
  }
  
  undo(): void {
    if (this.index >= 0) {
      this.history[this.index].undo();
      this.index--;
    }
  }
  
  redo(): void {
    if (this.index < this.history.length - 1) {
      this.index++;
      this.history[this.index].redo();
    }
  }
  
  canUndo(): boolean {
    return this.index >= 0;
  }
  
  canRedo(): boolean {
    return this.index < this.history.length - 1;
  }
}

// Example commands
class InsertTextCommand implements Command {
  constructor(
    private document: Document,
    private position: number,
    private text: string
  ) {}
  
  execute(): void {
    this.document.insert(this.position, this.text);
  }
  
  undo(): void {
    this.document.delete(this.position, this.text.length);
  }
  
  redo(): void {
    this.execute();
  }
}
```

### Observer Pattern

```typescript
class Observable<T> {
  private observers: Set<(value: T) => void> = new Set();
  private value: T;
  
  constructor(initialValue: T) {
    this.value = initialValue;
  }
  
  get(): T {
    return this.value;
  }
  
  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }
  
  subscribe(observer: (value: T) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
  
  private notify(): void {
    this.observers.forEach((observer) => observer(this.value));
  }
}

// Usage
const counter = new Observable(0);

const unsubscribe = counter.subscribe((value) => {
  console.log('Counter:', value);
});

counter.set(1); // Logs: Counter: 1
counter.set(2); // Logs: Counter: 2

unsubscribe();
```

### Memoization

```typescript
function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// Usage
const expensiveCalculation = memoize((n: number) => {
  // Expensive computation
  return n * n;
});

expensiveCalculation(5); // Computes
expensiveCalculation(5); // Returns cached result
```

## Integration Patterns

### External API Integration

```typescript
class APIClientWidget implements Widget {
  private client: APIClient;
  private cache = new Map<string, unknown>();
  private loading = false;
  
  constructor(baseURL: string) {
    this.client = new APIClient(baseURL);
  }
  
  async fetchData(endpoint: string): Promise<unknown> {
    // Check cache
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }
    
    this.loading = true;
    this.render();
    
    try {
      const data = await this.client.get(endpoint);
      this.cache.set(endpoint, data);
      return data;
    } finally {
      this.loading = false;
      this.render();
    }
  }
  
  invalidateCache(endpoint?: string): void {
    if (endpoint) {
      this.cache.delete(endpoint);
    } else {
      this.cache.clear();
    }
  }
}
```

### File System Watcher

```typescript
class FileWatcherWidget implements Widget {
  private watcher?: FSWatcher;
  private files: string[] = [];
  
  watch(directory: string): void {
    this.watcher = watch(directory, (eventType, filename) => {
      if (eventType === 'rename') {
        this.updateFileList();
      }
    });
    
    this.updateFileList();
  }
  
  private async updateFileList(): Promise<void> {
    this.files = await readdir(this.directory);
    this.render();
  }
  
  unwatch(): void {
    this.watcher?.close();
  }
  
  render(ctx: RenderContext): void {
    for (let i = 0; i < this.files.length; i++) {
      ctx.drawText(this.files[i], 0, i);
    }
  }
}
```

### Database Integration

```typescript
class DatabaseWidget implements Widget {
  private db: Database;
  private queryResults: unknown[] = [];
  
  constructor(connectionString: string) {
    this.db = new Database(connectionString);
  }
  
  async query(sql: string, params?: unknown[]): Promise<void> {
    this.queryResults = await this.db.query(sql, params);
    this.render();
  }
  
  async transaction<T>(fn: (trx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(fn);
  }
  
  render(ctx: RenderContext): void {
    const table = new TableWidget({
      columns: this.getColumns(),
      rows: this.queryResults,
    });
    
    table.render(ctx, 0, 0);
  }
}
```

This guide covers advanced topics for building sophisticated TUI applications. For more information, see the [API Reference](api.md) and other documentation.