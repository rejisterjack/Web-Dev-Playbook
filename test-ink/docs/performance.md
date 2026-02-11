# Performance Guide

Comprehensive guide to optimizing TUI Framework applications for maximum performance and efficiency.

## Table of Contents

- [Introduction](#introduction)
- [Rendering Optimization](#rendering-optimization)
- [Event Handling Optimization](#event-handling-optimization)
- [Memory Management](#memory-management)
- [Layout Optimization](#layout-optimization)
- [Profiling and Debugging](#profiling-and-debugging)
- [Best Practices](#best-practices)

## Introduction

Performance is critical for terminal applications. The TUI Framework is designed for high performance, but understanding optimization techniques helps you build even faster applications.

### Performance Goals

- **60 FPS Rendering**: Smooth animations and interactions
- **Low Latency**: Immediate response to user input
- **Efficient Memory**: Minimal memory footprint
- **Fast Startup**: Quick application initialization

## Rendering Optimization

### Double Buffering

The framework uses double buffering by default:

```
┌──────────────┐     ┌──────────────┐
│  Back Buffer │────>│ Front Buffer │
│  (Drawing)   │     │  (Display)   │
└──────────────┘     └──────────────┘
       │                    │
       │      Swap          │
       │<───────────────────│
```

**Benefits:**
- No flickering during updates
- Only changed cells are written to terminal
- Reduced terminal I/O

### Differential Rendering

Only render what changed:

```typescript
// ✅ Good: Framework handles differential rendering automatically
const renderer = new Renderer();

// Draw to back buffer
const buffer = renderer.getBackBuffer();
const ctx = createRenderContext(buffer);
ctx.drawText('Hello', 0, 0);

// Render only diffs
await renderer.render();
```

### Dirty Region Tracking

Mark only changed regions:

```typescript
class OptimizedWidget implements Widget {
  private dirty = true;
  private dirtyRegion: Rect | undefined;
  
  setText(text: string) {
    this.text = text;
    this.dirty = true;
    this.dirtyRegion = { x: 0, y: 0, width: text.length, height: 1 };
  }
  
  render(ctx: RenderContext) {
    if (!this.dirty) return;
    
    // Only clear dirty region
    if (this.dirtyRegion) {
      ctx.clearRect(this.dirtyRegion);
    }
    
    // Draw
    ctx.drawText(this.text, 0, 0);
    
    this.dirty = false;
  }
}
```

### Batched Updates

Batch multiple changes into single render:

```typescript
// ❌ Bad: Multiple renders
widget1.update();
await renderer.render();
widget2.update();
await renderer.render();
widget3.update();
await renderer.render();

// ✅ Good: Single render
widget1.update();
widget2.update();
widget3.update();
await renderer.render();
```

### Frame Rate Control

Limit rendering to target FPS:

```typescript
class RenderLoop {
  private targetFps = 60;
  private frameInterval = 1000 / 60;
  private lastFrameTime = 0;
  
  async loop() {
    while (this.running) {
      const now = performance.now();
      const elapsed = now - this.lastFrameTime;
      
      if (elapsed >= this.frameInterval) {
        this.render();
        this.lastFrameTime = now - (elapsed % this.frameInterval);
      }
      
      // Small delay to prevent busy-waiting
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }
}
```

### Skip Unnecessary Renders

```typescript
class SmartRenderer {
  private lastRender = 0;
  private pendingRender = false;
  
  requestRender() {
    if (this.pendingRender) return;
    
    this.pendingRender = true;
    
    requestAnimationFrame(() => {
      this.pendingRender = false;
      this.render();
    });
  }
  
  shouldRender(): boolean {
    // Skip if nothing changed
    if (!this.hasChanges()) return false;
    
    // Skip if too soon (throttle)
    const now = Date.now();
    if (now - this.lastRender < 16) return false;
    
    return true;
  }
}
```

### Optimize Drawing Operations

```typescript
// ❌ Bad: Draw character by character
for (let i = 0; i < text.length; i++) {
  ctx.drawText(text[i], x + i, y);
}

// ✅ Good: Draw entire string at once
ctx.drawText(text, x, y);

// ❌ Bad: Clear entire screen
ctx.clear();

// ✅ Good: Clear only changed regions
ctx.clearRect(dirtyRegion);
```

## Event Handling Optimization

### Debouncing

Prevent excessive handler calls:

```typescript
import { debounce } from 'tui-framework';

// Debounced resize handler
const handleResize = debounce((size: TerminalSize) => {
  updateLayout(size);
  render();
}, 100);

eventLoop.on('resize', handleResize);

// Debounced search
const searchInput = new TextInput({
  onChange: debounce((value) => {
    performSearch(value);
  }, 300),
});
```

### Throttling

Limit handler execution rate:

```typescript
import { throttle } from 'tui-framework';

// Throttled mouse tracking
const updateCursor = throttle((x: number, y: number) => {
  drawCursor(x, y);
}, 50); // Max 20 updates per second

eventLoop.on('mouse', (event) => {
  if (event.action === MouseAction.MOVE) {
    updateCursor(event.x, event.y);
  }
});

// Throttled scroll
const loadMore = throttle(() => {
  fetchMoreItems();
}, 200);
```

### Event Priority

Use appropriate priority levels:

```typescript
// High priority for critical events
eventLoop.emit({
  type: 'custom',
  name: 'critical-update',
  priority: EventPriority.HIGH,
  timestamp: Date.now(),
});

// Low priority for background updates
eventLoop.emit({
  type: 'custom',
  name: 'background-sync',
  priority: EventPriority.LOW,
  timestamp: Date.now(),
});
```

### Efficient Event Handlers

```typescript
// ❌ Bad: Expensive operations in handler
eventLoop.on('key', (event) => {
  if (event.key === 'enter') {
    // This blocks the event loop!
    const result = expensiveCalculation();
    updateUI(result);
  }
});

// ✅ Good: Offload expensive work
const taskManager = new TaskManager();

eventLoop.on('key', (event) => {
  if (event.key === 'enter') {
    taskManager.add('calculation', async () => {
      const result = await expensiveCalculation();
      updateUI(result);
    });
  }
});
```

## Memory Management

### Object Pooling

Reuse objects to reduce GC pressure:

```typescript
class CellPool {
  private pool: Cell[] = [];
  private maxSize = 1000;
  
  acquire(): Cell {
    return this.pool.pop() || createCell();
  }
  
  release(cell: Cell): void {
    if (this.pool.length < this.maxSize) {
      resetCell(cell);
      this.pool.push(cell);
    }
  }
}

// Usage
const pool = new CellPool();

function render() {
  const cell = pool.acquire();
  // Use cell...
  pool.release(cell);
}
```

### Buffer Reuse

```typescript
class BufferManager {
  private buffers: ScreenBuffer[] = [];
  
  acquire(width: number, height: number): ScreenBuffer {
    // Find suitable buffer
    const index = this.buffers.findIndex(
      (b) => b.width >= width && b.height >= height
    );
    
    if (index >= 0) {
      return this.buffers.splice(index, 1)[0];
    }
    
    return createBuffer(width, height);
  }
  
  release(buffer: ScreenBuffer): void {
    buffer.clear();
    this.buffers.push(buffer);
  }
}
```

### Lazy Initialization

```typescript
class LazyWidget {
  private _buffer?: ScreenBuffer;
  
  get buffer(): ScreenBuffer {
    if (!this._buffer) {
      this._buffer = createBuffer(this.width, this.height);
    }
    return this._buffer;
  }
  
  destroy() {
    this._buffer = undefined;
  }
}
```

### Weak References

```typescript
import { WeakRef } from 'tui-framework';

class Cache {
  private items = new Map<string, WeakRef<Widget>>();
  
  get(id: string): Widget | undefined {
    const ref = this.items.get(id);
    return ref?.deref();
  }
  
  set(id: string, widget: Widget): void {
    this.items.set(id, new WeakRef(widget));
  }
}
```

### Cleanup Resources

```typescript
class ResourceManager {
  private resources: (() => void)[] = [];
  
  add(cleanup: () => void): void {
    this.resources.push(cleanup);
  }
  
  dispose(): void {
    for (const cleanup of this.resources) {
      cleanup();
    }
    this.resources = [];
  }
}

// Usage
const resources = new ResourceManager();

const widget = new Widget();
resources.add(() => widget.destroy());

const interval = setInterval(tick, 1000);
resources.add(() => clearInterval(interval));

// Clean up everything
resources.dispose();
```

## Layout Optimization

### Layout Caching

```typescript
class CachedLayoutEngine extends LayoutEngine {
  private cache = new Map<string, ComputedLayout>();
  
  calculateLayout(root: LayoutNode, constraints: Constraints): void {
    const key = this.getCacheKey(root, constraints);
    
    if (this.cache.has(key)) {
      root.setComputedLayout(this.cache.get(key)!);
      return;
    }
    
    super.calculateLayout(root, constraints);
    this.cache.set(key, root.getComputedLayout());
  }
  
  invalidate(node?: LayoutNode): void {
    if (node) {
      // Invalidate specific node
      for (const key of this.cache.keys()) {
        if (key.startsWith(node.id)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}
```

### Incremental Layout

```typescript
class IncrementalLayoutEngine {
  private dirtyNodes = new Set<LayoutNode>();
  
  markDirty(node: LayoutNode): void {
    this.dirtyNodes.add(node);
    
    // Mark parents
    let parent = node.getParent();
    while (parent) {
      this.dirtyNodes.add(parent);
      parent = parent.getParent();
    }
  }
  
  calculateLayout(): void {
    // Only recalculate dirty nodes
    for (const node of this.dirtyNodes) {
      this.calculateNode(node);
    }
    
    this.dirtyNodes.clear();
  }
}
```

### Layout Throttling

```typescript
class ThrottledLayout {
  private pending = false;
  
  requestLayout(): void {
    if (this.pending) return;
    
    this.pending = true;
    
    requestAnimationFrame(() => {
      this.pending = false;
      this.calculateLayout();
    });
  }
}
```

### Avoid Deep Nesting

```typescript
// ❌ Bad: Deep nesting
const layout = column({
  children: [
    row({
      children: [
        column({
          children: [
            row({
              children: [
                // Too deep!
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

// ✅ Good: Flatten when possible
const layout = column({
  children: [
    header,
    content,
    footer,
  ],
});
```

## Profiling and Debugging

### Performance Metrics

```typescript
class PerformanceMonitor {
  private metrics = {
    frameTime: [] as number[],
    renderTime: [] as number[],
    layoutTime: [] as number[],
    eventTime: [] as number[],
  };
  
  measureFrame(fn: () => void): void {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    this.metrics.frameTime.push(end - start);
    
    // Keep only last 100 measurements
    if (this.metrics.frameTime.length > 100) {
      this.metrics.frameTime.shift();
    }
  }
  
  getAverageFrameTime(): number {
    const sum = this.metrics.frameTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.frameTime.length;
  }
  
  getFps(): number {
    const avgFrameTime = this.getAverageFrameTime();
    return 1000 / avgFrameTime;
  }
  
  report(): void {
    console.log('Performance Report:');
    console.log(`  FPS: ${this.getFps().toFixed(1)}`);
    console.log(`  Avg Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms`);
    console.log(`  Min Frame Time: ${Math.min(...this.metrics.frameTime).toFixed(2)}ms`);
    console.log(`  Max Frame Time: ${Math.max(...this.metrics.frameTime).toFixed(2)}ms`);
  }
}

// Usage
const monitor = new PerformanceMonitor();

function render() {
  monitor.measureFrame(() => {
    // Rendering code
  });
}

// Report every 5 seconds
setInterval(() => monitor.report(), 5000);
```

### Memory Profiling

```typescript
class MemoryProfiler {
  private snapshots: number[] = [];
  
  snapshot(): void {
    if (global.gc) {
      global.gc(); // Force garbage collection if available
    }
    
    const usage = process.memoryUsage();
    this.snapshots.push(usage.heapUsed);
  }
  
  report(): void {
    const current = process.memoryUsage();
    
    console.log('Memory Usage:');
    console.log(`  RSS: ${this.formatBytes(current.rss)}`);
    console.log(`  Heap Used: ${this.formatBytes(current.heapUsed)}`);
    console.log(`  Heap Total: ${this.formatBytes(current.heapTotal)}`);
    console.log(`  External: ${this.formatBytes(current.external)}`);
    
    if (this.snapshots.length > 1) {
      const first = this.snapshots[0];
      const last = this.snapshots[this.snapshots.length - 1];
      const growth = last - first;
      
      console.log(`  Growth: ${this.formatBytes(growth)}`);
    }
  }
  
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
```

### Render Statistics

```typescript
class RenderStats {
  frameCount = 0;
  cellChanges = 0;
  ansiSequences = 0;
  lastReport = Date.now();
  
  recordFrame(changes: number, sequences: number): void {
    this.frameCount++;
    this.cellChanges += changes;
    this.ansiSequences += sequences;
    
    const now = Date.now();
    if (now - this.lastReport >= 1000) {
      this.report();
      this.reset();
      this.lastReport = now;
    }
  }
  
  report(): void {
    console.log('Render Stats (last second):');
    console.log(`  Frames: ${this.frameCount}`);
    console.log(`  Cell Changes: ${this.cellChanges}`);
    console.log(`  ANSI Sequences: ${this.ansiSequences}`);
    console.log(`  Avg Changes/Frame: ${(this.cellChanges / this.frameCount).toFixed(1)}`);
  }
  
  reset(): void {
    this.frameCount = 0;
    this.cellChanges = 0;
    this.ansiSequences = 0;
  }
}
```

### Benchmarking

```typescript
class Benchmark {
  static async run(name: string, fn: () => void, iterations = 1000): Promise<void> {
    // Warm up
    for (let i = 0; i < 10; i++) {
      fn();
    }
    
    // Measure
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    // Report
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    console.log(`Benchmark: ${name}`);
    console.log(`  Iterations: ${iterations}`);
    console.log(`  Average: ${avg.toFixed(3)}ms`);
    console.log(`  Min: ${min.toFixed(3)}ms`);
    console.log(`  Max: ${max.toFixed(3)}ms`);
    console.log(`  Total: ${(avg * iterations).toFixed(2)}ms`);
  }
}

// Usage
Benchmark.run('render', () => {
  renderer.render();
}, 100);
```

## Best Practices

### 1. Minimize Terminal Output

```typescript
// ❌ Bad: Write each cell separately
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    process.stdout.write(ANSI.moveCursor(x, y));
    process.stdout.write(cell.char);
  }
}

// ✅ Good: Batch writes
let output = '';
for (let y = 0; y < height; y++) {
  output += ANSI.moveCursor(0, y);
  for (let x = 0; x < width; x++) {
    output += cells[y][x].char;
  }
}
process.stdout.write(output);
```

### 2. Use Request Animation Frame

```typescript
// ❌ Bad: Render immediately
function update() {
  render();
}

// ✅ Good: Batch renders
function update() {
  requestAnimationFrame(render);
}
```

### 3. Avoid Memory Allocations in Hot Paths

```typescript
// ❌ Bad: Allocates in render loop
render() {
  const cells = []; // New array every frame
  // ...
}

// ✅ Good: Reuse arrays
private cells: Cell[] = [];

render() {
  this.cells.length = 0; // Clear without reallocating
  // ...
}
```

### 4. Profile Before Optimizing

```typescript
// Measure first
const start = performance.now();
// Code to measure
const end = performance.now();
console.log(`Time: ${end - start}ms`);

// Then optimize if needed
```

### 5. Use Worker Threads for Heavy Work

```typescript
import { TaskWorker } from 'tui-framework';

const worker = new TaskWorker('./heavy-task.js');

// Offload heavy computation
eventLoop.on('key', async (event) => {
  if (event.key === 'enter') {
    const result = await worker.execute(() => {
      // Heavy calculation
      return heavyCalculation();
    });
    
    updateUI(result);
  }
});
```

### 6. Implement Virtual Scrolling

```typescript
class VirtualList {
  private itemHeight = 1;
  private viewportHeight = 10;
  private scrollOffset = 0;
  
  render(ctx: RenderContext) {
    const startIndex = Math.floor(this.scrollOffset / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.viewportHeight + 1,
      this.items.length
    );
    
    // Only render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const y = (i * this.itemHeight) - this.scrollOffset;
      this.renderItem(ctx, this.items[i], 0, y);
    }
  }
}
```

### 7. Cache Computed Values

```typescript
class CachedWidget {
  private cachedBounds?: Rect;
  private boundsDirty = true;
  
  getBounds(): Rect {
    if (this.boundsDirty) {
      this.cachedBounds = this.calculateBounds();
      this.boundsDirty = false;
    }
    return this.cachedBounds!;
  }
  
  markBoundsDirty() {
    this.boundsDirty = true;
  }
}
```

### 8. Use Efficient Data Structures

```typescript
// ❌ Bad: Linear search
findItem(id: string) {
  return this.items.find((item) => item.id === id);
}

// ✅ Good: Map lookup
private itemMap = new Map<string, Item>();

findItem(id: string) {
  return this.itemMap.get(id);
}
```

This guide covers essential performance optimization techniques for the TUI Framework. Remember to measure before optimizing and focus on real bottlenecks rather than premature optimization.