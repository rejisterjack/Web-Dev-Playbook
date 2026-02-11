# Changelog

All notable changes to the TUI Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of the TUI Framework
- Terminal control layer with ANSI escape codes
- Double-buffered rendering engine with differential updates
- Flexbox-like layout engine with constraint resolution
- Comprehensive event system with keyboard and mouse support
- Theme system with TrueColor support and automatic fallback
- Accessibility features including screen reader support
- Async task system with worker thread integration
- Data visualization components (charts, graphs, tables)
- Built-in widget library (Box, Text, Button, Input, etc.)
- Demo applications showcasing framework capabilities

### Features

#### Terminal Module
- ANSI escape code generation and parsing
- Terminal capability detection
- Raw mode management
- Mouse tracking support (SGR, UTF-8, X10)
- Terminal size detection and resize handling
- Input/output stream management

#### Rendering Module
- Double buffering for flicker-free rendering
- Differential rendering (only changed cells)
- Cell-based screen representation
- Drawing primitives (text, lines, boxes, circles)
- Render context with clipping and transformations
- Animation support with easing functions

#### Layout Module
- Flexbox layout system
- Constraint-based sizing
- Responsive breakpoints
- Viewport and scroll management
- Layout caching for performance

#### Events Module
- Event loop with priority queue
- Keyboard event handling with modifiers
- Mouse event handling (click, drag, scroll)
- Signal handling (SIGWINCH, SIGINT, etc.)
- Debouncing and throttling utilities
- Key binding management

#### Theme Module
- TrueColor (24-bit) support
- Automatic fallback to 256-color and 16-color
- Color space conversions (RGB, HSL, HWB, CMYK)
- Color manipulation (lighten, darken, saturate, etc.)
- Contrast calculation for accessibility
- Predefined themes (dark, light, high contrast)
- Gradient generation

#### Accessibility Module
- Screen reader announcements
- ARIA attributes and roles
- Focus management
- Keyboard navigation
- High contrast mode
- Text scaling support
- Reduced motion support
- Accessibility audit tools

#### Task Module
- Task queue with priority
- Worker thread pool
- Progress reporting
- Task scheduling (delayed, recurring)
- Task decorators (@Retry, @Timeout, etc.)

#### Visualization Module
- Line, bar, area, pie charts
- Scatter plots, histograms, heatmaps
- Gauges and sparklines
- Tables and tree views
- Real-time data streaming
- Canvas API for custom drawing

## [1.0.0] - 2024-01-15

### Added
- Initial stable release
- Core framework architecture
- Comprehensive test suite
- Full documentation
- Demo applications

### Security
- Input sanitization
- Safe ANSI sequence generation
- Secure raw mode handling

---

## Release Notes Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-01-15 | Initial stable release |

---

For detailed migration guides between versions, see [Migration Guide](migration.md).