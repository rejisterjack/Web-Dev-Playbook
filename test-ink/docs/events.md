# Event Handling Guide

Comprehensive guide to the TUI Framework's event system, covering keyboard events, mouse events, custom events, and event handling patterns.

## Table of Contents

- [Introduction](#introduction)
- [Event System Overview](#event-system-overview)
- [Event Types](#event-types)
- [Event Loop](#event-loop)
- [Keyboard Events](#keyboard-events)
- [Mouse Events](#mouse-events)
- [Signal Events](#signal-events)
- [Custom Events](#custom-events)
- [Event Dispatch](#event-dispatch)
- [Event Handling Patterns](#event-handling-patterns)
- [Best Practices](#best-practices)

## Introduction

The TUI Framework provides a comprehensive event system that handles all types of terminal input including keyboard, mouse, resize signals, and custom application events.

### Key Features

- **Unified Event Queue**: All events flow through a centralized queue
- **Priority-based Processing**: Critical events are handled first
- **Event Bubbling**: Events propagate through the widget hierarchy
- **Debouncing/Throttling**: Built-in utilities for high-frequency events
- **Signal Handling**: Graceful handling of terminal signals

## Event System Overview

### Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Event Flow                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Terminal Input                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────┐                                            │
│  │Input Parser │  Parse escape sequences                    │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │ Event Queue │  Priority queue                            │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │ Dispatcher  │  Route to handlers                         │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ▼                                                   │
│  Widget Handlers                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Event Architecture

```typescript
// Base event interface
interface BaseEvent {
  type: string;
  timestamp: number;
  priority?: EventPriority;
  propagationStopped?: boolean;
  defaultPrevented?: boolean;
}

// Event priority levels
enum EventPriority {
  HIGH = 0,    // System events, signals
  NORMAL = 1,  // User input
  LOW = 2,     // Background updates
}
```

## Event Types

### Event Type Hierarchy

```typescript
type Event = 
  | KeyEvent
  | MouseEvent 
  | ResizeEvent
  | FocusEvent
  | PasteEvent
  | SignalEvent
  | IdleEvent
  | CustomEvent;
```

### Key Events

```typescript
interface KeyEvent extends BaseEvent {
  type: 'key';
  key: string;        // Key name ('a', 'enter', 'up', etc.)
  sequence: string;   // Raw escape sequence
  ctrl: boolean;      // Ctrl modifier
  alt: boolean;       // Alt/Meta modifier
  shift: boolean;     // Shift modifier
  code?: number;      // Character code
  repeat?: boolean;   // Key repeat
}

// Common key names:
// - Letters: 'a', 'b', 'c', ...
// - Numbers: '0', '1', '2', ...
// - Special: 'enter', 'return', 'tab', 'escape', 'backspace', 'delete'
// - Arrows: 'up', 'down', 'left', 'right'
// - Function: 'f1', 'f2', ..., 'f12'
// - Navigation: 'home', 'end', 'pageup', 'pagedown', 'insert'
```

### Mouse Events

```typescript
interface MouseEvent extends BaseEvent {
  type: 'mouse';
  action: MouseAction;
  button: MouseButton;
  x: number;          // Column (1-indexed)
  y: number;          // Row (1-indexed)
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  sequence: string;
}

enum MouseAction {
  PRESS = 'press',
  RELEASE = 'release',
  DRAG = 'drag',
  MOVE = 'move',
  SCROLL = 'scroll',
}

enum MouseButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  RELEASE = 3,
  SCROLL_UP = 4,
  SCROLL_DOWN = 5,
  SCROLL_LEFT = 6,
  SCROLL_RIGHT = 7,
}
```

### Resize Events

```typescript
interface ResizeEvent extends BaseEvent {
  type: 'resize';
  columns: number;
  rows: number;
  previousColumns: number;
  previousRows: number;
}
```

### Focus Events

```typescript
interface FocusEvent extends BaseEvent {
  type: 'focus';
  focusType: FocusType;
}

enum FocusType {
  GAINED = 'gained',
  LOST = 'lost',
}
```

### Paste Events

```typescript
interface PasteEvent extends BaseEvent {
  type: 'paste';
  text: string;
  length: number;
}
```

### Signal Events

```typescript
interface SignalEvent extends BaseEvent {
  type: 'signal';
  signal: SignalType;
}

enum SignalType {
  SIGWINCH = 'SIGWINCH',  // Terminal resized
  SIGINT = 'SIGINT',      // Ctrl+C
  SIGTERM = 'SIGTERM',    // Termination request
  SIGHUP = 'SIGHUP',      // Hang up
  SIGQUIT = 'SIGQUIT',    // Ctrl+\
  SIGTSTP = 'SIGTSTP',    // Ctrl+Z
  SIGCONT = 'SIGCONT',    // Continue after stop
}
```

### Idle Events

```typescript
interface IdleEvent extends BaseEvent {
  type: 'idle';
  idleTime: number;  // Milliseconds since last event
}
```

### Custom Events

```typescript
interface CustomEvent extends BaseEvent {
  type: 'custom';
  name: string;
  data: unknown;
}
```

## Event Loop

### Creating an Event Loop

```typescript
import { EventLoop } from 'tui-framework';

const eventLoop = new EventLoop({
  mouseSupport: true,        // Enable mouse tracking
  bracketedPaste: true,      // Enable paste detection
  handleSigint: true,        // Handle Ctrl+C
  stdin: process.stdin,      // Custom input stream
});
```

### Starting and Stopping

```typescript
// Start the event loop
await eventLoop.start();

// Check if running
if (eventLoop.isRunning()) {
  console.log('Event loop is active');
}

// Stop the event loop
eventLoop.stop();
```

### Event Listeners

```typescript
// Keyboard events
eventLoop.on('key', (event: KeyEvent) => {
  console.log('Key pressed:', event.key);
  console.log('Modifiers:', { ctrl: event.ctrl, alt: event.alt, shift: event.shift });
});

// Mouse events
eventLoop.on('mouse', (event: MouseEvent) => {
  console.log('Mouse:', event.action, 'at', event.x, event.y);
});

// Resize events
eventLoop.on('resize', (event: ResizeEvent) => {
  console.log(`Resized from ${event.previousColumns}x${event.previousRows} to ${event.columns}x${event.rows}`);
});

// Focus events
eventLoop.on('focus', (event: FocusEvent) => {
  console.log('Focus', event.focusType);
});

// Paste events
eventLoop.on('paste', (event: PasteEvent) => {
  console.log('Pasted text:', event.text);
});

// Signal events
eventLoop.on('signal', (event: SignalEvent) => {
  console.log('Signal received:', event.signal);
  
  if (event.signal === SignalType.SIGINT) {
    eventLoop.stop();
  }
});

// Custom events
eventLoop.on('custom', (event: CustomEvent) => {
  console.log('Custom event:', event.name, event.data);
});
```

### Emitting Events

```typescript
// Emit a custom event
eventLoop.emit({
  type: 'custom',
  name: 'data-loaded',
  data: { items: 42 },
  timestamp: Date.now(),
});

// Emit with priority
eventLoop.emit({
  type: 'custom',
  name: 'urgent-update',
  data: {},
  timestamp: Date.now(),
  priority: EventPriority.HIGH,
});
```

## Keyboard Events

### Key Names Reference

```typescript
// Character keys
const charKeys = ['a', 'b', 'c', 'A', 'B', 'C', '1', '2', '3'];

// Special keys
const specialKeys = [
  'return', 'enter',      // Enter/Return
  'tab',                  // Tab
  'escape', 'esc',        // Escape
  'backspace',            // Backspace
  'delete', 'del',        // Delete
  'space',                // Space
];

// Arrow keys
const arrowKeys = ['up', 'down', 'left', 'right'];

// Function keys
const functionKeys = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 
                      'f7', 'f8', 'f9', 'f10', 'f11', 'f12'];

// Navigation keys
const navKeys = ['home', 'end', 'pageup', 'pagedown', 'insert'];
```

### Modifier Combinations

```typescript
eventLoop.on('key', (event) => {
  // Ctrl+C
  if (event.key === 'c' && event.ctrl) {
    console.log('Copy');
  }
  
  // Ctrl+V
  if (event.key === 'v' && event.ctrl) {
    console.log('Paste');
  }
  
  // Alt+F4
  if (event.key === 'f4' && event.alt) {
    console.log('Close');
  }
  
  // Shift+Tab
  if (event.key === 'tab' && event.shift) {
    console.log('Previous');
  }
  
  // Ctrl+Shift+N
  if (event.key === 'n' && event.ctrl && event.shift) {
    console.log('New Window');
  }
});
```

### Key Event Patterns

```typescript
// Pattern 1: Simple key handling
class SimpleHandler {
  onKey(event: KeyEvent): boolean {
    switch (event.key) {
      case 'q':
        if (event.ctrl) {
          this.quit();
          return true;
        }
        break;
        
      case 'escape':
        this.cancel();
        return true;
        
      case 'up':
        this.moveUp();
        return true;
        
      case 'down':
        this.moveDown();
        return true;
    }
    
    return false; // Not handled
  }
}

// Pattern 2: Mode-based handling
class ModeHandler {
  private mode: 'normal' | 'insert' | 'command' = 'normal';
  
  onKey(event: KeyEvent): boolean {
    switch (this.mode) {
      case 'normal':
        return this.handleNormalMode(event);
      case 'insert':
        return this.handleInsertMode(event);
      case 'command':
        return this.handleCommandMode(event);
    }
  }
  
  private handleNormalMode(event: KeyEvent): boolean {
    switch (event.key) {
      case 'i':
        this.setMode('insert');
        return true;
      case ':':
        this.setMode('command');
        return true;
    }
    return false;
  }
}

// Pattern 3: Chord handling
class ChordHandler {
  private chord: string[] = [];
  
  onKey(event: KeyEvent): boolean {
    this.chord.push(event.key);
    
    // Check for complete chord
    const chord = this.chord.join(' ');
    
    switch (chord) {
      case 'g g':
        this.goToTop();
        this.chord = [];
        return true;
        
      case 'd d':
        this.deleteLine();
        this.chord = [];
        return true;
        
      case 'g':
        // Wait for next key
        return true;
        
      default:
        // Unknown chord, reset
        this.chord = [];
        return false;
    }
  }
}
```

### Key Bindings

```typescript
import { KeyBindings } from 'tui-framework';

const bindings = new KeyBindings();

// Register key bindings
bindings.register({
  id: 'quit',
  chords: { key: 'q', ctrl: true },
  callback: () => {
    console.log('Quitting...');
    eventLoop.stop();
  },
  description: 'Quit application',
});

bindings.register({
  id: 'save',
  chords: { key: 's', ctrl: true },
  callback: () => console.log('Saving...'),
  description: 'Save file',
});

// Multi-key chord
bindings.register({
  id: 'goto-line',
  chords: [
    { key: 'g' },
    { key: 'g' },
  ],
  callback: () => console.log('Go to top'),
  description: 'Go to first line',
});

// Handle events
loop.on('key', (event) => {
  if (!bindings.handle(event)) {
    // Event not handled by any binding
    console.log('Unhandled:', event.key);
  }
});

// Get all bindings
const allBindings = bindings.getBindings();
console.log('Available shortcuts:');
allBindings.forEach((binding) => {
  console.log(`${binding.id}: ${binding.description}`);
});
```

## Mouse Events

### Enabling Mouse Support

```typescript
const eventLoop = new EventLoop({
  mouseSupport: true,
});

// Check if mouse is supported
if (eventLoop.isMouseSupported()) {
  console.log('Mouse tracking enabled');
}
```

### Mouse Event Handling

```typescript
eventLoop.on('mouse', (event) => {
  switch (event.action) {
    case MouseAction.PRESS:
      handleMousePress(event);
      break;
      
    case MouseAction.RELEASE:
      handleMouseRelease(event);
      break;
      
    case MouseAction.DRAG:
      handleMouseDrag(event);
      break;
      
    case MouseAction.MOVE:
      handleMouseMove(event);
      break;
      
    case MouseAction.SCROLL:
      handleMouseScroll(event);
      break;
  }
});

function handleMousePress(event: MouseEvent) {
  switch (event.button) {
    case MouseButton.LEFT:
      console.log('Left click at', event.x, event.y);
      break;
      
    case MouseButton.RIGHT:
      console.log('Right click at', event.x, event.y);
      break;
      
    case MouseButton.MIDDLE:
      console.log('Middle click at', event.x, event.y);
      break;
  }
}

function handleMouseScroll(event: MouseEvent) {
  switch (event.button) {
    case MouseButton.SCROLL_UP:
      console.log('Scroll up');
      break;
      
    case MouseButton.SCROLL_DOWN:
      console.log('Scroll down');
      break;
  }
}
```

### Click Detection

```typescript
class ClickDetector {
  private lastClick = { x: 0, y: 0, time: 0, count: 0 };
  
  onMouse(event: MouseEvent) {
    if (event.action !== MouseAction.PRESS) return;
    
    const now = Date.now();
    const timeDiff = now - this.lastClick.time;
    const isSamePosition = 
      event.x === this.lastClick.x && 
      event.y === this.lastClick.y;
    
    if (timeDiff < 300 && isSamePosition) {
      this.lastClick.count++;
    } else {
      this.lastClick.count = 1;
    }
    
    this.lastClick = { x: event.x, y: event.y, time: now, count: this.lastClick.count };
    
    switch (this.lastClick.count) {
      case 1:
        this.onSingleClick(event);
        break;
      case 2:
        this.onDoubleClick(event);
        break;
      case 3:
        this.onTripleClick(event);
        break;
    }
  }
  
  private onSingleClick(event: MouseEvent) {
    console.log('Single click');
  }
  
  private onDoubleClick(event: MouseEvent) {
    console.log('Double click');
  }
  
  private onTripleClick(event: MouseEvent) {
    console.log('Triple click');
  }
}
```

### Hit Testing

```typescript
class Widget {
  private bounds: Rect = { x: 0, y: 0, width: 10, height: 5 };
  
  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.bounds.x &&
      x < this.bounds.x + this.bounds.width &&
      y >= this.bounds.y &&
      y < this.bounds.y + this.bounds.height
    );
  }
  
  onMouse(event: MouseEvent): boolean {
    if (!this.containsPoint(event.x, event.y)) {
      return false;
    }
    
    // Convert to local coordinates
    const localX = event.x - this.bounds.x;
    const localY = event.y - this.bounds.y;
    
    // Handle event
    console.log('Local coordinates:', localX, localY);
    return true;
  }
}
```

## Signal Events

### Signal Handling

```typescript
eventLoop.on('signal', (event) => {
  switch (event.signal) {
    case SignalType.SIGWINCH:
      handleResize();
      break;
      
    case SignalType.SIGINT:
      handleInterrupt();
      break;
      
    case SignalType.SIGTERM:
      handleTermination();
      break;
      
    case SignalType.SIGTSTP:
      handleSuspend();
      break;
      
    case SignalType.SIGCONT:
      handleContinue();
      break;
  }
});

function handleResize() {
  const { columns, rows } = TerminalSizeManager.getTerminalSize();
  console.log(`Terminal resized to ${columns}x${rows}`);
  // Update layout, re-render, etc.
}

function handleInterrupt() {
  console.log('Interrupted by user');
  eventLoop.stop();
  process.exit(0);
}

function handleTermination() {
  console.log('Termination requested');
  cleanup();
  process.exit(0);
}

function handleSuspend() {
  // Restore terminal state before suspending
  rawMode.exit();
}

function handleContinue() {
  // Re-initialize terminal state after continuing
  rawMode.enter();
}
```

## Custom Events

### Creating Custom Events

```typescript
// Define custom event types
interface DataLoadedEvent extends CustomEvent {
  name: 'data-loaded';
  data: {
    items: unknown[];
    totalCount: number;
  };
}

interface UserActionEvent extends CustomEvent {
  name: 'user-action';
  data: {
    action: string;
    timestamp: number;
  };
}

// Type-safe event emitter
class TypedEventEmitter {
  private handlers = new Map<string, Set<(data: unknown) => void>>();
  
  on<T>(name: string, handler: (data: T) => void): () => void {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new Set());
    }
    
    const wrapped = (data: unknown) => handler(data as T);
    this.handlers.get(name)!.add(wrapped);
    
    return () => {
      this.handlers.get(name)!.delete(wrapped);
    };
  }
  
  emit<T>(name: string, data: T): void {
    const handlers = this.handlers.get(name);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}

// Usage
const emitter = new TypedEventEmitter();

emitter.on<DataLoadedEvent['data']>('data-loaded', (data) => {
  console.log(`Loaded ${data.items.length} of ${data.totalCount} items`);
});

emitter.emit('data-loaded', {
  items: [1, 2, 3],
  totalCount: 100,
});
```

### Event Bus Pattern

```typescript
class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();
  
  subscribe<T>(event: string, handler: (data: T) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const wrapped = handler as EventHandler;
    this.listeners.get(event)!.add(wrapped);
    
    return () => {
      this.listeners.get(event)?.delete(wrapped);
    };
  }
  
  publish<T>(event: string, data: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
  
  unsubscribeAll(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Global event bus
export const globalEventBus = new EventBus();

// Usage in different parts of the app
// Component A
globalEventBus.subscribe('user-login', (user) => {
  console.log('User logged in:', user.name);
});

// Component B
globalEventBus.publish('user-login', { name: 'John', id: 123 });
```

## Event Dispatch

### Event Propagation

```typescript
class EventDispatcher {
  private capturePhase = new Map<string, EventHandler[]>();
  private targetPhase = new Map<string, EventHandler[]>();
  private bubblePhase = new Map<string, EventHandler[]>();
  
  dispatch(event: Event, target: Widget): void {
    const path = this.getEventPath(target);
    
    // Capture phase (root to target)
    for (let i = path.length - 1; i >= 0; i--) {
      if (event.propagationStopped) break;
      this.runPhase(this.capturePhase, event, path[i]);
    }
    
    // Target phase
    if (!event.propagationStopped) {
      this.runPhase(this.targetPhase, event, target);
    }
    
    // Bubble phase (target to root)
    for (let i = 0; i < path.length; i++) {
      if (event.propagationStopped) break;
      this.runPhase(this.bubblePhase, event, path[i]);
    }
  }
  
  private getEventPath(target: Widget): Widget[] {
    const path: Widget[] = [];
    let current: Widget | undefined = target;
    
    while (current) {
      path.push(current);
      current = current.getParent();
    }
    
    return path;
  }
  
  private runPhase(
    phase: Map<string, EventHandler[]>,
    event: Event,
    target: Widget
  ): void {
    const handlers = phase.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event, target));
    }
  }
}
```

### Stopping Propagation

```typescript
class Widget {
  onKey(event: KeyEvent): boolean {
    // Handle the event
    if (event.key === 'enter') {
      this.submit();
      
      // Stop further propagation
      event.propagationStopped = true;
      return true;
    }
    
    return false;
  }
}

// In parent
parent.on('key', (event) => {
  if (event.propagationStopped) {
    console.log('Event was handled by child');
    return;
  }
  
  // Handle at parent level
});
```

## Event Handling Patterns

### Debouncing

```typescript
import { debounce } from 'tui-framework';

// Debounced resize handler
const handleResize = debounce((size: TerminalSize) => {
  console.log('Resized to:', size);
  updateLayout(size);
}, 100);

eventLoop.on('resize', (event) => {
  handleResize({ columns: event.columns, rows: event.rows });
});

// Debounced search
const searchInput = new TextInput({
  onChange: debounce((value) => {
    performSearch(value);
  }, 300),
});
```

### Throttling

```typescript
import { throttle } from 'tui-framework';

// Throttled mouse move
const handleMouseMove = throttle((event: MouseEvent) => {
  updateCursorPosition(event.x, event.y);
}, 50); // Max 20 updates per second

eventLoop.on('mouse', (event) => {
  if (event.action === MouseAction.MOVE) {
    handleMouseMove(event);
  }
});

// Throttled scroll
const handleScroll = throttle(() => {
  loadMoreItems();
}, 200);
```

### Event Delegation

```typescript
class ListWidget {
  private items: Widget[] = [];
  
  onMouse(event: MouseEvent): boolean {
    // Find which item was clicked
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      
      if (item.containsPoint(event.x, event.y)) {
        // Delegate to item
        return item.onMouse(event);
      }
    }
    
    return false;
  }
}
```

### Command Pattern

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class CommandManager {
  private history: Command[] = [];
  private index = -1;
  
  execute(command: Command): void {
    command.execute();
    
    // Remove any redo commands
    this.history = this.history.slice(0, this.index + 1);
    
    this.history.push(command);
    this.index++;
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
      this.history[this.index].execute();
    }
  }
}

// Usage with key bindings
bindings.register({
  id: 'undo',
  chords: { key: 'z', ctrl: true },
  callback: () => commandManager.undo(),
});

bindings.register({
  id: 'redo',
  chords: { key: 'z', ctrl: true, shift: true },
  callback: () => commandManager.redo(),
});
```

## Best Practices

### 1. Always Clean Up Listeners

```typescript
class Widget {
  private unsubscribe?: () => void;
  
  mount() {
    this.unsubscribe = eventLoop.on('key', this.handleKey);
  }
  
  unmount() {
    this.unsubscribe?.();
  }
}
```

### 2. Use Type-Safe Events

```typescript
// ✅ Good: Type-safe event handling
eventLoop.on('key', (event: KeyEvent) => {
  // TypeScript knows event has .key, .ctrl, etc.
});

// ❌ Bad: Untyped events
eventLoop.on('key', (event: any) => {
  // No type safety
});
```

### 3. Handle Events at Appropriate Level

```typescript
// ✅ Good: Handle at appropriate level
class Button {
  onMouse(event: MouseEvent): boolean {
    if (event.action === MouseAction.PRESS) {
      this.activate();
      return true;
    }
    return false;
  }
}

// ❌ Bad: Global handling for local concerns
eventLoop.on('mouse', (event) => {
  if (event.x >= 10 && event.x <= 20 && event.y === 5) {
    // This is fragile!
  }
});
```

### 4. Return Boolean from Handlers

```typescript
// ✅ Good: Return true if handled
onKey(event: KeyEvent): boolean {
  if (event.key === 'enter') {
    this.submit();
    return true; // Event handled
  }
  return false; // Pass to parent
}
```

### 5. Use Constants for Key Names

```typescript
// ✅ Good: Use constants
const KEYS = {
  ENTER: 'enter',
  ESCAPE: 'escape',
  TAB: 'tab',
} as const;

if (event.key === KEYS.ENTER) {
  // ...
}
```

### 6. Document Event Handlers

```typescript
/**
 * Handles keyboard navigation within the list.
 * 
 * Keys:
 * - Up/Down: Navigate items
 * - Enter: Select item
 * - Space: Toggle selection
 * - Escape: Cancel
 * 
 * @returns true if event was handled
 */
onKey(event: KeyEvent): boolean {
  // Implementation
}
```

This guide covers the comprehensive event system in the TUI Framework. For more details on specific APIs, see the [API Reference](api.md).