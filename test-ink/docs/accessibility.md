# Accessibility Guide

Comprehensive guide to building accessible TUI applications with the TUI Framework.

## Table of Contents

- [Introduction](#introduction)
- [Accessibility Features Overview](#accessibility-features-overview)
- [Screen Reader Support](#screen-reader-support)
- [Keyboard Navigation](#keyboard-navigation)
- [High Contrast Mode](#high-contrast-mode)
- [Text Scaling](#text-scaling)
- [Reduced Motion](#reduced-motion)
- [ARIA Attributes](#aria-attributes)
- [Accessibility Tree](#accessibility-tree)
- [WCAG Compliance](#wcag-compliance)
- [Best Practices](#best-practices)

## Introduction

Accessibility (a11y) ensures that your terminal applications can be used by everyone, including people with disabilities. The TUI Framework provides comprehensive accessibility features out of the box.

### Why Accessibility Matters

- **Legal Compliance**: Many jurisdictions require accessible software
- **User Base**: ~15% of users have some form of disability
- **Better UX**: Accessibility improvements benefit all users
- **Professionalism**: Accessible applications show quality craftsmanship

### Accessibility Principles (POUR)

- **Perceivable**: Information must be presentable in ways users can perceive
- **Operable**: Interface components must be operable by all users
- **Understandable**: Information and operation must be understandable
- **Robust**: Content must work with current and future assistive technologies

## Accessibility Features Overview

### Built-in Features

```typescript
import { AccessibilityManager } from 'tui-framework';

const a11y = new AccessibilityManager({
  // Auto-detect user preferences
  detectPreferences: true,
  
  // Enable all features
  screenReader: true,
  highContrast: false,
  textScale: 1.0,
  reducedMotion: false,
});
```

### Feature Detection

```typescript
// Detect system preferences
const prefs = a11y.detectPreferences();

console.log('High contrast:', prefs.highContrast);
console.log('Reduced motion:', prefs.reducedMotion);
console.log('Text scale:', prefs.textScale);

// Apply detected preferences
a11y.setHighContrast(prefs.highContrast);
a11y.setReducedMotion(prefs.reducedMotion);
a11y.setTextScale(prefs.textScale);
```

## Screen Reader Support

### Screen Reader Announcements

```typescript
import { ScreenReader, AnnouncementPriority } from 'tui-framework';

const screenReader = new ScreenReader();

// Basic announcement
screenReader.announce('File saved successfully');

// Priority announcements
screenReader.announce(
  'Error: Connection failed',
  { priority: AnnouncementPriority.ASSERTIVE }
);

// Polite announcement (won't interrupt)
screenReader.announce(
  '3 new messages',
  { priority: AnnouncementPriority.POLITE }
);

// Off (silent update)
screenReader.announce(
  'Background sync complete',
  { priority: AnnouncementPriority.OFF }
);
```

### Live Regions

```typescript
// Create live region for dynamic content
const statusRegion = screenReader.createLiveRegion({
  type: 'polite',
  atomic: false,
});

// Update will be announced
statusRegion.update('Loading... 50%');
statusRegion.update('Loading... 100%');
statusRegion.update('Complete!');

// Atomic region (announced as whole)
const alertRegion = screenReader.createLiveRegion({
  type: 'assertive',
  atomic: true,
});

alertRegion.update('Error in line 42'); // Announced completely
```

### Widget Labels

```typescript
class AccessibleButton implements Widget {
  getAccessibleLabel(): string {
    return this.props.label;
  }
  
  getAccessibleDescription(): string {
    return this.props.description;
  }
  
  getAccessibleRole(): string {
    return 'button';
  }
  
  onFocus() {
    screenReader.announce(
      `${this.getAccessibleLabel()} button, press Enter to activate`
    );
  }
}
```

### Screen Reader Integration

```typescript
// Integration with application
class App {
  private screenReader: ScreenReader;
  
  constructor() {
    this.screenReader = new ScreenReader();
    
    // Announce app start
    this.screenReader.announce(
      'My Application loaded. Press Tab to navigate.',
      { priority: AnnouncementPriority.ASSERTIVE }
    );
  }
  
  // Announce navigation
  navigateTo(screen: string) {
    this.currentScreen = screen;
    this.screenReader.announce(`Navigated to ${screen}`);
  }
  
  // Announce state changes
  onStatusChange(status: string) {
    this.screenReader.announce(status);
  }
}
```

## Keyboard Navigation

### Focus Management

```typescript
import { AccessibilityFocusManager, FocusOrderStrategy } from 'tui-framework';

const focusManager = new AccessibilityFocusManager({
  strategy: FocusOrderStrategy.TAB_INDEX,
});

// Register focusable widgets
focusManager.register(button1);
focusManager.register(button2);
focusManager.register(input1);

// Navigation
focusManager.focusNext();    // Tab
focusManager.focusPrevious(); // Shift+Tab
focusManager.focusFirst();    // Home
focusManager.focusLast();     // End

// Get current focus
const focused = focusManager.getFocusedWidget();
```

### Keyboard Shortcuts

```typescript
import { KeyboardNavigation, ShortcutScope } from 'tui-framework';

const keyboardNav = new KeyboardNavigation();

// Global shortcuts
keyboardNav.register({
  id: 'quit',
  key: 'q',
  ctrl: true,
  scope: ShortcutScope.GLOBAL,
  handler: () => app.quit(),
});

// Local shortcuts (only when widget focused)
keyboardNav.register({
  id: 'delete-item',
  key: 'delete',
  scope: ShortcutScope.LOCAL,
  handler: () => list.deleteSelected(),
});

// Modal shortcuts (highest priority)
keyboardNav.register({
  id: 'close-modal',
  key: 'escape',
  scope: ShortcutScope.MODAL,
  handler: () => modal.close(),
});
```

### Focus Indicators

```typescript
class FocusableWidget implements Widget {
  private focused = false;
  
  onFocus() {
    this.focused = true;
    this.render();
    
    // Announce to screen reader
    screenReader.announce(this.getAccessibleLabel());
  }
  
  onBlur() {
    this.focused = false;
    this.render();
  }
  
  render(ctx: RenderContext) {
    if (this.focused) {
      // Draw focus indicator
      ctx.drawBox(0, 0, this.width, this.height, {
        border: true,
        borderColor: { rgb: [0, 120, 255] }, // High contrast focus color
      });
    }
    
    // Draw content
    // ...
  }
}
```

### Keyboard Trap Prevention

```typescript
class Modal implements Widget {
  private focusableElements: Widget[] = [];
  
  onKey(event: KeyEvent): boolean {
    // Trap focus within modal
    if (event.key === 'tab') {
      const currentIndex = this.focusableElements.indexOf(
        this.getFocusedElement()
      );
      
      if (event.shift) {
        // Shift+Tab: Go to previous
        const prevIndex = currentIndex > 0 
          ? currentIndex - 1 
          : this.focusableElements.length - 1;
        this.focusableElements[prevIndex].focus();
      } else {
        // Tab: Go to next
        const nextIndex = currentIndex < this.focusableElements.length - 1
          ? currentIndex + 1
          : 0;
        this.focusableElements[nextIndex].focus();
      }
      
      return true;
    }
    
    // Allow Escape to close modal
    if (event.key === 'escape') {
      this.close();
      return true;
    }
    
    return false;
  }
}
```

### Skip Links

```typescript
class SkipLink implements Widget {
  render(ctx: RenderContext) {
    // Hidden until focused
    if (this.focused) {
      ctx.drawText(
        'Skip to main content (press Enter)',
        0,
        0,
        { bg: { rgb: [0, 0, 255] }, fg: { rgb: [255, 255, 255] } }
      );
    }
  }
  
  onKey(event: KeyEvent): boolean {
    if (event.key === 'enter') {
      // Move focus to main content
      mainContent.focus();
      return true;
    }
    return false;
  }
}
```

## High Contrast Mode

### Enabling High Contrast

```typescript
import { HighContrastMode, HighContrastPreset } from 'tui-framework';

const highContrast = new HighContrastMode({
  enabled: true,
  preset: HighContrastPreset.WCAG_AAA,
});

// Or auto-detect
const prefersHighContrast = process.env.COLORTERM === 'high-contrast';
highContrast.setEnabled(prefersHighContrast);
```

### High Contrast Themes

```typescript
// Built-in presets
const presets = {
  // Black on white
  light: HighContrastPreset.LIGHT,
  
  // White on black
  dark: HighContrastPreset.DARK,
  
  // Yellow on black
  yellow: HighContrastPreset.YELLOW,
  
  // WCAG AAA compliant
  wcag: HighContrastPreset.WCAG_AAA,
};

// Custom high contrast theme
const customHighContrast = {
  background: { rgb: 0, 0, 0 },
  foreground: { rgb: 255, 255, 0 }, // Yellow
  accent: { rgb: 0, 255, 255 },     // Cyan
  error: { rgb: 255, 0, 0 },        // Red
  success: { rgb: 0, 255, 0 },      // Green
};
```

### High Contrast Widgets

```typescript
class AccessibleWidget implements Widget {
  render(ctx: RenderContext) {
    const isHighContrast = accessibilityManager.isHighContrastEnabled();
    
    if (isHighContrast) {
      // Use high contrast colors
      ctx.drawText(this.text, 0, 0, {
        fg: { rgb: [255, 255, 255] },
        bg: { rgb: [0, 0, 0] },
        bold: true,
      });
      
      // Strong borders
      ctx.drawBox(0, 0, this.width, this.height, {
        border: true,
        borderStyle: 'double',
      });
    } else {
      // Normal rendering
      // ...
    }
  }
}
```

### Focus Visibility in High Contrast

```typescript
class HighContrastFocus implements Widget {
  renderFocusIndicator(ctx: RenderContext) {
    const isHighContrast = accessibilityManager.isHighContrastEnabled();
    
    if (isHighContrast) {
      // Very visible focus indicator
      ctx.drawBox(0, 0, this.width, this.height, {
        border: true,
        borderStyle: 'double',
        borderColor: { rgb: [255, 255, 0] }, // Bright yellow
      });
      
      // Invert colors for focused element
      ctx.invertColors();
    } else {
      // Standard focus indicator
      ctx.drawBox(0, 0, this.width, this.height, {
        border: true,
        borderColor: { rgb: [0, 120, 255] },
      });
    }
  }
}
```

## Text Scaling

### Text Scaling Support

```typescript
import { TextScaling, TextScalingPreset } from 'tui-framework';

const textScaling = new TextScaling({
  scale: 1.0, // Normal
});

// Presets
textScaling.setPreset(TextScalingPreset.SMALL);   // 0.8x
textScaling.setPreset(TextScalingPreset.NORMAL);  // 1.0x
textScaling.setPreset(TextScalingPreset.LARGE);   // 1.25x
textScaling.setPreset(TextScalingPreset.XLARGE);  // 1.5x
textScaling.setPreset(TextScalingPreset.XXLARGE); // 2.0x

// Custom scale
textScaling.setScale(1.75);
```

### Responsive Layout with Text Scaling

```typescript
class ScalableWidget implements Widget {
  private getScaledSize(baseSize: number): number {
    const scale = accessibilityManager.getTextScale();
    return Math.round(baseSize * scale);
  }
  
  render(ctx: RenderContext) {
    const scaledWidth = this.getScaledSize(this.baseWidth);
    const scaledHeight = this.getScaledSize(this.baseHeight);
    
    // Adjust layout for scaled text
    // ...
  }
}
```

### Minimum Text Size

```typescript
class AccessibleText implements Widget {
  render(ctx: RenderContext) {
    const scale = accessibilityManager.getTextScale();
    
    // Ensure minimum readability
    const minSize = 1; // At least 1 cell
    const actualSize = Math.max(this.baseSize * scale, minSize);
    
    // Render with scaled size
    // ...
  }
}
```

## Reduced Motion

### Detecting Reduced Motion Preference

```typescript
import { ReducedMotion, ReducedMotionDetectionMethod } from 'tui-framework';

const reducedMotion = new ReducedMotion({
  detectionMethod: ReducedMotionDetectionMethod.ENVIRONMENT,
});

// Check if user prefers reduced motion
if (reducedMotion.shouldReduceMotion()) {
  console.log('User prefers reduced motion');
}

// Or auto-detect from environment
const prefersReducedMotion = 
  process.env.TERM_ANIMATION === 'off' ||
  process.env.REDUCE_MOTION === '1';

reducedMotion.setEnabled(prefersReducedMotion);
```

### Animation Alternatives

```typescript
class AccessibleAnimation implements Widget {
  animate() {
    if (reducedMotion.isEnabled()) {
      // Instant transition instead of animation
      this.setState(this.targetState);
    } else {
      // Normal animation
      this.startAnimation();
    }
  }
  
  showTransition() {
    if (reducedMotion.isEnabled()) {
      // Use color change or symbol change instead of movement
      this.indicator = '▶';
    } else {
      // Animated spinner
      this.spinner.animate();
    }
  }
}
```

### Essential Animations

```typescript
class LoadingIndicator implements Widget {
  render(ctx: RenderContext) {
    if (reducedMotion.isEnabled()) {
      // Static indicator with text
      ctx.drawText('Loading...', 0, 0);
    } else {
      // Animated spinner
      this.spinner.render(ctx, 0, 0);
    }
  }
}
```

## ARIA Attributes

### ARIA Roles

```typescript
import { ariaRole, AccessibilityRole } from 'tui-framework';

// Assign roles to widgets
class Button implements Widget {
  getAriaRole(): string {
    return AccessibilityRole.BUTTON;
  }
}

class Checkbox implements Widget {
  getAriaRole(): string {
    return AccessibilityRole.CHECKBOX;
  }
  
  getAriaChecked(): boolean | 'mixed' {
    if (this.indeterminate) return 'mixed';
    return this.checked;
  }
}

class List implements Widget {
  getAriaRole(): string {
    return AccessibilityRole.LIST;
  }
}

class ListItem implements Widget {
  getAriaRole(): string {
    return AccessibilityRole.LISTITEM;
  }
}
```

### ARIA States and Properties

```typescript
import {
  ariaChecked,
  ariaSelected,
  ariaExpanded,
  ariaDisabled,
  ariaHidden,
  ariaLabel,
  ariaDescribedBy,
} from 'tui-framework';

class AccessibleWidget implements Widget {
  getAriaAttributes() {
    return {
      role: this.getAriaRole(),
      label: this.getAccessibleLabel(),
      description: this.getAccessibleDescription(),
      checked: this.isChecked(),
      selected: this.isSelected(),
      expanded: this.isExpanded(),
      disabled: this.isDisabled(),
      hidden: !this.isVisible(),
    };
  }
}
```

### Accessible Labels

```typescript
class IconButton implements Widget {
  constructor(props: { icon: string; label: string }) {
    this.icon = props.icon;
    this.label = props.label;
  }
  
  render(ctx: RenderContext) {
    // Visual: icon only
    ctx.drawText(this.icon, 0, 0);
  }
  
  getAccessibleLabel(): string {
    // Screen reader: descriptive label
    return this.label;
  }
}

// Usage
new IconButton({
  icon: '🗑️',
  label: 'Delete item',
});
```

### ARIA Relationships

```typescript
class FormField implements Widget {
  private id = generateId();
  private labelId = generateId();
  private errorId = generateId();
  
  getAriaAttributes() {
    return {
      'aria-labelledby': this.labelId,
      'aria-describedby': this.hasError ? this.errorId : undefined,
      'aria-invalid': this.hasError,
      'aria-required': this.required,
    };
  }
  
  render(ctx: RenderContext) {
    // Label with ID
    ctx.drawText(this.label, 0, 0, { id: this.labelId });
    
    // Input field
    this.input.render(ctx, 0, 1);
    
    // Error message (if any)
    if (this.hasError) {
      ctx.drawText(this.errorMessage, 0, 2, { id: this.errorId });
    }
  }
}
```

## Accessibility Tree

### Building the Accessibility Tree

```typescript
import { AccessibilityTree, TraversalOrder } from 'tui-framework';

const a11yTree = new AccessibilityTree();

// Add nodes
const root = a11yTree.createNode({
  role: 'application',
  label: 'My App',
});

const header = a11yTree.createNode({
  role: 'banner',
  label: 'Header',
  parent: root,
});

const main = a11yTree.createNode({
  role: 'main',
  label: 'Main Content',
  parent: root,
});

const button = a11yTree.createNode({
  role: 'button',
  label: 'Submit',
  parent: main,
});
```

### Traversing the Tree

```typescript
// Pre-order traversal
for (const node of a11yTree.traverse(TraversalOrder.PRE_ORDER)) {
  console.log(node.label);
}

// Find by role
const buttons = a11yTree.findByRole('button');

// Find by state
const checked = a11yTree.findByState('checked', true);

// Get path to node
const path = a11yTree.getPath(button);
console.log(path.map((n) => n.label).join(' > '));
// "My App > Main Content > Submit"
```

### Tree Updates

```typescript
// Update node
a11yTree.updateNode(button, {
  label: 'Save',
  disabled: true,
});

// Remove node
a11yTree.removeNode(button);

// Move node
a11yTree.moveNode(button, newParent);
```

## WCAG Compliance

### Contrast Requirements

```typescript
import { getContrastRatio, isAccessible, ContrastLevel } from 'tui-framework';

// Check contrast
const foreground = { rgb: [255, 255, 255] }; // White
const background = { rgb: [0, 0, 0] };       // Black

const ratio = getContrastRatio(foreground, background);
console.log(`Contrast ratio: ${ratio}:1`);

// WCAG AA compliance (4.5:1 for normal text)
const isAA = isAccessible(foreground, background, ContrastLevel.AA);

// WCAG AAA compliance (7:1 for normal text)
const isAAA = isAccessible(foreground, background, ContrastLevel.AAA);
```

### Color Independence

```typescript
// ❌ Bad: Information only through color
if (item.isUrgent) {
  ctx.drawText(item.name, 0, 0, { color: 'red' });
} else {
  ctx.drawText(item.name, 0, 0);
}

// ✅ Good: Color + symbol
if (item.isUrgent) {
  ctx.drawText(`⚠ ${item.name}`, 0, 0, { color: 'red' });
} else {
  ctx.drawText(`  ${item.name}`, 0, 0);
}
```

### Focus Visibility (WCAG 2.4.7)

```typescript
class WCAGCompliantFocus implements Widget {
  render(ctx: RenderContext) {
    if (this.focused) {
      // Visible focus indicator
      // - Minimum 3:1 contrast with unfocused state
      // - At least 2px thick
      ctx.drawBox(0, 0, this.width, this.height, {
        border: true,
        borderStyle: 'double',
        borderColor: { rgb: [255, 255, 0] }, // High contrast
      });
    }
  }
}
```

### Minimum Target Size

```typescript
class AccessibleButton implements Widget {
  // WCAG 2.5.5: Target size at least 44x44 CSS pixels
  // In terminal: approximately 22x22 characters
  
  get minimumWidth(): number {
    return 22;
  }
  
  get minimumHeight(): number {
    return 22;
  }
  
  render(ctx: RenderContext) {
    // Ensure minimum size
    const width = Math.max(this.contentWidth, this.minimumWidth);
    const height = Math.max(this.contentHeight, this.minimumHeight);
    
    // Center content
    const contentX = Math.floor((width - this.contentWidth) / 2);
    const contentY = Math.floor((height - this.contentHeight) / 2);
    
    // Render with padding
    // ...
  }
}
```

## Best Practices

### 1. Semantic Structure

```typescript
// ✅ Good: Semantic structure
class App {
  render() {
    return column({
      children: [
        header({ label: 'Application Header' }),
        main({
          children: [
            navigation({ label: 'Main Navigation' }),
            article({ label: 'Main Content' }),
          ],
        }),
        footer({ label: 'Footer' }),
      ],
    });
  }
}

// ❌ Bad: Generic containers
class App {
  render() {
    return box({
      children: [
        box({ children: [/* header */] }),
        box({ children: [/* content */] }),
        box({ children: [/* footer */] }),
      ],
    });
  }
}
```

### 2. Descriptive Labels

```typescript
// ❌ Bad: Vague labels
new Button({ label: 'Click here' });
new Button({ label: 'OK' });

// ✅ Good: Descriptive labels
new Button({ label: 'Save document' });
new Button({ label: 'Confirm deletion' });
```

### 3. Error Prevention

```typescript
class DeleteButton implements Widget {
  onActivate() {
    // Confirm destructive action
    const confirmed = confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this file?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    
    if (confirmed) {
      this.delete();
    }
  }
}
```

### 4. Status Feedback

```typescript
class Form implements Widget {
  async submit() {
    // Announce submission
    screenReader.announce('Submitting form...');
    
    try {
      await this.sendData();
      screenReader.announce('Form submitted successfully');
    } catch (error) {
      screenReader.announce(
        `Error: ${error.message}`,
        { priority: AnnouncementPriority.ASSERTIVE }
      );
    }
  }
}
```

### 5. Testing with Assistive Technologies

```typescript
// Automated accessibility tests
import { AccessibilityAudit } from 'tui-framework';

const audit = new AccessibilityAudit();

// Run audit on your app
const report = audit.run(app);

console.log('Accessibility Report:');
console.log(`Score: ${report.score}/100`);

if (report.violations.length > 0) {
  console.log('Violations:');
  report.violations.forEach((v) => {
    console.log(`  - ${v.rule}: ${v.message}`);
  });
}
```

### 6. Keyboard Shortcuts Documentation

```typescript
class HelpWidget implements Widget {
  render(ctx: RenderContext) {
    ctx.drawText('Keyboard Shortcuts:', 0, 0, { bold: true });
    ctx.drawText('', 0, 1);
    ctx.drawText('Tab          - Move to next element', 0, 2);
    ctx.drawText('Shift+Tab    - Move to previous element', 0, 3);
    ctx.drawText('Enter/Space  - Activate button', 0, 4);
    ctx.drawText('Escape       - Cancel/Close', 0, 5);
    ctx.drawText('Ctrl+Q       - Quit application', 0, 6);
    ctx.drawText('?            - Show this help', 0, 7);
  }
}
```

This guide covers the essential accessibility features of the TUI Framework. For more details, see the [API Reference](api.md) and [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/).