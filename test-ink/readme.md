# TUI Framework

A sophisticated, production-grade Terminal User Interface (TUI) framework for Node.js and TypeScript. Built with performance, accessibility, and developer experience in mind.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

### Core Capabilities

- **🖥️ Terminal Control Layer** - Low-level terminal manipulation with ANSI escape codes, raw mode management, and mouse tracking
- **🎨 Advanced Rendering** - Double-buffered rendering engine with differential updates for optimal performance
- **📐 Flexbox Layout Engine** - CSS Flexbox-like layout system with constraint-based resolution
- **⚡ High-Performance Event Loop** - Non-blocking I/O with debouncing, throttling, and intelligent event dispatch
- **🎯 Rich Widget System** - Comprehensive set of built-in widgets with lifecycle management
- **📊 Data Visualization** - Real-time charts, graphs, and data displays with animation support

### Advanced Features

- **🌈 TrueColor Support** - Full 24-bit RGB color support with automatic fallback to 256-color and 16-color modes
- **🎭 Comprehensive Theming** - Dynamic theme system with predefined themes and custom theme creation
- **♿ Accessibility First** - Screen reader support, keyboard navigation, high contrast mode, and WCAG compliance
- **🔄 Async Task System** - Background task processing with worker thread integration
- **📱 Responsive Design** - Breakpoint-based responsive layouts that adapt to terminal size
- **🔧 Developer Tools** - Comprehensive debugging, profiling, and development utilities

## Quick Start

### Installation

```bash
npm install tui-framework
```

### Basic Usage

```typescript
import {
  EventLoop,
  Renderer,
  LayoutEngine,
  ThemeManager,
  darkTheme,
} from 'tui-framework';

// Create the main application
class MyApp {
  private eventLoop: EventLoop;
  private renderer: Renderer;
  private layoutEngine: LayoutEngine;
  private themeManager: ThemeManager;

  constructor() {
    // Initialize theme
    this.themeManager = new ThemeManager();
    this.themeManager.setTheme(darkTheme);

    // Initialize renderer
    this.renderer = new Renderer({
      width: 80,
      height: 24,
      targetFps: 60,
    });

    // Initialize layout engine
    this.layoutEngine = new LayoutEngine();

    // Initialize event loop
    this.eventLoop = new EventLoop({
      mouseSupport: true,
      bracketedPaste: true,
    });

    // Handle key events
    this.eventLoop.on('key', (event) => {
      if (event.key === 'q' && event.ctrl) {
        this.shutdown();
      }
    });

    // Handle resize events
    this.eventLoop.on('resize', (event) => {
      this.renderer.resize(event.columns, event.rows);
      this.layoutEngine.setViewport(event.columns, event.rows);
    });
  }

  async start() {
    // Start the event loop
    await this.eventLoop.start();

    // Main render loop
    while (this.eventLoop.isRunning()) {
      this.render();
      await this.sleep(16); // ~60 FPS
    }
  }

  private render() {
    const buffer = this.renderer.getBackBuffer();
    const ctx = createRenderContext(buffer);

    // Clear the buffer
    ctx.clear();

    // Draw your UI here
    ctx.drawText('Hello, TUI Framework!', 1, 1, {
      fg: { rgb: [0, 255, 0] },
      bold: true,
    });

    // Render to screen
    this.renderer.render();
  }

  private shutdown() {
    this.eventLoop.stop();
    process.exit(0);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run the application
const app = new MyApp();
app.start().catch(console.error);
```

### Using Widgets

```typescript
import { Box, Text, Button, VStack, HStack } from 'tui-framework/widgets';

// Create a simple UI with widgets
const ui = VStack({
  padding: 1,
  children: [
    Text({
      content: 'Welcome to TUI Framework',
      style: { bold: true, fg: 'blue' },
    }),
    Box({
      border: true,
      children: [
        Text({ content: 'This is a bordered box' }),
      ],
    }),
    HStack({
      gap: 1,
      children: [
        Button({
          label: 'OK',
          onClick: () => console.log('OK clicked'),
        }),
        Button({
          label: 'Cancel',
          onClick: () => console.log('Cancel clicked'),
        }),
      ],
    }),
  ],
});
```

### Data Visualization

```typescript
import { LineChart, BarChart, Sparkline } from 'tui-framework/visualization';

// Create a line chart
const chart = new LineChartWidget({
  width: 60,
  height: 20,
  series: [
    {
      id: 'cpu',
      name: 'CPU Usage',
      data: [
        { value: 45 },
        { value: 52 },
        { value: 48 },
        { value: 61 },
        { value: 55 },
      ],
      color: { rgb: [0, 255, 0] },
    },
  ],
  axis: {
    x: { type: 'linear', title: 'Time' },
    y: { type: 'linear', title: 'Usage %', min: 0, max: 100 },
  },
});

// Render the chart
chart.render(ctx, 0, 0);
```

## Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Getting Started](docs/getting-started.md)** - Installation, prerequisites, and your first TUI application
- **[Architecture](docs/architecture.md)** - High-level architecture and design patterns
- **[API Reference](docs/api.md)** - Complete API documentation
- **[Widgets](docs/widgets.md)** - Available widgets and how to use them
- **[Layout](docs/layout.md)** - Layout system and responsive design
- **[Theming](docs/theming.md)** - Theme system and customization
- **[Events](docs/events.md)** - Event handling and input management
- **[Performance](docs/performance.md)** - Optimization strategies and best practices
- **[Accessibility](docs/accessibility.md)** - Accessibility features and WCAG compliance
- **[Advanced Topics](docs/advanced.md)** - Custom rendering, plugins, and advanced patterns
- **[Migration Guide](docs/migration.md)** - Migrating from other TUI libraries
- **[Contributing](docs/contributing.md)** - Development setup and contribution guidelines
- **[Changelog](docs/changelog.md)** - Version history and changes
- **[FAQ](docs/faq.md)** - Frequently asked questions

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│         (Business Logic & Application State)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Widget System                           │
│    (Components, Lifecycle, Props, State Management)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Layout Engine                           │
│       (Flexbox Layout, Constraints, Responsive)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rendering Engine                         │
│    (Double Buffering, Differential Rendering, Cells)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Terminal Control                         │
│      (ANSI Codes, Raw Mode, Input/Output, Mouse)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Operating System / Terminal                   │
└─────────────────────────────────────────────────────────────┘
```

## Key Features in Detail

### Terminal Control Layer

The terminal control layer provides low-level terminal manipulation:

- **ANSI Escape Codes** - Comprehensive support for cursor movement, colors, styles, and screen manipulation
- **Raw Mode Management** - Automatic raw mode toggling with signal handling
- **Mouse Tracking** - Support for SGR (1006), UTF-8, and X10 mouse modes
- **Terminal Detection** - Automatic capability detection with fallback handling

### Rendering Engine

High-performance rendering with advanced optimizations:

- **Double Buffering** - Front and back buffers to minimize flicker
- **Differential Rendering** - Only changed cells are sent to the terminal
- **Cell-Based Architecture** - Granular updates at the character level
- **Performance Optimization** - Batched updates and minimal escape sequences

### Layout Engine

Flexible layout system inspired by CSS Flexbox:

- **Flexbox Layout** - Direction, alignment, wrapping, and justification
- **Constraint Resolution** - Automatic size calculation with min/max constraints
- **Responsive Breakpoints** - Adapt layouts to terminal size changes
- **Viewport Management** - Scroll and clip handling

### Event System

Comprehensive event handling for all input types:

- **Keyboard Events** - Full key sequence parsing with modifier support
- **Mouse Events** - Click, drag, scroll, and movement tracking
- **Signal Handling** - SIGWINCH, SIGINT, SIGTERM, and more
- **Event Dispatch** - Priority-based event queue with bubbling

### Widget System

Rich component library with lifecycle management:

- **Built-in Widgets** - Box, Text, Button, Input, List, Table, and more
- **Custom Widgets** - Easy creation of reusable components
- **Lifecycle Hooks** - Mount, update, and unmount callbacks
- **Focus Management** - Tab navigation and focus indicators

### Data Visualization

Real-time data display components:

- **Chart Types** - Line, Bar, Area, Pie, Scatter, Histogram, Heatmap
- **Real-time Updates** - Efficient redraw for streaming data
- **Animations** - Smooth transitions and frame management
- **Canvas API** - Low-level drawing for custom visualizations

### Theme System

Comprehensive theming with TrueColor support:

- **TrueColor (24-bit)** - Full RGB color support
- **Automatic Fallback** - Graceful degradation to 256-color and 16-color
- **Color Manipulation** - Lighten, darken, saturate, mix, and more
- **Predefined Themes** - Dark, light, high contrast, and monochrome

### Accessibility

First-class accessibility support:

- **Screen Reader Support** - ARIA attributes and live regions
- **Keyboard Navigation** - Full keyboard control with shortcuts
- **High Contrast Mode** - Enhanced visibility option
- **WCAG Compliance** - Meets AA and AAA contrast requirements

### Async Task System

Background processing without blocking the UI:

- **Task Queue** - Priority-based task scheduling
- **Worker Threads** - CPU-intensive task offloading
- **Progress Reporting** - Real-time progress updates
- **Cancellation** - Cooperative task cancellation

## Performance

The TUI Framework is designed for high performance:

- **60 FPS Rendering** - Smooth animations and interactions
- **Minimal Memory Usage** - Efficient buffer management and object pooling
- **Differential Updates** - Only changed content is rendered
- **Debounced Events** - High-frequency events are batched
- **Worker Thread Support** - Heavy computations don't block the UI

## Browser Support

The framework works in any terminal that supports:

- ANSI escape codes
- Raw mode (for interactive applications)
- Mouse tracking (optional, for mouse support)

Tested on:

- Terminal.app (macOS)
- iTerm2 (macOS)
- Windows Terminal (Windows)
- GNOME Terminal (Linux)
- Konsole (Linux)
- Alacritty
- WezTerm
- VS Code Integrated Terminal

## Examples

See the [`src/demo/`](src/demo/) directory for comprehensive examples:

- **Dashboard** - Real-time system monitoring dashboard
- **Interactive** - Interactive widget showcase
- **Charts** - Data visualization examples
- **Layout** - Layout system demonstrations
- **Performance** - Performance testing and profiling
- **Theme** - Theme customization examples

Run the demo:

```bash
npm run demo
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Ink](https://github.com/vadimdemedes/ink), [Blessed](https://github.com/chjj/blessed), and [React](https://reactjs.org/)
- Built with modern TypeScript and Node.js best practices
- Designed for production use in demanding terminal applications

---

**Built with ❤️ for the terminal community**