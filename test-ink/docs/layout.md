# Layout Guide

Comprehensive guide to the TUI Framework's layout system, based on CSS Flexbox with adaptations for terminal UIs.

## Table of Contents

- [Introduction](#introduction)
- [Core Concepts](#core-concepts)
- [Flexbox Layout](#flexbox-layout)
- [Layout Nodes](#layout-nodes)
- [Constraints](#constraints)
- [Responsive Design](#responsive-design)
- [Common Layout Patterns](#common-layout-patterns)
- [Performance Optimization](#performance-optimization)
- [Advanced Topics](#advanced-topics)

## Introduction

The TUI Framework's layout engine provides a powerful, flexible system for arranging widgets in the terminal. It's inspired by CSS Flexbox but adapted for the unique constraints of terminal UIs (fixed character grid, no overlapping elements).

### Key Features

- **Flexbox-based**: Familiar layout model for web developers
- **Constraint-based**: Automatic size calculation with min/max constraints
- **Responsive**: Breakpoint-based adaptations to terminal size
- **Efficient**: Smart caching and incremental updates
- **Composable**: Layouts can be nested and combined

## Core Concepts

### Layout Tree

Layouts are organized as a tree structure:

```
Root Container
├── Header (height: 3)
├── Main Content (flex: 1)
│   ├── Sidebar (width: 20)
│   └── Content (flex: 1)
│       ├── Toolbar (height: 1)
│       └── ScrollView (flex: 1)
└── Footer (height: 2)
```

### Coordinate System

```
0,0 ──────────────────────────────────────> X
  │
  │    ┌─────────────────────────┐
  │    │  x,y                    │
  │    │    ┌───────────────┐    │
  │    │    │               │    │
  │    │    │    Content    │    │
  │    │    │               │    │
  │    │    └───────────────┘    │
  │    │              x+w, y+h   │
  │    └─────────────────────────┘
  │
  ▼
  Y
```

- Origin `(0, 0)` is at the top-left
- X increases to the right (columns)
- Y increases downward (rows)
- All coordinates are integers (terminal cells)

### Layout Process

```
┌─────────────────────────────────────────────┐
│           Layout Calculation                │
├─────────────────────────────────────────────┤
│                                             │
│  1. Measure Phase                           │
│     └─> Calculate intrinsic sizes           │
│                                             │
│  2. Layout Phase                            │
│     └─> Distribute available space          │
│                                             │
│  3. Position Phase                          │
│     └─> Calculate final positions           │
│                                             │
│  4. Apply Phase                             │
│     └─> Update node layouts                 │
│                                             │
└─────────────────────────────────────────────┘
```

## Flexbox Layout

### Flex Container

A flex container arranges its children along a main axis.

```typescript
import { FlexContainer, FlexDirection } from 'tui-framework';

const container = new FlexContainer({
  config: {
    direction: FlexDirection.ROW,      // Horizontal layout
    wrap: FlexWrap.NO_WRAP,            // Don't wrap
    justifyContent: JustifyContent.FLEX_START,  // Align at start
    alignItems: AlignItems.STRETCH,    // Stretch to fill
    alignContent: AlignContent.FLEX_START,
    gap: 1,                            // Gap between items
  },
});
```

### Flex Direction

```typescript
enum FlexDirection {
  ROW = 'row',              // Left to right
  ROW_REVERSE = 'row-reverse',  // Right to left
  COLUMN = 'column',        // Top to bottom
  COLUMN_REVERSE = 'column-reverse',  // Bottom to top
}
```

**Visual Examples:**

```
Row:                    Column:
┌──┬──┬──┐             ┌──┐
│A │B │C │             │A │
└──┴──┴──┘             ├──┤
                       │B │
                       ├──┤
                       │C │
                       └──┘
```

### Flex Wrap

```typescript
enum FlexWrap {
  NO_WRAP = 'nowrap',      // Single line
  WRAP = 'wrap',           // Multiple lines, top to bottom
  WRAP_REVERSE = 'wrap-reverse',  // Multiple lines, bottom to top
}
```

**Visual Examples:**

```
No Wrap:                Wrap:
┌──┬──┬──┬──┐          ┌──┬──┬──┐
│A │B │C │D │          │A │B │C │
└──┴──┴──┴──┘          ├──┼──┼──┤
 (may overflow)        │D │E │F │
                       └──┴──┴──┘
```

### Justify Content

Controls alignment along the main axis:

```typescript
enum JustifyContent {
  FLEX_START = 'flex-start',    // Align to start
  FLEX_END = 'flex-end',        // Align to end
  CENTER = 'center',            // Center
  SPACE_BETWEEN = 'space-between',  // Space between items
  SPACE_AROUND = 'space-around',    // Space around items
  SPACE_EVENLY = 'space-evenly',    // Even spacing
}
```

**Visual Examples:**

```
flex-start:             flex-end:
┌──┬──┬──┐              ┌────────┬──┬──┐
│A │B │C │              │        │A │B │C │
└──┴──┴──┘              └────────┴──┴──┘

center:                 space-between:
┌──────┬──┬──┐          ┌──┬────────┬──┐
│      │A │B │C │       │A │        │B │C │
└──────┴──┴──┘          └──┴────────┴──┘

space-around:           space-evenly:
┌──┬──┬──┬──┐          ┌──┬──┬──┬──┐
│ A│  B│  C│           │ A│ B│ C│  │
└──┴──┴──┴──┘          └──┴──┴──┴──┘
```

### Align Items

Controls alignment along the cross axis:

```typescript
enum AlignItems {
  FLEX_START = 'flex-start',  // Align to cross-start
  FLEX_END = 'flex-end',      // Align to cross-end
  CENTER = 'center',          // Center on cross axis
  STRETCH = 'stretch',        // Stretch to fill
  BASELINE = 'baseline',      // Align baselines
}
```

**Visual Examples:**

```
stretch (default):      flex-start:
┌──┬──┬──┐              ┌──┬──┬──┐
│A │  │  │              │A │  │  │
│A │B │  │              │  │B │  │
│A │B │C │              │  │  │C │
│A │B │C │              │  │  │C │
└──┴──┴──┘              └──┴──┴──┘

center:                 flex-end:
┌──┬──┬──┐              ┌──┬──┬──┐
│  │  │  │              │  │  │C │
│A │  │  │              │  │B │C │
│  │B │  │              │A │B │C │
│  │  │C │              │  │  │C │
└──┴──┴──┘              └──┴──┴──┘
```

### Flex Item Properties

```typescript
interface FlexItemProperties {
  // Size
  width?: number | 'auto';
  height?: number | 'auto';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  
  // Flex
  flex?: number;           // Grow factor
  flexGrow?: number;       // Same as flex
  flexShrink?: number;     // Shrink factor
  flexBasis?: number | 'auto';  // Base size
  
  // Alignment
  alignSelf?: AlignItems;  // Override container alignItems
  
  // Spacing
  margin?: number | EdgeInsets;
  padding?: number | EdgeInsets;
}
```

**Flex Grow Example:**

```typescript
const container = new FlexContainer({
  config: { direction: FlexDirection.ROW },
});

// Item A: fixed width
const itemA = new LayoutNode({
  style: { width: 10 },
});

// Item B: takes remaining space
const itemB = new LayoutNode({
  style: { flex: 1 },
});

// Item C: takes half of remaining space
const itemC = new LayoutNode({
  style: { flex: 0.5 },
});

container.addChild(itemA);
container.addChild(itemB);
container.addChild(itemC);
```

```
Total width: 60
┌──────────┬─────────────────────┬──────────┐
│    A     │          B          │    C     │
│  (10)    │       (33.3)        │  (16.7)  │
└──────────┴─────────────────────┴──────────┘
```

## Layout Nodes

### Creating Layout Nodes

```typescript
import { LayoutNode, FlexContainer } from 'tui-framework';

// Simple node with fixed size
const fixedNode = new LayoutNode({
  id: 'fixed',
  style: {
    width: 20,
    height: 10,
  },
});

// Flexible node
const flexNode = new LayoutNode({
  id: 'flex',
  style: {
    flex: 1,
    minWidth: 10,
  },
});

// Node with custom measure function
const textNode = new LayoutNode({
  id: 'text',
  measureFn: (constraints) => {
    // Calculate size based on text content
    const textWidth = Math.min(text.length, constraints.maxWidth || Infinity);
    const textHeight = Math.ceil(text.length / textWidth);
    
    return {
      width: textWidth,
      height: textHeight,
    };
  },
});
```

### Node Hierarchy

```typescript
// Build a complex layout
const root = new FlexContainer({
  config: {
    direction: FlexDirection.COLUMN,
  },
});

const header = new LayoutNode({
  style: { height: 3 },
});

const main = new FlexContainer({
  config: {
    direction: FlexDirection.ROW,
    flex: 1,
  },
});

const sidebar = new LayoutNode({
  style: { width: 20 },
});

const content = new LayoutNode({
  style: { flex: 1 },
});

main.addChild(sidebar);
main.addChild(content);

root.addChild(header);
root.addChild(main);
```

### Computed Layout

After calculation, access the computed layout:

```typescript
const engine = new LayoutEngine();
engine.setRoot(root);
engine.calculateLayout({ width: 80, height: 24 });

// Get computed layout for any node
const layout = content.getComputedLayout();
console.log(layout); // { x: 20, y: 3, width: 60, height: 21 }
```

## Constraints

### Constraint Types

```typescript
interface Constraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}
```

### Constraint Resolution

```typescript
// Tight constraints (exact size)
const tightConstraints: Constraints = {
  minWidth: 80,
  maxWidth: 80,
  minHeight: 24,
  maxHeight: 24,
};

// Loose constraints (bounded)
const looseConstraints: Constraints = {
  maxWidth: 100,
  maxHeight: 50,
};

// Unbounded (use intrinsic size)
const unboundedConstraints: Constraints = {};
```

### Constraint Propagation

```
Parent Constraints                    Child Constraints
┌─────────────────────────┐          ┌─────────────────────────┐
│  maxWidth: 100          │          │  maxWidth: 50           │
│  maxHeight: 50          │─────────>│  maxHeight: 50          │
│                         │          │                         │
│  ┌─────────────────┐    │          │  ┌─────────────────┐    │
│  │  Child          │    │          │  │                 │    │
│  │  width: 50      │    │          │  │                 │    │
│  └─────────────────┘    │          │  └─────────────────┘    │
└─────────────────────────┘          └─────────────────────────┘
```

## Responsive Design

### Breakpoints

```typescript
import { ResponsiveLayout, Breakpoint } from 'tui-framework';

const breakpoints: Breakpoint[] = [
  { name: 'mobile', maxWidth: 40 },
  { name: 'tablet', minWidth: 41, maxWidth: 80 },
  { name: 'desktop', minWidth: 81 },
];

const responsive = new ResponsiveLayout({
  breakpoints,
  defaultLayout: 'desktop',
});

// Define layouts for each breakpoint
responsive.define('mobile', () => {
  return column({
    children: [
      header(),
      content(),
      sidebar(),
    ],
  });
});

responsive.define('desktop', () => {
  return column({
    children: [
      header(),
      row({
        children: [
          sidebar({ width: 20 }),
          content({ flex: 1 }),
        ],
      }),
    ],
  });
});
```

### Responsive Behavior

```typescript
class ResponsiveWidget implements Widget {
  private currentLayout?: LayoutNode;
  
  onResize(size: TerminalSize) {
    // Recalculate layout based on new size
    const newLayout = this.responsive.getLayout(size.width);
    
    if (newLayout !== this.currentLayout) {
      this.currentLayout = newLayout;
      this.render();
    }
  }
}
```

### Adaptive Components

```typescript
function AdaptiveSidebar(props: { width: number }): Widget {
  if (props.width < 60) {
    // Collapsed: show icons only
    return new CollapsedSidebar();
  } else if (props.width < 100) {
    // Compact: show icons + short labels
    return new CompactSidebar();
  } else {
    // Full: show icons + full labels
    return new FullSidebar();
  }
}
```

## Common Layout Patterns

### 1. Header-Content-Footer

```typescript
function HeaderContentFooter(props: {
  header: Widget;
  content: Widget;
  footer: Widget;
}): LayoutNode {
  return column({
    children: [
      container({ height: 3, children: [props.header] }),
      container({ flex: 1, children: [props.content] }),
      container({ height: 2, children: [props.footer] }),
    ],
  });
}
```

```
┌──────────────────────────────┐
│           Header             │  height: 3
├──────────────────────────────┤
│                              │
│          Content             │  flex: 1
│                              │
├──────────────────────────────┤
│           Footer             │  height: 2
└──────────────────────────────┘
```

### 2. Sidebar Layout

```typescript
function SidebarLayout(props: {
  sidebar: Widget;
  content: Widget;
  sidebarWidth?: number;
}): LayoutNode {
  return row({
    children: [
      container({
        width: props.sidebarWidth || 20,
        children: [props.sidebar],
      }),
      container({
        flex: 1,
        children: [props.content],
      }),
    ],
  });
}
```

```
┌────────┬─────────────────────┐
│        │                     │
│Sidebar │      Content        │
│ (20)   │      (flex: 1)      │
│        │                     │
└────────┴─────────────────────┘
```

### 3. Grid Layout

```typescript
function GridLayout(props: {
  items: Widget[];
  columns: number;
  gap?: number;
}): LayoutNode {
  const rows: LayoutNode[] = [];
  
  for (let i = 0; i < props.items.length; i += props.columns) {
    const rowItems = props.items.slice(i, i + props.columns);
    
    rows.push(
      row({
        gap: props.gap,
        children: rowItems.map((item) =>
          container({ flex: 1, children: [item] })
        ),
      })
    );
  }
  
  return column({
    gap: props.gap,
    children: rows,
  });
}
```

```
┌────────┬────────┬────────┐
│ Item 1 │ Item 2 │ Item 3 │
├────────┼────────┼────────┤
│ Item 4 │ Item 5 │ Item 6 │
├────────┼────────┼────────┤
│ Item 7 │ Item 8 │        │
└────────┴────────┴────────┘
```

### 4. Split Pane

```typescript
function SplitPane(props: {
  left: Widget;
  right: Widget;
  splitRatio?: number; // 0.0 to 1.0
}): LayoutNode {
  const ratio = props.splitRatio || 0.5;
  
  return row({
    children: [
      container({
        flex: ratio,
        children: [props.left],
      }),
      container({
        flex: 1 - ratio,
        children: [props.right],
      }),
    ],
  });
}
```

```
┌──────────────────┬───────────────┐
│                  │               │
│      Left        │     Right     │
│    (ratio: 0.6)  │  (ratio: 0.4) │
│                  │               │
└──────────────────┴───────────────┘
```

### 5. Centered Content

```typescript
function CenteredContent(props: {
  content: Widget;
  minPadding?: number;
}): LayoutNode {
  return container({
    style: {
      justifyContent: JustifyContent.CENTER,
      alignItems: AlignItems.CENTER,
    },
    children: [
      container({
        margin: props.minPadding || 2,
        children: [props.content],
      }),
    ],
  });
}
```

```
┌──────────────────────────────┐
│                              │
│                              │
│        ┌──────────┐          │
│        │ Content  │          │
│        └──────────┘          │
│                              │
│                              │
└──────────────────────────────┘
```

### 6. Card Layout

```typescript
function CardLayout(props: {
  cards: Widget[];
  maxWidth?: number;
}): LayoutNode {
  return wrap({
    gap: 1,
    children: props.cards.map((card) =>
      container({
        maxWidth: props.maxWidth || 30,
        children: [card],
      })
    ),
  });
}
```

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Card 1  │ │  Card 2  │ │  Card 3  │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│  Card 4  │ │  Card 5  │
└──────────┘ └──────────┘
```

### 7. Form Layout

```typescript
function FormLayout(props: {
  fields: { label: string; input: Widget }[];
}): LayoutNode {
  return column({
    gap: 1,
    children: props.fields.map((field) =>
      row({
        gap: 2,
        children: [
          container({
            width: 15,
            children: [new Text({ content: field.label })],
          }),
          container({
            flex: 1,
            children: [field.input],
          }),
        ],
      })
    ),
  });
}
```

```
Name:    [Input field          ]
Email:   [Input field          ]
Phone:   [Input field          ]
Address: [Input field          ]
```

## Performance Optimization

### Layout Caching

```typescript
class OptimizedLayoutEngine extends LayoutEngine {
  private cache = new Map<string, ComputedLayout>();
  
  calculateLayout(root: LayoutNode, constraints: Constraints): void {
    const cacheKey = this.getCacheKey(root, constraints);
    
    if (this.cache.has(cacheKey)) {
      // Use cached layout
      root.setComputedLayout(this.cache.get(cacheKey)!);
      return;
    }
    
    // Calculate and cache
    super.calculateLayout(root, constraints);
    this.cache.set(cacheKey, root.getComputedLayout());
  }
  
  invalidateCache(nodeId?: string): void {
    if (nodeId) {
      // Invalidate specific node and children
      for (const key of this.cache.keys()) {
        if (key.startsWith(nodeId)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Invalidate all
      this.cache.clear();
    }
  }
}
```

### Incremental Layout

```typescript
class IncrementalLayoutEngine extends LayoutEngine {
  private dirtyNodes = new Set<LayoutNode>();
  
  markDirty(node: LayoutNode): void {
    this.dirtyNodes.add(node);
    
    // Mark parents as dirty
    let parent = node.getParent();
    while (parent) {
      this.dirtyNodes.add(parent);
      parent = parent.getParent();
    }
  }
  
  calculateLayout(root: LayoutNode, constraints: Constraints): void {
    // Only recalculate dirty nodes
    for (const node of this.dirtyNodes) {
      this.calculateNodeLayout(node);
    }
    
    this.dirtyNodes.clear();
  }
}
```

### Layout Throttling

```typescript
class ThrottledLayout extends EventEmitter {
  private pendingLayout = false;
  private throttledCalculate: () => void;
  
  constructor(private engine: LayoutEngine) {
    super();
    
    this.throttledCalculate = throttle(() => {
      this.engine.calculateLayout();
      this.pendingLayout = false;
      this.emit('layout');
    }, 16); // Max ~60fps
  }
  
  requestLayout(): void {
    if (!this.pendingLayout) {
      this.pendingLayout = true;
      this.throttledCalculate();
    }
  }
}
```

## Advanced Topics

### Custom Layout Algorithms

```typescript
class MasonryLayout implements LayoutAlgorithm {
  calculate(nodes: LayoutNode[], constraints: Constraints): void {
    const columns = this.calculateColumnCount(constraints.maxWidth);
    const columnHeights = new Array(columns).fill(0);
    const columnWidth = Math.floor(constraints.maxWidth! / columns);
    
    for (const node of nodes) {
      // Find shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Position node
      const x = shortestColumn * columnWidth;
      const y = columnHeights[shortestColumn];
      
      node.setPosition(x, y);
      
      // Update column height
      columnHeights[shortestColumn] += node.getHeight();
    }
  }
  
  private calculateColumnCount(width: number): number {
    if (width < 40) return 1;
    if (width < 80) return 2;
    return 3;
  }
}
```

### Aspect Ratio

```typescript
function AspectRatioContainer(props: {
  ratio: number; // width / height
  children: Widget;
}): LayoutNode {
  return new LayoutNode({
    measureFn: (constraints) => {
      let width = constraints.maxWidth || 100;
      let height = width / props.ratio;
      
      if (constraints.maxHeight && height > constraints.maxHeight) {
        height = constraints.maxHeight;
        width = height * props.ratio;
      }
      
      return { width, height };
    },
  });
}
```

### Overflow Handling

```typescript
function OverflowContainer(props: {
  children: Widget;
  overflow?: 'visible' | 'hidden' | 'scroll';
}): LayoutNode {
  const container = new LayoutNode({
    style: {
      overflow: props.overflow || 'hidden',
    },
  });
  
  if (props.overflow === 'scroll') {
    // Add scroll handling
    container.setScrollable(true);
  }
  
  return container;
}
```

### Z-Index (Layering)

While terminals don't support true overlapping, you can simulate layers:

```typescript
class LayeredContainer implements Widget {
  private layers: Map<number, Widget[]> = new Map();
  
  addToLayer(widget: Widget, layer: number): void {
    if (!this.layers.has(layer)) {
      this.layers.set(layer, []);
    }
    this.layers.get(layer)!.push(widget);
  }
  
  render(ctx: RenderContext): void {
    // Render layers in order
    const sortedLayers = Array.from(this.layers.keys()).sort();
    
    for (const layer of sortedLayers) {
      for (const widget of this.layers.get(layer)!) {
        widget.render(ctx);
      }
    }
  }
}
```

### Animation Support

```typescript
class AnimatedLayout implements Widget {
  private currentLayout: ComputedLayout;
  private targetLayout: ComputedLayout;
  private animation: Animation;
  
  animateTo(newLayout: ComputedLayout): void {
    this.targetLayout = newLayout;
    
    this.animation = new Animation({
      duration: 300,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        this.currentLayout = interpolateLayout(
          this.currentLayout,
          this.targetLayout,
          progress
        );
      },
    });
    
    this.animation.play();
  }
}

function interpolateLayout(
  from: ComputedLayout,
  to: ComputedLayout,
  progress: number
): ComputedLayout {
  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
    width: lerp(from.width, to.width, progress),
    height: lerp(from.height, to.height, progress),
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
```

This guide covers the essential aspects of the TUI Framework's layout system. For more examples and advanced patterns, see the demo applications and API reference.