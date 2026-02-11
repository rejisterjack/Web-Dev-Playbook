# Widget Guide

Comprehensive guide to using and creating widgets in the TUI Framework.

## Table of Contents

- [Introduction](#introduction)
- [Built-in Widgets](#built-in-widgets)
- [Widget Lifecycle](#widget-lifecycle)
- [Props and State](#props-and-state)
- [Event Handling](#event-handling)
- [Custom Widgets](#custom-widgets)
- [Widget Composition](#widget-composition)
- [Focus Management](#focus-management)
- [Best Practices](#best-practices)

## Introduction

Widgets are the building blocks of TUI applications. They encapsulate visual presentation, behavior, and state. The TUI Framework provides a rich set of built-in widgets and a powerful system for creating custom widgets.

### Widget Philosophy

- **Single Responsibility**: Each widget should do one thing well
- **Composability**: Widgets can be composed to create complex UIs
- **Controlled vs Uncontrolled**: Widgets can be controlled (props-driven) or uncontrolled (state-driven)
- **Accessibility First**: All widgets include accessibility support by default

## Built-in Widgets

### Container Widgets

#### Box

A basic container with optional border and background.

```typescript
interface BoxProps {
  // Layout
  width?: number | 'auto' | '100%';
  height?: number | 'auto' | '100%';
  padding?: number | EdgeInsets;
  margin?: number | EdgeInsets;
  
  // Appearance
  border?: boolean;
  borderStyle?: 'single' | 'double' | 'round' | 'bold';
  borderColor?: Color;
  backgroundColor?: Color;
  
  // Content
  children?: Widget[];
  
  // Events
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Usage
const box = new Box({
  width: 40,
  height: 10,
  border: true,
  borderStyle: 'round',
  borderColor: { rgb: [100, 100, 100] },
  padding: 1,
  children: [
    new Text({ content: 'Content inside box' }),
  ],
});
```

**Visual Examples:**

```
┌────────────────────────────┐  // single (default)
│ Content inside box         │
└────────────────────────────┘

╔════════════════════════════╗  // double
║ Content inside box         ║
╚════════════════════════════╝

╭────────────────────────────╮  // round
│ Content inside box         │
╰────────────────────────────╯

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  // bold
┃ Content inside box         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

#### Stack

Arranges children in a vertical or horizontal stack.

```typescript
interface StackProps {
  direction?: 'vertical' | 'horizontal';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  children?: Widget[];
}

// Vertical Stack (VStack)
const vstack = new VStack({
  gap: 1,
  children: [
    new Text({ content: 'Item 1' }),
    new Text({ content: 'Item 2' }),
    new Text({ content: 'Item 3' }),
  ],
});

// Horizontal Stack (HStack)
const hstack = new HStack({
  gap: 2,
  align: 'center',
  children: [
    new Text({ content: 'Left' }),
    new Text({ content: 'Center' }),
    new Text({ content: 'Right' }),
  ],
});
```

#### ScrollView

Scrollable container for content larger than its bounds.

```typescript
interface ScrollViewProps {
  width: number;
  height: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  scrollbar?: boolean;
  scrollbarStyle?: 'line' | 'block';
  children?: Widget[];
  
  // Scroll control
  scrollX?: number;
  scrollY?: number;
  onScroll?: (x: number, y: number) => void;
}

// Usage
const scrollView = new ScrollView({
  width: 40,
  height: 10,
  direction: 'vertical',
  scrollbar: true,
  children: [
    // Many items...
  ],
});

// Programmatic scrolling
scrollView.scrollTo(0, 50);
scrollView.scrollBy(0, 5);
```

### Content Widgets

#### Text

Displays text with styling options.

```typescript
interface TextProps {
  content: string;
  
  // Styling
  color?: Color;
  backgroundColor?: Color;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dim?: boolean;
  blink?: boolean;
  reverse?: boolean;
  
  // Layout
  width?: number;
  maxLines?: number;
  wrap?: 'wrap' | 'nowrap' | 'truncate' | 'truncate-middle' | 'ellipsis';
  align?: 'left' | 'center' | 'right';
  
  // Truncation
  ellipsis?: string;
}

// Usage examples
new Text({ content: 'Plain text' });

new Text({
  content: 'Styled text',
  bold: true,
  color: { rgb: [0, 255, 0] },
});

new Text({
  content: 'This is a very long text that will wrap',
  width: 20,
  wrap: 'wrap',
});

new Text({
  content: 'Truncated text',
  width: 10,
  wrap: 'ellipsis',
});
```

#### MultilineText

Displays multiline text with advanced formatting.

```typescript
interface MultilineTextProps {
  content: string;
  width?: number;
  height?: number;
  
  // Formatting
  preserveWhitespace?: boolean;
  trimTrailingWhitespace?: boolean;
  
  // Styling (per-line or global)
  styles?: TextStyle | TextStyle[];
  
  // Line numbers
  lineNumbers?: boolean;
  lineNumberWidth?: number;
  lineNumberColor?: Color;
}

// Usage
new MultilineText({
  content: `Line 1
Line 2
Line 3`,
  lineNumbers: true,
  lineNumberColor: { rgb: [100, 100, 100] },
});
```

### Input Widgets

#### Button

Clickable button with various styles.

```typescript
interface ButtonProps {
  label: string;
  
  // State
  disabled?: boolean;
  focused?: boolean;
  pressed?: boolean;
  
  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  
  // Events
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Accessibility
  ariaLabel?: string;
}

// Usage
new Button({
  label: 'Click Me',
  variant: 'primary',
  onClick: () => console.log('Clicked!'),
});

new Button({
  label: 'Danger',
  variant: 'danger',
  disabled: true,
});
```

**Visual Examples:**

```
┌────────────┐  // default
│ Click Me   │
└────────────┘

┌────────────┐  // primary (accent color)
│ Click Me   │
└────────────┘

┌────────────┐  // disabled
│ Click Me   │  (dimmed)
└────────────┘
```

#### TextInput

Single-line text input field.

```typescript
interface TextInputProps {
  // Value
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  
  // Behavior
  password?: boolean;
  maxLength?: number;
  
  // Appearance
  width?: number;
  
  // Events
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Validation
  validate?: (value: string) => boolean | string;
}

// Usage
new TextInput({
  placeholder: 'Enter your name...',
  width: 30,
  onChange: (value) => console.log('Value:', value),
  onSubmit: (value) => console.log('Submitted:', value),
});

new TextInput({
  password: true,
  placeholder: 'Password',
});
```

#### TextArea

Multi-line text input.

```typescript
interface TextAreaProps extends TextInputProps {
  height?: number;
  
  // Scrolling
  scrollOnOverflow?: boolean;
  
  // Line handling
  allowNewlines?: boolean;
  tabSize?: number;
}

// Usage
new TextArea({
  width: 40,
  height: 5,
  placeholder: 'Enter description...',
});
```

#### Checkbox

Toggle checkbox.

```typescript
interface CheckboxProps {
  // State
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  
  // Label
  label?: string;
  labelPosition?: 'left' | 'right';
  
  // Behavior
  disabled?: boolean;
  
  // Events
  onChange?: (checked: boolean) => void;
  
  // Appearance
  checkedChar?: string;
  uncheckedChar?: string;
}

// Usage
new Checkbox({
  label: 'Enable feature',
  checked: true,
  onChange: (checked) => console.log('Checked:', checked),
});
```

**Visual Examples:**

```
[✓] Enable feature    // checked
[ ] Enable feature    // unchecked
[-] Enable feature    // indeterminate
```

#### Radio

Radio button for single selection.

```typescript
interface RadioProps {
  // State
  selected?: boolean;
  
  // Label
  label?: string;
  labelPosition?: 'left' | 'right';
  
  // Behavior
  disabled?: boolean;
  name?: string; // Radio group name
  
  // Events
  onSelect?: () => void;
  
  // Appearance
  selectedChar?: string;
  unselectedChar?: string;
}

// Usage
new Radio({
  label: 'Option 1',
  selected: true,
  name: 'group1',
});
```

**Visual Examples:**

```
(●) Option 1    // selected
(○) Option 2    // unselected
```

#### Select/Dropdown

Single selection from a list.

```typescript
interface SelectProps {
  // Options
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  
  // Behavior
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  
  // Appearance
  width?: number;
  maxHeight?: number;
  
  // Events
  onChange?: (value: string, option: SelectOption) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Usage
new Select({
  options: [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3', disabled: true },
  ],
  placeholder: 'Select an option...',
  onChange: (value) => console.log('Selected:', value),
});
```

#### Slider

Numeric value slider.

```typescript
interface SliderProps {
  // Value
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  
  // Appearance
  width?: number;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  
  // Events
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  
  // Behavior
  disabled?: boolean;
}

// Usage
new Slider({
  min: 0,
  max: 100,
  value: 50,
  width: 30,
  showValue: true,
  onChange: (value) => console.log('Value:', value),
});
```

**Visual Examples:**

```
|────●──────────────| 50%     // with value
|────●──────────────|         // without value
```

### Selection Widgets

#### List

Scrollable list of items.

```typescript
interface ListProps {
  // Items
  items: ListItem[];
  
  // Selection
  selectedIndex?: number;
  selectedIndexes?: number[];
  multiSelect?: boolean;
  
  // Appearance
  width?: number;
  height?: number;
  itemHeight?: number;
  
  // Events
  onSelect?: (index: number, item: ListItem) => void;
  onActivate?: (index: number, item: ListItem) => void;
  
  // Rendering
  renderItem?: (item: ListItem, index: number, selected: boolean) => Widget;
}

interface ListItem {
  id: string;
  label: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

// Usage
new List({
  items: [
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
    { id: '3', label: 'Item 3' },
  ],
  height: 5,
  onSelect: (index, item) => console.log('Selected:', item.label),
});
```

#### Tree

Hierarchical tree view.

```typescript
interface TreeProps {
  // Data
  nodes: TreeNode[];
  
  // State
  expandedIds?: string[];
  selectedId?: string;
  
  // Appearance
  width?: number;
  height?: number;
  indentSize?: number;
  
  // Events
  onToggle?: (node: TreeNode, expanded: boolean) => void;
  onSelect?: (node: TreeNode) => void;
  
  // Rendering
  renderNode?: (node: TreeNode, depth: number) => Widget;
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  expanded?: boolean;
  disabled?: boolean;
  icon?: string;
}

// Usage
new Tree({
  nodes: [
    {
      id: '1',
      label: 'Root',
      children: [
        { id: '1.1', label: 'Child 1' },
        { id: '1.2', label: 'Child 2' },
      ],
    },
  ],
  height: 10,
});
```

**Visual Examples:**

```
▼ Root
  ├─ Child 1
  └─ Child 2
▶ Another Node
```

#### Table

Data table with sorting and selection.

```typescript
interface TableProps {
  // Data
  columns: TableColumn[];
  rows: TableRow[];
  
  // Selection
  selectable?: boolean;
  multiSelect?: boolean;
  selectedIds?: string[];
  
  // Sorting
  sortable?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  
  // Appearance
  width?: number;
  height?: number;
  showHeader?: boolean;
  alternatingRows?: boolean;
  
  // Events
  onSelect?: (row: TableRow) => void;
  onSort?: (column: TableColumn, direction: 'asc' | 'desc') => void;
}

// Usage
new Table({
  columns: [
    { id: 'name', header: 'Name', width: 20 },
    { id: 'age', header: 'Age', width: 10, align: 'right' },
    { id: 'city', header: 'City', width: 15 },
  ],
  rows: [
    { id: '1', cells: { name: 'John', age: 30, city: 'NYC' } },
    { id: '2', cells: { name: 'Jane', age: 25, city: 'LA' } },
  ],
  sortable: true,
  selectable: true,
});
```

### Progress Widgets

#### ProgressBar

Horizontal progress indicator.

```typescript
interface ProgressBarProps {
  // Value
  value: number;
  max?: number;
  
  // Appearance
  width?: number;
  filledChar?: string;
  emptyChar?: string;
  
  // Label
  showPercentage?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right' | 'center';
  
  // Colors
  filledColor?: Color;
  emptyColor?: Color;
}

// Usage
new ProgressBar({
  value: 75,
  max: 100,
  width: 30,
  showPercentage: true,
});
```

**Visual Examples:**

```
[████████████████░░░░░░░░░░░░░░] 75%
Progress: [██████████████░░░░░░] 70%
```

#### Spinner

Loading spinner animation.

```typescript
interface SpinnerProps {
  // Appearance
  type?: 'dots' | 'line' | 'arrow' | 'star';
  
  // Label
  label?: string;
  labelPosition?: 'left' | 'right';
  
  // Animation
  interval?: number;
}

// Usage
new Spinner({
  type: 'dots',
  label: 'Loading...',
});
```

**Visual Examples:**

```
⠋ Loading...    // dots
/ Loading...    // line
← Loading...    // arrow
✶ Loading...    // star
```

### Navigation Widgets

#### Tabs

Tabbed interface.

```typescript
interface TabsProps {
  // Tabs
  tabs: Tab[];
  activeTab?: string;
  
  // Appearance
  position?: 'top' | 'bottom' | 'left' | 'right';
  
  // Events
  onChange?: (tabId: string) => void;
}

interface Tab {
  id: string;
  label: string;
  content?: Widget;
  disabled?: boolean;
}

// Usage
new Tabs({
  tabs: [
    { id: '1', label: 'General', content: new Text({ content: 'General settings' }) },
    { id: '2', label: 'Advanced', content: new Text({ content: 'Advanced settings' }) },
  ],
  activeTab: '1',
});
```

**Visual Examples:**

```
┌────────┬─────────┐
│ General│ Advanced│
├────────┴─────────┤
│ General settings │
│                  │
└──────────────────┘
```

#### Breadcrumbs

Navigation breadcrumbs.

```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: string;
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
}

interface BreadcrumbItem {
  label: string;
  id?: string;
  disabled?: boolean;
}

// Usage
new Breadcrumbs({
  items: [
    { label: 'Home', id: 'home' },
    { label: 'Products', id: 'products' },
    { label: 'Electronics', id: 'electronics' },
  ],
  separator: ' > ',
});
```

**Visual Examples:**

```
Home > Products > Electronics
```

### Display Widgets

#### Divider

Visual separator line.

```typescript
interface DividerProps {
  // Orientation
  orientation?: 'horizontal' | 'vertical';
  
  // Length
  length?: number;
  
  // Label
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  
  // Style
  char?: string;
  color?: Color;
}

// Usage
new Divider({ orientation: 'horizontal', length: 40 });
new Divider({ label: 'Section', labelPosition: 'center' });
```

**Visual Examples:**

```
────────────────────────────────
──────── Section ───────────────
```

#### Badge

Status indicator badge.

```typescript
interface BadgeProps {
  label: string;
  
  // Style
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  // Appearance
  filled?: boolean;
}

// Usage
new Badge({ label: 'New', variant: 'success' });
new Badge({ label: '5', variant: 'primary', filled: true });
```

**Visual Examples:**

```
[New]      [5]
```

#### Tooltip

Hover tooltip (container widget).

```typescript
interface TooltipProps {
  // Content
  content: string | Widget;
  
  // Target
  children: Widget;
  
  // Position
  position?: 'top' | 'bottom' | 'left' | 'right';
  
  // Behavior
  showDelay?: number;
  hideDelay?: number;
}

// Usage
new Tooltip({
  content: 'This is a helpful tooltip',
  position: 'top',
  children: new Button({ label: 'Hover me' }),
});
```

## Widget Lifecycle

Widgets follow a well-defined lifecycle:

```
┌─────────┐
│  Create │
└────┬────┘
     │
     ▼
┌─────────┐     ┌─────────┐
│  Mount  │────>│  Render │
└────┬────┘     └────┬────┘
     │               │
     │         ┌─────┴─────┐
     │         │           │
     │    ┌────┴───┐  ┌────┴───┐
     │    │ Update │  │ Unmount│
     │    └───┬────┘  └───┬────┘
     │        │           │
     │        └─────┬─────┘
     │              │
     └──────────────┘
```

### Lifecycle Methods

```typescript
interface Widget {
  // Called when widget is first mounted
  mount(): void;
  
  // Called when props change
  update(props: WidgetProps): void;
  
  // Called to render the widget
  render(ctx: RenderContext): void;
  
  // Called when widget is removed
  unmount(): void;
  
  // Focus events
  onFocus?(): void;
  onBlur?(): void;
  
  // Input events
  onKey?(event: KeyEvent): boolean;
  onMouse?(event: MouseEvent): boolean;
}
```

### Lifecycle Example

```typescript
class CustomWidget implements Widget {
  private state = { count: 0 };
  private timer?: NodeJS.Timeout;
  
  mount() {
    console.log('Widget mounted');
    this.timer = setInterval(() => {
      this.setState({ count: this.state.count + 1 });
    }, 1000);
  }
  
  update(props: WidgetProps) {
    console.log('Props updated:', props);
  }
  
  render(ctx: RenderContext) {
    ctx.drawText(`Count: ${this.state.count}`, 0, 0);
  }
  
  unmount() {
    console.log('Widget unmounting');
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  
  private setState(newState: Partial<typeof this.state>) {
    this.state = { ...this.state, ...newState };
    // Trigger re-render
  }
}
```

## Props and State

### Controlled vs Uncontrolled

**Controlled Widgets:**

```typescript
// Parent controls the value
class ParentWidget {
  private value = '';
  
  render() {
    return new TextInput({
      value: this.value,           // Controlled by parent
      onChange: (value) => {
        this.value = value;        // Update parent state
        this.render();             // Re-render
      },
    });
  }
}
```

**Uncontrolled Widgets:**

```typescript
// Widget manages its own state
const input = new TextInput({
  defaultValue: 'Initial',  // Initial value only
  onChange: (value) => {
    console.log('Changed:', value);
  },
});

// Get current value
const currentValue = input.getValue();
```

### State Management Pattern

```typescript
class StatefulWidget implements Widget {
  private state: WidgetState;
  private props: WidgetProps;
  
  constructor(props: WidgetProps) {
    this.props = props;
    this.state = this.getInitialState();
  }
  
  private getInitialState(): WidgetState {
    return {
      value: this.props.defaultValue || '',
      focused: false,
      error: null,
    };
  }
  
  setState(updater: Partial<WidgetState> | ((prev: WidgetState) => Partial<WidgetState>)) {
    const updates = typeof updater === 'function' 
      ? updater(this.state) 
      : updater;
    
    this.state = { ...this.state, ...updates };
    this.scheduleUpdate();
  }
  
  private scheduleUpdate() {
    // Schedule re-render
  }
}
```

## Event Handling

### Keyboard Events

```typescript
class MyWidget implements Widget {
  onKey(event: KeyEvent): boolean {
    // Return true to stop propagation
    
    switch (event.key) {
      case 'up':
        this.moveUp();
        return true;
        
      case 'down':
        this.moveDown();
        return true;
        
      case 'return':
        if (event.ctrl) {
          this.submit();
          return true;
        }
        break;
        
      case 'escape':
        this.cancel();
        return true;
    }
    
    return false; // Let parent handle
  }
}
```

### Mouse Events

```typescript
class MyWidget implements Widget {
  onMouse(event: MouseEvent): boolean {
    const bounds = this.getBounds();
    
    // Check if event is within widget bounds
    if (
      event.x >= bounds.x &&
      event.x < bounds.x + bounds.width &&
      event.y >= bounds.y &&
      event.y < bounds.y + bounds.height
    ) {
      switch (event.action) {
        case MouseAction.PRESS:
          this.onPress(event);
          return true;
          
        case MouseAction.RELEASE:
          this.onClick(event);
          return true;
          
        case MouseAction.DRAG:
          this.onDrag(event);
          return true;
      }
    }
    
    return false;
  }
}
```

### Event Bubbling

```typescript
// Events bubble up from child to parent
class ParentWidget implements Widget {
  private children: Widget[];
  
  onKey(event: KeyEvent): boolean {
    // Try children first
    for (const child of this.children) {
      if (child.onKey?.(event)) {
        return true; // Child handled it
      }
    }
    
    // Handle at parent level
    if (event.key === 'q' && event.ctrl) {
      this.quit();
      return true;
    }
    
    return false;
  }
}
```

## Custom Widgets

### Basic Custom Widget

```typescript
import { Widget, RenderContext, WidgetProps } from 'tui-framework';

interface CounterProps extends WidgetProps {
  initialValue?: number;
  onChange?: (value: number) => void;
}

class CounterWidget implements Widget {
  private props: CounterProps;
  private value: number;
  
  constructor(props: CounterProps) {
    this.props = props;
    this.value = props.initialValue || 0;
  }
  
  mount() {
    // Initialization
  }
  
  update(props: CounterProps) {
    this.props = props;
  }
  
  render(ctx: RenderContext) {
    // Draw the counter
    ctx.drawText(`Count: ${this.value}`, 0, 0);
    ctx.drawText('[-] [+]', 0, 1);
  }
  
  unmount() {
    // Cleanup
  }
  
  onKey(event: KeyEvent): boolean {
    if (event.key === 'left') {
      this.decrement();
      return true;
    }
    if (event.key === 'right') {
      this.increment();
      return true;
    }
    return false;
  }
  
  private increment() {
    this.value++;
    this.props.onChange?.(this.value);
  }
  
  private decrement() {
    this.value--;
    this.props.onChange?.(this.value);
  }
}
```

### Composite Widget

```typescript
class CardWidget implements Widget {
  private props: CardProps;
  private container: Box;
  private header?: Text;
  private content: Widget;
  private footer?: Widget;
  
  constructor(props: CardProps) {
    this.props = props;
    this.build();
  }
  
  private build() {
    this.container = new Box({
      border: true,
      borderStyle: 'round',
      width: this.props.width,
      height: this.props.height,
    });
    
    if (this.props.title) {
      this.header = new Text({
        content: this.props.title,
        bold: true,
      });
    }
    
    this.content = this.props.children;
    
    if (this.props.footer) {
      this.footer = this.props.footer;
    }
  }
  
  render(ctx: RenderContext) {
    // Render container
    this.container.render(ctx);
    
    // Render header
    if (this.header) {
      const headerCtx = ctx.pushTransform(1, 1);
      this.header.render(headerCtx);
      headerCtx.popTransform();
    }
    
    // Render content
    const contentY = this.header ? 2 : 1;
    const contentCtx = ctx.pushTransform(1, contentY);
    this.content.render(contentCtx);
    contentCtx.popTransform();
    
    // Render footer
    if (this.footer) {
      const footerY = (this.props.height || 10) - 2;
      const footerCtx = ctx.pushTransform(1, footerY);
      this.footer.render(footerCtx);
      footerCtx.popTransform();
    }
  }
}
```

### Widget with Layout

```typescript
class FormWidget implements Widget {
  private layout: LayoutEngine;
  private fields: Widget[];
  
  constructor(props: FormProps) {
    this.layout = new LayoutEngine();
    this.buildLayout();
  }
  
  private buildLayout() {
    const root = column({ gap: 1 });
    
    for (const field of this.props.fields) {
      const row = new LayoutNode({
        style: {
          flexDirection: 'row',
          gap: 2,
        },
      });
      
      const label = new Text({ content: field.label });
      const input = new TextInput({ width: 30 });
      
      row.addChild(label);
      row.addChild(input);
      
      root.addChild(row);
    }
    
    this.layout.setRoot(root);
    this.layout.calculateLayout();
  }
  
  render(ctx: RenderContext) {
    // Render based on calculated layout
    const root = this.layout.getRoot();
    this.renderNode(ctx, root);
  }
  
  private renderNode(ctx: RenderContext, node: LayoutNode) {
    const layout = node.getComputedLayout();
    const nodeCtx = ctx.pushTransform(layout.x, layout.y);
    
    // Render this node
    // ...
    
    // Render children
    for (const child of node.children) {
      this.renderNode(nodeCtx, child);
    }
    
    nodeCtx.popTransform();
  }
}
```

## Widget Composition

### Composition Patterns

**1. Container Pattern:**

```typescript
class ListItem implements Widget {
  constructor(props: { icon: string; title: string; subtitle?: string }) {
    return new HStack({
      gap: 1,
      children: [
        new Text({ content: props.icon }),
        new VStack({
          children: [
            new Text({ content: props.title, bold: true }),
            props.subtitle ? new Text({ 
              content: props.subtitle, 
              color: { rgb: [128, 128, 128] }
            }) : null,
          ].filter(Boolean),
        }),
      ],
    });
  }
}
```

**2. Higher-Order Widget:**

```typescript
function withBorder(widget: Widget, options?: BorderOptions): Widget {
  return new Box({
    border: true,
    ...options,
    children: [widget],
  });
}

function withPadding(widget: Widget, padding: number): Widget {
  return new Box({
    padding,
    children: [widget],
  });
}

// Usage
const content = withBorder(
  withPadding(
    new Text({ content: 'Hello' }),
    2
  ),
  { borderStyle: 'round' }
);
```

**3. Conditional Rendering:**

```typescript
class ConditionalWidget implements Widget {
  render(ctx: RenderContext) {
    if (this.props.condition) {
      this.props.thenWidget.render(ctx);
    } else if (this.props.elseWidget) {
      this.props.elseWidget.render(ctx);
    }
  }
}

// Usage
new ConditionalWidget({
  condition: user.isLoggedIn,
  thenWidget: new UserProfile({ user }),
  elseWidget: new LoginButton(),
});
```

**4. List Rendering:**

```typescript
class ListWidget implements Widget {
  render(ctx: RenderContext) {
    let y = 0;
    
    for (const item of this.props.items) {
      const widget = this.props.renderItem(item);
      const itemCtx = ctx.pushTransform(0, y);
      widget.render(itemCtx);
      itemCtx.popTransform();
      
      y += this.props.itemHeight;
    }
  }
}

// Usage
new ListWidget({
  items: users,
  itemHeight: 2,
  renderItem: (user) => new UserRow({ user }),
});
```

## Focus Management

### Focus System

```typescript
class FocusableWidget implements Widget {
  private focused = false;
  private focusable = true;
  
  isFocusable(): boolean {
    return this.focusable && !this.props.disabled;
  }
  
  onFocus() {
    this.focused = true;
    this.render(); // Re-render with focus state
  }
  
  onBlur() {
    this.focused = false;
    this.render(); // Re-render without focus state
  }
  
  render(ctx: RenderContext) {
    if (this.focused) {
      // Render with focus indicator
      ctx.drawBox(0, 0, this.width, this.height, {
        border: true,
        borderColor: { rgb: [0, 120, 255] }, // Focus color
      });
    } else {
      // Render without focus
    }
  }
}
```

### Tab Order

```typescript
class Form implements Widget {
  private focusManager: AccessibilityFocusManager;
  private fields: FocusableWidget[];
  
  mount() {
    this.focusManager = new AccessibilityFocusManager();
    
    for (const field of this.fields) {
      this.focusManager.register(field);
    }
  }
  
  onKey(event: KeyEvent): boolean {
    if (event.key === 'tab') {
      if (event.shift) {
        this.focusManager.focusPrevious();
      } else {
        this.focusManager.focusNext();
      }
      return true;
    }
    
    return false;
  }
}
```

## Best Practices

### 1. Keep Widgets Small

```typescript
// ❌ Bad: Monolithic widget
class BadWidget implements Widget {
  render(ctx: RenderContext) {
    // 500 lines of rendering code
  }
}

// ✅ Good: Composed of smaller widgets
class GoodWidget implements Widget {
  private header = new Header();
  private content = new Content();
  private footer = new Footer();
  
  render(ctx: RenderContext) {
    this.header.render(ctx);
    this.content.render(ctx.pushTransform(0, 5));
    this.footer.render(ctx.pushTransform(0, 20));
  }
}
```

### 2. Use Props for Configuration

```typescript
// ❌ Bad: Hardcoded values
class BadButton implements Widget {
  render(ctx: RenderContext) {
    ctx.drawText('OK', 0, 0, { color: { rgb: [0, 0, 255] } });
  }
}

// ✅ Good: Configurable via props
class GoodButton implements Widget {
  render(ctx: RenderContext) {
    ctx.drawText(
      this.props.label,
      0,
      0,
      { color: this.props.color || { rgb: [0, 0, 255] } }
    );
  }
}
```

### 3. Handle Cleanup

```typescript
class WidgetWithTimer implements Widget {
  private timer?: NodeJS.Timeout;
  private subscriptions: (() => void)[] = [];
  
  mount() {
    this.timer = setInterval(() => this.tick(), 1000);
    
    const unsubscribe = eventBus.subscribe('event', this.handleEvent);
    this.subscriptions.push(unsubscribe);
  }
  
  unmount() {
    // Always clean up resources
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
  }
}
```

### 4. Accessibility

```typescript
class AccessibleButton implements Widget {
  render(ctx: RenderContext) {
    // Visual rendering
    ctx.drawText(`[ ${this.props.label} ]`, 0, 0);
    
    // Accessibility
    if (this.isFocused()) {
      ctx.announce(`${this.props.label} button, press Enter to activate`);
    }
  }
  
  getAriaLabel(): string {
    return this.props.ariaLabel || this.props.label;
  }
  
  getAriaRole(): string {
    return 'button';
  }
}
```

### 5. Performance

```typescript
class OptimizedWidget implements Widget {
  private lastProps?: WidgetProps;
  private cachedRender?: RenderOutput;
  
  shouldUpdate(newProps: WidgetProps): boolean {
    // Only re-render if props changed
    return !shallowEqual(this.lastProps, newProps);
  }
  
  update(newProps: WidgetProps) {
    if (!this.shouldUpdate(newProps)) {
      return;
    }
    
    this.lastProps = newProps;
    this.cachedRender = null;
  }
  
  render(ctx: RenderContext) {
    if (this.cachedRender) {
      // Use cached output
      ctx.drawCached(this.cachedRender);
      return;
    }
    
    // Perform actual rendering
    // ...
    
    // Cache for next time
    this.cachedRender = ctx.capture();
  }
}
```

This guide covers the essential aspects of working with widgets in the TUI Framework. For more advanced patterns and examples, see the demo applications in the `src/demo/` directory.