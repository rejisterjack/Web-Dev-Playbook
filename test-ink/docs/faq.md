# Frequently Asked Questions (FAQ)

Common questions and answers about the TUI Framework.

## Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Rendering](#rendering)
- [Events & Input](#events--input)
- [Layout](#layout)
- [Styling & Theming](#styling--theming)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)

## General Questions

### What is the TUI Framework?

The TUI Framework is a comprehensive TypeScript framework for building Terminal User Interface (TUI) applications. It provides a layered architecture with terminal control, rendering, layout, widgets, and accessibility features.

### Is it production-ready?

Yes, the framework is designed for production use with comprehensive testing, documentation, and performance optimizations.

### What terminals are supported?

The framework works in any terminal supporting:
- ANSI escape codes
- Raw mode (for interactive apps)
- Mouse tracking (optional)

Tested terminals include: iTerm2, Windows Terminal, GNOME Terminal, Konsole, Alacritty, WezTerm, and VS Code Terminal.

### How does it compare to Ink or Blessed?

| Feature | TUI Framework | Ink | Blessed |
|---------|---------------|-----|---------|
| Architecture | Layered | React-based | Event-based |
| TypeScript | Native | Good | Limited |
| Performance | Optimized | Good | Good |
| Accessibility | Comprehensive | Basic | Limited |
| Layout | Flexbox | Flexbox | Box model |

### Can I use it with React?

The framework has its own component model. While it's not built on React, it follows similar patterns (props, state, lifecycle). React integration would require an adapter layer.

## Installation & Setup

### What are the system requirements?

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5 (recommended)
- **Terminal**: Any modern terminal with ANSI support

### How do I install it?

```bash
npm install tui-framework
```

### Why am I getting "Cannot find module" errors?

Make sure you're using ES modules:

```json
// package.json
{
  "type": "module"
}
```

Or use `.mjs` extension for your files.

### Can I use it in CommonJS projects?

Yes, but you'll need to use dynamic imports:

```javascript
const { EventLoop } = await import('tui-framework');
```

### How do I enable TypeScript support?

```bash
npm install --save-dev typescript @types/node
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Rendering

### Why is my screen flickering?

The framework uses double buffering by default. Flickering usually means:

1. **Not using the renderer properly**:
```typescript
// ❌ Bad: Direct writes
process.stdout.write('text');

// ✅ Good: Use renderer
const buffer = renderer.getBackBuffer();
const ctx = createRenderContext(buffer);
ctx.drawText('text', 0, 0);
await renderer.render();
```

2. **Multiple render calls**:
```typescript
// ❌ Bad: Multiple renders
widget1.render();
await renderer.render();
widget2.render();
await renderer.render();

// ✅ Good: Single render
widget1.render();
widget2.render();
await renderer.render();
```

### How do I render at 60 FPS?

```typescript
const renderer = new Renderer({ targetFps: 60 });

// Or manually control
const FRAME_TIME = 1000 / 60;
let lastFrame = 0;

while (running) {
  const now = performance.now();
  if (now - lastFrame >= FRAME_TIME) {
    render();
    lastFrame = now;
  }
  await new Promise(r => setTimeout(r, 1));
}
```

### Can I use colors?

Yes! The framework supports:
- TrueColor (24-bit RGB)
- 256-color palette
- 16 standard colors

```typescript
// TrueColor
ctx.drawText('Red', 0, 0, { fg: { rgb: [255, 0, 0] } });

// Named colors
ctx.drawText('Blue', 0, 0, { fg: 'blue' });

// 256-color
ctx.drawText('Color', 0, 0, { fg: { index: 196 } });
```

### How do I clear the screen?

```typescript
// Clear entire screen
ctx.clear();

// Clear specific region
ctx.clearRect(x, y, width, height);

// Clear and move cursor home
process.stdout.write(ANSI.clearScreen());
process.stdout.write(ANSI.moveCursor(1, 1));
```

### Why are my unicode characters not displaying correctly?

Unicode characters may have different widths:

```typescript
// Check character width
import { getStringWidth } from 'tui-framework';

const width = getStringWidth('🎉'); // Returns 2

// Use proper width in cells
const cell = createCell('🎉', { width: 2 });
```

## Events & Input

### How do I handle keyboard input?

```typescript
const eventLoop = new EventLoop();

eventLoop.on('key', (event) => {
  console.log('Key:', event.key);
  console.log('Ctrl:', event.ctrl);
  console.log('Alt:', event.alt);
  console.log('Shift:', event.shift);
});

await eventLoop.start();
```

### How do I handle special keys?

```typescript
eventLoop.on('key', (event) => {
  switch (event.key) {
    case 'escape':
      // Handle escape
      break;
    case 'return':
    case 'enter':
      // Handle enter
      break;
    case 'up':
    case 'down':
    case 'left':
    case 'right':
      // Handle arrows
      break;
    case 'tab':
      if (event.shift) {
        // Shift+Tab
      } else {
        // Tab
      }
      break;
  }
});
```

### How do I enable mouse support?

```typescript
const eventLoop = new EventLoop({
  mouseSupport: true,
});

eventLoop.on('mouse', (event) => {
  console.log('Action:', event.action);
  console.log('Button:', event.button);
  console.log('Position:', event.x, event.y);
});
```

### Why isn't mouse tracking working?

1. **Check terminal support**:
```typescript
if (!eventLoop.isMouseSupported()) {
  console.log('Mouse not supported in this terminal');
}
```

2. **Some terminals need explicit enable**:
```typescript
process.stdout.write(ANSI.enableMouse());
```

3. **Terminal.app on macOS has limited mouse support**

### How do I handle terminal resize?

```typescript
eventLoop.on('resize', (event) => {
  console.log(`Resized to ${event.columns}x${event.rows}`);
  
  // Update renderer
  renderer.resize(event.columns, event.rows);
  
  // Recalculate layout
  layoutEngine.setViewport(event.columns, event.rows);
  
  // Re-render
  render();
});
```

## Layout

### How do I center content?

```typescript
import { center } from 'tui-framework';

const layout = center({
  child: new Text({ content: 'Centered' }),
});
```

Or manually:

```typescript
const text = 'Hello';
const x = Math.floor((screenWidth - text.length) / 2);
const y = Math.floor(screenHeight / 2);
ctx.drawText(text, x, y);
```

### How do I create a responsive layout?

```typescript
const layout = new ResponsiveLayout({
  breakpoints: [
    { name: 'mobile', maxWidth: 40 },
    { name: 'tablet', minWidth: 41, maxWidth: 80 },
    { name: 'desktop', minWidth: 81 },
  ],
});

layout.define('mobile', () => column({
  children: [header, content, sidebar],
}));

layout.define('desktop', () => column({
  children: [
    header,
    row({ children: [sidebar, content] }),
  ],
}));
```

### How do I handle overflow/scrolling?

```typescript
const scrollView = new ScrollView({
  width: 40,
  height: 10,
  direction: 'vertical',
  children: [
    // Many items...
  ],
});

// Programmatic scrolling
scrollView.scrollTo(0, 50);
scrollView.scrollBy(0, 5);
```

### What's the difference between margin and padding?

```
┌─────────────────────────────────┐
│          Margin (outside)       │
│   ┌─────────────────────────┐   │
│   │      Padding (inside)   │   │
│   │   ┌─────────────────┐   │   │
│   │   │                 │   │   │
│   │   │    Content      │   │   │
│   │   │                 │   │   │
│   │   └─────────────────┘   │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

```typescript
new Box({
  margin: 2,        // Space outside the box
  padding: 1,       // Space inside the box
  border: true,
  children: [content],
});
```

## Styling & Theming

### How do I create a custom theme?

```typescript
const myTheme: Theme = {
  name: 'my-theme',
  colors: {
    background: { rgb: [30, 30, 30] },
    text: { rgb: [255, 255, 255] },
    primary: { rgb: [0, 120, 255] },
    success: { rgb: [0, 255, 0] },
    error: { rgb: [255, 0, 0] },
  },
  styles: {},
};

themeManager.setTheme(myTheme);
```

### How do I switch between light and dark themes?

```typescript
import { darkTheme, lightTheme } from 'tui-framework';

// Detect preference
const prefersDark = process.env.COLORFGBG === '0;15';

// Set theme
themeManager.setTheme(prefersDark ? darkTheme : lightTheme);

// Or toggle
function toggleTheme() {
  const current = themeManager.getTheme();
  themeManager.setTheme(
    current.name === 'dark' ? lightTheme : darkTheme
  );
}
```

### How do I use gradients?

```typescript
const gradient = createGradient({
  type: GradientType.Linear,
  stops: [
    { color: { rgb: [255, 0, 0] }, position: 0 },
    { color: { rgb: [0, 0, 255] }, position: 1 },
  ],
});

// Render gradient
for (let i = 0; i < width; i++) {
  const color = getGradientColor(gradient, i / width);
  ctx.drawText('█', x + i, y, { fg: color });
}
```

### Can I use CSS-like styles?

The framework uses programmatic styling:

```typescript
// Instead of CSS:
// color: red; font-weight: bold;

// Use:
new Text({
  content: 'Hello',
  color: 'red',
  bold: true,
});
```

## Performance

### How do I optimize rendering performance?

1. **Use differential rendering** (automatic)
2. **Batch updates**:
```typescript
// Update multiple widgets
widget1.update();
widget2.update();
widget3.update();

// Single render
await renderer.render();
```

3. **Throttle high-frequency events**:
```typescript
const handleResize = throttle((size) => {
  updateLayout(size);
}, 100);
```

4. **Use object pooling** for frequently created objects

### How much memory does it use?

Memory usage depends on:
- Screen size (buffers: width × height × cell size × 2)
- Number of widgets
- Cached data

Typical usage: 5-20 MB for a full-screen application.

### Can I run heavy computations without blocking the UI?

Yes, use the task system:

```typescript
const taskManager = new TaskManager();

taskManager.add('heavy-task', async () => {
  // Heavy computation
  return result;
}, {
  priority: TaskPriority.LOW, // Don't block UI
});

// Or use worker threads
const worker = new TaskWorker('./worker.js');
const result = await worker.execute(heavyFunction);
```

### How do I profile my application?

```typescript
// Built-in profiler
const profiler = new PerformanceMonitor();

profiler.measureFrame(() => {
  render();
});

// Report
setInterval(() => {
  profiler.report();
  // FPS: 60.2
  // Avg Frame Time: 16.5ms
}, 5000);
```

## Accessibility

### How do I make my app accessible?

The framework includes accessibility by default:

1. **Screen reader support**:
```typescript
screenReader.announce('File saved successfully');
```

2. **Keyboard navigation**:
```typescript
const focusManager = new AccessibilityFocusManager();
focusManager.register(widget);
```

3. **ARIA attributes**:
```typescript
class MyWidget {
  getAriaLabel() { return 'Description'; }
  getAriaRole() { return 'button'; }
}
```

### How do I test accessibility?

```typescript
import { AccessibilityAudit } from 'tui-framework';

const audit = new AccessibilityAudit();
const report = audit.run(app);

console.log('Score:', report.score);
console.log('Violations:', report.violations);
```

### How do I support high contrast mode?

```typescript
if (accessibilityManager.isHighContrastEnabled()) {
  // Use high contrast colors
  ctx.drawText('Text', 0, 0, {
    fg: { rgb: [255, 255, 255] },
    bg: { rgb: [0, 0, 0] },
  });
}
```

## Troubleshooting

### "Raw mode not supported"

Your environment doesn't support raw mode:

```typescript
import { supportsRawMode } from 'tui-framework';

if (!supportsRawMode()) {
  console.log('Running in non-interactive mode');
  // Fallback to non-interactive
}
```

### "Colors not displaying"

Check terminal color support:

```typescript
const caps = detectCapabilities();
console.log('Color support:', caps.colorSupport);

// Use appropriate colors
if (caps.colorSupport === 'truecolor') {
  // Full RGB
} else if (caps.colorSupport === '256') {
  // 256 colors
} else {
  // 16 colors
}
```

### "Terminal not restored on exit"

Always clean up:

```typescript
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });

function cleanup() {
  process.stdout.write(ANSI.clearScreen());
  process.stdout.write(ANSI.Cursor.show());
  process.stdout.write(ANSI.Style.reset());
  rawMode.exit();
}
```

### "High CPU usage"

Add frame limiting:

```typescript
const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS;

while (running) {
  const now = Date.now();
  if (now - lastFrame >= FRAME_TIME) {
    render();
    lastFrame = now;
  }
  await new Promise(r => setTimeout(r, 1));
}
```

### "Memory leaks"

Ensure proper cleanup:

```typescript
class MyWidget {
  private interval?: NodeJS.Timeout;
  
  mount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }
  
  unmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
```

### Debug mode

Enable debug logging:

```typescript
const eventLoop = new EventLoop({
  debug: true,
});

// Or set environment variable
DEBUG=tui-framework node app.js
```

## Getting More Help

- **Documentation**: [Full documentation](https://github.com/your-org/tui-framework/tree/main/docs)
- **Examples**: [Demo applications](../src/demo/)
- **Issues**: [GitHub Issues](https://github.com/your-org/tui-framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/tui-framework/discussions)

---

Didn't find your answer? [Open an issue](https://github.com/your-org/tui-framework/issues/new) or [start a discussion](https://github.com/your-org/tui-framework/discussions/new).