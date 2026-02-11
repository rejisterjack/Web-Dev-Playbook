# Getting Started Guide

Welcome to the TUI Framework! This guide will walk you through installing the framework, creating your first application, and understanding the core concepts.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Your First TUI Application](#your-first-tui-application)
- [Project Structure](#project-structure)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** - Version 16.0.0 or higher
  ```bash
  node --version
  ```

- **npm** or **yarn** - Package manager
  ```bash
  npm --version
  # or
  yarn --version
  ```

- **TypeScript** - For type-safe development (recommended)
  ```bash
  npm install -g typescript
  ```

### Recommended

- **A modern terminal emulator** with:
  - ANSI escape code support
  - TrueColor support (optional, for best color experience)
  - Mouse tracking support (optional, for mouse interactions)

### Terminal Compatibility

The framework works best in these terminals:

| Terminal | TrueColor | Mouse | Notes |
|----------|-----------|-------|-------|
| iTerm2 (macOS) | ✅ | ✅ | Recommended |
| Windows Terminal | ✅ | ✅ | Recommended |
| GNOME Terminal | ✅ | ✅ | Good support |
| Konsole | ✅ | ✅ | Good support |
| Alacritty | ✅ | ✅ | Excellent performance |
| WezTerm | ✅ | ✅ | Excellent performance |
| Terminal.app | ❌ | ✅ | Limited to 256 colors |
| VS Code Terminal | ✅ | ✅ | Good for development |

## Installation

### Using npm

```bash
npm install tui-framework
```

### Using yarn

```bash
yarn add tui-framework
```

### Using pnpm

```bash
pnpm add tui-framework
```

### Development Installation

For the latest development version:

```bash
npm install tui-framework@next
```

## Your First TUI Application

Let's create a simple "Hello, World!" application to get familiar with the framework.

### Step 1: Create Project Directory

```bash
mkdir my-tui-app
cd my-tui-app
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install tui-framework
npm install --save-dev typescript @types/node ts-node
```

### Step 3: Create TypeScript Configuration

Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Create Your Application

Create `src/index.ts`:

```typescript
import {
  EventLoop,
  Renderer,
  createRenderContext,
  RawModeManager,
  ANSI,
} from 'tui-framework';

async function main() {
  // Initialize raw mode for terminal input
  const rawMode = new RawModeManager();
  await rawMode.enter();

  // Initialize renderer
  const renderer = new Renderer({
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
    targetFps: 60,
  });

  // Initialize event loop
  const eventLoop = new EventLoop({
    mouseSupport: true,
  });

  // Handle keyboard input
  eventLoop.on('key', (event) => {
    if (event.key === 'q' && event.ctrl) {
      eventLoop.stop();
    }
  });

  // Handle terminal resize
  eventLoop.on('resize', (event) => {
    renderer.resize(event.columns, event.rows);
  });

  // Clear screen and hide cursor
  process.stdout.write(ANSI.clearScreen());
  process.stdout.write(ANSI.Cursor.hide());

  // Start event loop
  await eventLoop.start();

  // Main render loop
  while (eventLoop.isRunning()) {
    const buffer = renderer.getBackBuffer();
    const ctx = createRenderContext(buffer);

    // Clear buffer
    ctx.clear();

    // Draw "Hello, World!"
    ctx.drawText('Hello, World!', 2, 2, {
      fg: { rgb: [0, 255, 0] },
      bold: true,
    });

    ctx.drawText('Press Ctrl+Q to quit', 2, 4, {
      fg: { rgb: [128, 128, 128] },
    });

    // Render to screen
    await renderer.render();

    // Small delay to prevent CPU spinning
    await new Promise((resolve) => setTimeout(resolve, 16));
  }

  // Cleanup
  process.stdout.write(ANSI.clearScreen());
  process.stdout.write(ANSI.Cursor.show());
  await rawMode.exit();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Step 5: Run Your Application

```bash
npx ts-node src/index.ts
```

You should see a green "Hello, World!" message. Press `Ctrl+Q` to exit.

## Project Structure

A typical TUI Framework project structure:

```
my-tui-app/
├── src/
│   ├── index.ts          # Application entry point
│   ├── components/       # Custom widgets
│   │   ├── header.ts
│   │   └── footer.ts
│   ├── screens/          # Screen components
│   │   ├── main-screen.ts
│   │   └── settings-screen.ts
│   ├── styles/           # Theme and styling
│   │   └── theme.ts
│   └── utils/            # Utility functions
│       └── helpers.ts
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Common Patterns

### Pattern 1: Application Class

Organize your application as a class:

```typescript
import {
  EventLoop,
  Renderer,
  LayoutEngine,
  ThemeManager,
  darkTheme,
} from 'tui-framework';

class Application {
  private eventLoop: EventLoop;
  private renderer: Renderer;
  private layoutEngine: LayoutEngine;
  private themeManager: ThemeManager;
  private running = false;

  constructor() {
    this.themeManager = new ThemeManager();
    this.themeManager.setTheme(darkTheme);

    this.renderer = new Renderer({
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24,
    });

    this.layoutEngine = new LayoutEngine();

    this.eventLoop = new EventLoop();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventLoop.on('key', (event) => {
      if (event.key === 'q' && event.ctrl) {
        this.stop();
      }
    });

    this.eventLoop.on('resize', (event) => {
      this.renderer.resize(event.columns, event.rows);
    });
  }

  async start() {
    this.running = true;
    await this.eventLoop.start();

    while (this.running && this.eventLoop.isRunning()) {
      this.render();
      await this.sleep(16);
    }

    await this.cleanup();
  }

  private render() {
    const buffer = this.renderer.getBackBuffer();
    const ctx = createRenderContext(buffer);

    ctx.clear();
    // ... draw your UI

    this.renderer.render();
  }

  stop() {
    this.running = false;
    this.eventLoop.stop();
  }

  private async cleanup() {
    // Cleanup resources
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Usage
const app = new Application();
app.start().catch(console.error);
```

### Pattern 2: Screen Management

Manage multiple screens in your application:

```typescript
type Screen = 'home' | 'settings' | 'about';

class ScreenManager {
  private currentScreen: Screen = 'home';
  private screens: Map<Screen, () => void> = new Map();

  register(screen: Screen, renderFn: () => void) {
    this.screens.set(screen, renderFn);
  }

  switchTo(screen: Screen) {
    this.currentScreen = screen;
  }

  render(ctx: RenderContext) {
    const renderFn = this.screens.get(this.currentScreen);
    if (renderFn) {
      renderFn.call(this, ctx);
    }
  }
}

// Usage
const screenManager = new ScreenManager();

screenManager.register('home', function (ctx) {
  ctx.drawText('Home Screen', 1, 1);
});

screenManager.register('settings', function (ctx) {
  ctx.drawText('Settings Screen', 1, 1);
});
```

### Pattern 3: State Management

Simple state management for your application:

```typescript
class StateManager<T> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(updater: Partial<T> | ((prev: T) => Partial<T>)) {
    const updates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

// Usage
interface AppState {
  count: number;
  message: string;
}

const state = new StateManager<AppState>({
  count: 0,
  message: 'Hello',
});

state.subscribe((newState) => {
  console.log('State updated:', newState);
});

state.setState({ count: 1 });
state.setState((prev) => ({ count: prev.count + 1 }));
```

### Pattern 4: Component Composition

Create reusable components:

```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
}

function renderHeader(ctx: RenderContext, props: HeaderProps, x: number, y: number) {
  const { title, subtitle } = props;

  // Draw title
  ctx.drawText(title, x, y, {
    bold: true,
    fg: { rgb: [255, 255, 255] },
  });

  // Draw subtitle if provided
  if (subtitle) {
    ctx.drawText(subtitle, x, y + 1, {
      fg: { rgb: [128, 128, 128] },
    });
  }

  // Draw separator line
  ctx.drawLine(x, y + (subtitle ? 2 : 1), ctx.width, y + (subtitle ? 2 : 1), {
    fg: { rgb: [64, 64, 64] },
  });
}

// Usage
renderHeader(ctx, { title: 'My App', subtitle: 'v1.0.0' }, 1, 1);
```

## Troubleshooting

### Common Issues

#### Issue: "Raw mode not supported"

**Cause:** The terminal doesn't support raw mode, or stdin is not a TTY.

**Solution:**

```typescript
import { supportsRawMode } from 'tui-framework';

if (!supportsRawMode()) {
  console.log('Interactive mode not supported. Running in non-interactive mode.');
  // Fallback to non-interactive mode
} else {
  // Use raw mode
}
```

#### Issue: "Colors not displaying correctly"

**Cause:** Terminal doesn't support TrueColor.

**Solution:**

```typescript
import { detectCapabilities } from 'tui-framework';

const caps = detectCapabilities();

if (caps.colorSupport === 'truecolor') {
  // Use full RGB colors
} else if (caps.colorSupport === '256') {
  // Use 256-color palette
} else {
  // Use 16 basic colors
}
```

#### Issue: "Mouse events not working"

**Cause:** Terminal doesn't support mouse tracking, or mouse support is not enabled.

**Solution:**

```typescript
const eventLoop = new EventLoop({
  mouseSupport: true, // Enable mouse support
});

// Check if mouse is supported
if (!eventLoop.isMouseSupported()) {
  console.log('Mouse not supported in this terminal');
}
```

#### Issue: "High CPU usage"

**Cause:** Render loop running too fast without throttling.

**Solution:**

```typescript
// Add frame limiting
const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS;

let lastFrame = 0;

while (running) {
  const now = Date.now();
  const delta = now - lastFrame;

  if (delta >= FRAME_TIME) {
    render();
    lastFrame = now;
  }

  // Small sleep to prevent busy-waiting
  await new Promise((resolve) => setTimeout(resolve, 1));
}
```

#### Issue: "Terminal not restored on exit"

**Cause:** Application crashed or didn't clean up properly.

**Solution:**

```typescript
import { RawModeManager, ANSI } from 'tui-framework';

const rawMode = new RawModeManager();

// Always cleanup on exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

function cleanup() {
  process.stdout.write(ANSI.clearScreen());
  process.stdout.write(ANSI.Cursor.show());
  process.stdout.write(ANSI.Style.reset());
  rawMode.exit();
}
```

### Debug Mode

Enable debug logging to diagnose issues:

```typescript
const eventLoop = new EventLoop({
  debug: true, // Enable debug logging
});
```

### Getting Help

If you encounter issues not covered here:

1. Check the [FAQ](faq.md) for common questions
2. Review the [API Reference](api.md) for detailed documentation
3. Look at the [examples](../src/demo/) for working code samples
4. Open an issue on GitHub with:
   - Your Node.js version
   - Terminal emulator and version
   - Operating system
   - Minimal code to reproduce the issue

## Next Steps

Now that you have a basic understanding of the framework, explore:

- **[Architecture Guide](architecture.md)** - Understand the framework's design
- **[Widget Guide](widgets.md)** - Learn about available widgets
- **[Layout Guide](layout.md)** - Master the layout system
- **[Theming Guide](theming.md)** - Customize the appearance
- **[Performance Guide](performance.md)** - Optimize your application

Happy coding! 🚀