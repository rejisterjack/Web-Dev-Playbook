# Migration Guide

Guide for migrating to the TUI Framework from other terminal UI libraries and between framework versions.

## Table of Contents

- [Migrating from Ink](#migrating-from-ink)
- [Migrating from Blessed](#migrating-from-blessed)
- [Migrating from Oclif](#migrating-from-oclif)
- [Migrating from Commander.js](#migrating-from-commanderjs)
- [Version Compatibility](#version-compatibility)
- [Breaking Changes](#breaking-changes)

## Migrating from Ink

### Key Differences

| Feature | Ink | TUI Framework |
|---------|-----|---------------|
| Architecture | React-based | Layered architecture |
| Rendering | React reconciliation | Double-buffered differential |
| Layout | Flexbox via Yoga | Native Flexbox engine |
| Styling | CSS-like | Programmatic |
| State | React hooks | Props/State pattern |

### Component Migration

```typescript
// Ink component
import { Box, Text, useInput } from 'ink';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  useInput((input, key) => {
    if (input === 'q') {
      process.exit();
    }
    if (key.upArrow) {
      setCount(c => c + 1);
    }
  });
  
  return (
    <Box flexDirection="column">
      <Text>Count: {count}</Text>
      <Text dimColor>Press q to quit, up arrow to increment</Text>
    </Box>
  );
};

// TUI Framework equivalent
import { VStack, Text, EventLoop } from 'tui-framework';

class CounterWidget implements Widget {
  private count = 0;
  private eventLoop: EventLoop;
  
  mount() {
    this.eventLoop = new EventLoop();
    this.eventLoop.on('key', (event) => {
      if (event.key === 'q') {
        this.eventLoop.stop();
      }
      if (event.key === 'up') {
        this.count++;
        this.render();
      }
    });
    this.eventLoop.start();
  }
  
  render(ctx: RenderContext) {
    const stack = new VStack({
      children: [
        new Text({ content: `Count: ${this.count}` }),
        new Text({ 
          content: 'Press q to quit, up arrow to increment',
          dim: true 
        }),
      ],
    });
    
    stack.render(ctx, 0, 0);
  }
}
```

### Styling Migration

```typescript
// Ink styling
<Box 
  borderStyle="round" 
  borderColor="green"
  padding={1}
>
  <Text color="blue" bold>Hello</Text>
</Box>

// TUI Framework styling
new Box({
  border: true,
  borderStyle: 'round',
  borderColor: { rgb: [0, 255, 0] },
  padding: 1,
  children: [
    new Text({ 
      content: 'Hello',
      color: { rgb: [0, 0, 255] },
      bold: true 
    }),
  ],
});
```

### Hooks Migration

```typescript
// Ink useApp hook
import { useApp } from 'ink';

const MyComponent = () => {
  const { exit } = useApp();
  
  useInput((input) => {
    if (input === 'q') {
      exit();
    }
  });
};

// TUI Framework equivalent
class MyWidget implements Widget {
  private eventLoop: EventLoop;
  
  mount() {
    this.eventLoop = new EventLoop();
    this.eventLoop.on('key', (event) => {
      if (event.key === 'q') {
        this.exit();
      }
    });
  }
  
  exit() {
    this.eventLoop.stop();
    // Cleanup
  }
}
```

## Migrating from Blessed

### Key Differences

| Feature | Blessed | TUI Framework |
|---------|---------|---------------|
| API Style | Callback-based | Event-driven |
| Layout | Absolute + Box model | Flexbox |
| Rendering | Immediate | Buffered |
| Mouse | Built-in | Optional |
| Widgets | Rich set | Composable |

### Widget Migration

```typescript
// Blessed widget
const blessed = require('blessed');

const screen = blessed.screen({
  smartCSR: true,
});

const box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello {bold}world{/bold}!',
  tags: true,
  border: {
    type: 'line',
  },
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0',
    },
  },
});

screen.append(box);
screen.key(['escape', 'q'], () => process.exit(0));
screen.render();

// TUI Framework equivalent
import { 
  Renderer, 
  LayoutEngine, 
  EventLoop,
  Box,
  Text,
  center,
  rgb,
} from 'tui-framework';

class BlessedMigration {
  private renderer: Renderer;
  private eventLoop: EventLoop;
  
  async start() {
    this.renderer = new Renderer({
      width: process.stdout.columns,
      height: process.stdout.rows,
    });
    
    this.eventLoop = new EventLoop();
    this.eventLoop.on('key', (event) => {
      if (event.key === 'escape' || event.key === 'q') {
        this.exit();
      }
    });
    
    await this.eventLoop.start();
    this.render();
  }
  
  render() {
    const buffer = this.renderer.getBackBuffer();
    const ctx = createRenderContext(buffer);
    
    // Centered box
    const boxWidth = Math.floor(ctx.width * 0.5);
    const boxHeight = Math.floor(ctx.height * 0.5);
    const x = Math.floor((ctx.width - boxWidth) / 2);
    const y = Math.floor((ctx.height - boxHeight) / 2);
    
    const box = new Box({
      width: boxWidth,
      height: boxHeight,
      border: true,
      backgroundColor: { rgb: [255, 0, 255] },
      borderColor: { rgb: [240, 240, 240] },
      children: [
        new Text({ 
          content: 'Hello ',
          color: { rgb: [255, 255, 255] },
        }),
        new Text({ 
          content: 'world',
          color: { rgb: [255, 255, 255] },
          bold: true,
        }),
        new Text({ 
          content: '!',
          color: { rgb: [255, 255, 255] },
        }),
      ],
    });
    
    box.render(ctx, x, y);
    this.renderer.render();
  }
  
  exit() {
    this.eventLoop.stop();
    process.exit(0);
  }
}
```

### Event Handling Migration

```typescript
// Blessed events
box.on('click', (data) => {
  box.setContent('Clicked!');
  screen.render();
});

box.key('enter', () => {
  box.setContent('Enter pressed!');
  screen.render();
});

// TUI Framework events
class ClickableBox extends Box {
  onMouse(event: MouseEvent): boolean {
    if (event.action === MouseAction.PRESS && this.contains(event.x, event.y)) {
      this.setContent('Clicked!');
      this.render();
      return true;
    }
    return false;
  }
  
  onKey(event: KeyEvent): boolean {
    if (event.key === 'return' && this.focused) {
      this.setContent('Enter pressed!');
      this.render();
      return true;
    }
    return false;
  }
}
```

## Migrating from Oclif

### Key Differences

| Feature | Oclif | TUI Framework |
|---------|-------|---------------|
| Type | CLI framework | TUI framework |
| Output | Static text | Interactive UI |
| Commands | Class-based | Event-driven |
| Plugins | Built-in | Manual integration |

### Command Migration

```typescript
// Oclif command
import { Command, Flags } from '@oclif/core';

export default class HelloCommand extends Command {
  static flags = {
    name: Flags.string({ char: 'n', description: 'Name to greet' }),
  };
  
  async run() {
    const { flags } = await this.parse(HelloCommand);
    const name = flags.name ?? 'world';
    this.log(`Hello ${name}!`);
  }
}

// TUI Framework equivalent
import { CLI, Command } from 'tui-framework';

const cli = new CLI({
  name: 'myapp',
  description: 'My TUI application',
});

cli.command({
  name: 'hello',
  description: 'Greet someone',
  flags: [
    { name: 'name', char: 'n', type: 'string', default: 'world' },
  ],
  action: async (args, flags) => {
    // Can use TUI features
    const app = new InteractiveApp();
    await app.greet(flags.name);
  },
});

cli.run();
```

### Interactive Commands

```typescript
// Extend Oclif with TUI
import { Command } from '@oclif/core';
import { InteractiveApp } from './app';

export default class InteractiveCommand extends Command {
  async run() {
    // Start TUI instead of CLI output
    const app = new InteractiveApp();
    
    try {
      await app.start();
    } finally {
      await app.cleanup();
    }
  }
}
```

## Migrating from Commander.js

### Key Differences

| Feature | Commander | TUI Framework |
|---------|-----------|---------------|
| Type | CLI parser | TUI framework |
| Output | Static | Interactive |
| Actions | Callbacks | Event-driven |

### Command Migration

```typescript
// Commander.js
import { Command } from 'commander';

const program = new Command();

program
  .name('myapp')
  .description('My application')
  .version('1.0.0');

program
  .command('list')
  .description('List items')
  .option('-a, --all', 'Show all items')
  .action((options) => {
    console.log('Listing items...');
    if (options.all) {
      console.log('Showing all items');
    }
  });

program.parse();

// TUI Framework equivalent
import { CLI, InteractiveList } from 'tui-framework';

const cli = new CLI({
  name: 'myapp',
  description: 'My application',
  version: '1.0.0',
});

cli.command({
  name: 'list',
  description: 'List items interactively',
  flags: [
    { name: 'all', char: 'a', type: 'boolean', default: false },
  ],
  action: async (args, flags) => {
    const list = new InteractiveList({
      showAll: flags.all,
    });
    
    await list.run();
  },
});

cli.run();
```

## Version Compatibility

### Semantic Versioning

The TUI Framework follows semantic versioning (SemVer):

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Compatibility Table

| Framework Version | Node.js | TypeScript | Features |
|-------------------|---------|------------|----------|
| 1.0.x | >= 16.0 | >= 4.5 | Core features |
| 1.1.x | >= 16.0 | >= 4.5 | + Widgets |
| 1.2.x | >= 16.0 | >= 4.5 | + Visualization |
| 2.0.x | >= 18.0 | >= 5.0 | Breaking changes |

### Deprecation Policy

1. **Deprecation Warning**: Features marked deprecated in version N
2. **Grace Period**: Still functional in version N+1
3. **Removal**: Removed in version N+2

```typescript
// Deprecated in 1.5.0
/** @deprecated Use newMethod() instead */
oldMethod() {
  console.warn('oldMethod() is deprecated. Use newMethod() instead.');
  return this.newMethod();
}
```

## Breaking Changes

### Version 2.0.0

#### Event System Refactor

```typescript
// Before (1.x)
eventLoop.onKey((key) => {
  // Handle key
});

// After (2.x)
eventLoop.on('key', (event: KeyEvent) => {
  // Handle key
});
```

#### Color API Changes

```typescript
// Before (1.x)
const color = new Color('#ff0000');

// After (2.x)
const color = hex('#ff0000');
// or
const color: RGBColor = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
```

#### Widget Lifecycle

```typescript
// Before (1.x)
class MyWidget {
  constructor() {
    this.initialize();
  }
  
  render() {
    // Render
  }
}

// After (2.x)
class MyWidget implements Widget {
  mount() {
    // Initialize
  }
  
  render(ctx: RenderContext) {
    // Render
  }
  
  unmount() {
    // Cleanup
  }
}
```

### Migration Script

```typescript
// migrate-v1-to-v2.ts
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const migrations = [
  {
    pattern: /eventLoop\.onKey\(/g,
    replacement: 'eventLoop.on(\'key\', ',
  },
  {
    pattern: /new Color\(/g,
    replacement: 'hex(',
  },
  {
    pattern: /class (\w+) \{/g,
    replacement: 'class $1 implements Widget {',
  },
];

function migrateFile(filePath: string): void {
  let content = readFileSync(filePath, 'utf-8');
  
  for (const { pattern, replacement } of migrations) {
    content = content.replace(pattern, replacement);
  }
  
  writeFileSync(filePath, content);
  console.log(`Migrated: ${filePath}`);
}

function migrateDirectory(dir: string): void {
  const files = readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const path = join(dir, file.name);
    
    if (file.isDirectory()) {
      migrateDirectory(path);
    } else if (file.name.endsWith('.ts')) {
      migrateFile(path);
    }
  }
}

// Run migration
migrateDirectory('./src');
```

### Version Upgrade Checklist

- [ ] Review CHANGELOG for breaking changes
- [ ] Update package.json version constraint
- [ ] Run migration script if available
- [ ] Update type imports
- [ ] Test all interactive features
- [ ] Verify accessibility features
- [ ] Check performance metrics
- [ ] Update documentation

### Compatibility Layer

```typescript
// compatibility.ts
import { EventLoop as NewEventLoop, KeyEvent } from 'tui-framework';

/** @deprecated Use EventLoop from 'tui-framework' directly */
export class EventLoop {
  private loop: NewEventLoop;
  
  constructor() {
    this.loop = new NewEventLoop();
  }
  
  onKey(handler: (key: string) => void): void {
    console.warn('onKey() is deprecated. Use on(\'key\', handler) instead.');
    this.loop.on('key', (event: KeyEvent) => {
      handler(event.key);
    });
  }
  
  // Delegate other methods
  start() { return this.loop.start(); }
  stop() { return this.loop.stop(); }
}
```

This migration guide helps you transition to the TUI Framework from other libraries and between versions. For specific migration questions, see the [FAQ](faq.md) or open an issue on GitHub.