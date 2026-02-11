# Contributing Guide

Thank you for your interest in contributing to the TUI Framework! This guide will help you get started with development.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Convention](#commit-message-convention)
- [Release Process](#release-process)

## Development Setup

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 7.0.0 or **yarn** >= 1.22.0
- **Git**

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/tui-framework.git
cd tui-framework

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Workflow

```bash
# Start development mode with file watching
npm run dev

# Run specific test file
npm test -- src/terminal/ansi.test.ts

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### IDE Setup

#### VS Code

Recommended extensions:

- ESLint
- Prettier
- TypeScript Hero
- Test Explorer

Settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Project Structure

```
tui-framework/
├── src/                      # Source code
│   ├── terminal/            # Terminal control layer
│   ├── rendering/           # Rendering engine
│   ├── layout/              # Layout engine
│   ├── events/              # Event system
│   ├── theme/               # Theme system
│   ├── accessibility/       # Accessibility features
│   ├── tasks/               # Async task system
│   ├── visualization/       # Data visualization
│   ├── widgets/             # Built-in widgets
│   ├── demo/                # Demo applications
│   └── index.ts             # Main exports
├── docs/                     # Documentation
├── tests/                    # Additional tests
├── scripts/                  # Build scripts
├── .github/                  # GitHub templates
├── package.json
├── tsconfig.json
├── jest.config.js
├── eslint.config.js
└── prettier.config.js
```

### Module Organization

Each module follows this structure:

```
src/module-name/
├── index.ts                 # Public exports
├── types.ts                 # Type definitions
├── core-file.ts             # Main implementation
├── utils.ts                 # Utility functions
└── __tests__/               # Tests
    ├── core-file.test.ts
    └── utils.test.ts
```

## Code Style Guidelines

### TypeScript Style

We use TypeScript with strict mode enabled.

```typescript
// ✅ Good: Explicit types
function calculateLayout(node: LayoutNode, constraints: Constraints): ComputedLayout {
  // Implementation
}

// ❌ Bad: Implicit types
function calculateLayout(node, constraints) {
  // Implementation
}

// ✅ Good: Interface naming
interface WidgetProps {
  id: string;
}

// ✅ Good: Type naming
type EventHandler = (event: Event) => void;

// ✅ Good: Enum naming
enum ColorSpace {
  RGB = 'rgb',
  HSL = 'hsl',
}
```

### Naming Conventions

```typescript
// Classes: PascalCase
class LayoutEngine {}

// Interfaces: PascalCase with descriptive names
interface RenderContext {}

// Types: PascalCase
type Color = RGBColor | HSLColor;

// Enums: PascalCase
enum EventPriority {}

// Functions: camelCase
function createBuffer() {}

// Constants: UPPER_SNAKE_CASE for true constants
const DEFAULT_CELL: Readonly<Cell> = { ... };

// Variables: camelCase
let currentBuffer: ScreenBuffer;

// Private members: prefix with underscore
class MyClass {
  private _internalState: State;
}
```

### Documentation

```typescript
/**
 * Calculates the layout for a node given constraints.
 * 
 * This method implements the Flexbox layout algorithm with support for
 * min/max constraints and automatic sizing.
 * 
 * @param node - The layout node to calculate
 * @param constraints - The size constraints
 * @returns The computed layout with position and dimensions
 * 
 * @example
 * ```typescript
 * const layout = calculateLayout(node, { maxWidth: 100 });
 * console.log(layout.width); // 80
 * ```
 */
function calculateLayout(
  node: LayoutNode,
  constraints: Constraints
): ComputedLayout {
  // Implementation
}
```

### Code Organization

```typescript
// 1. Imports (grouped: external, internal)
import { EventEmitter } from 'events';
import type { Color } from '../theme/types.js';
import { createCell } from './cell.js';

// 2. Type definitions
interface BufferOptions {
  width: number;
  height: number;
}

// 3. Constants
const DEFAULT_WIDTH = 80;
const DEFAULT_HEIGHT = 24;

// 4. Class/Function definitions
export class ScreenBuffer {
  // Implementation
}

// 5. Helper functions
function validateDimensions(width: number, height: number): void {
  // Implementation
}
```

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenBuffer } from '../buffer.js';

describe('ScreenBuffer', () => {
  let buffer: ScreenBuffer;
  
  beforeEach(() => {
    buffer = new ScreenBuffer(80, 24);
  });
  
  describe('constructor', () => {
    it('should create buffer with given dimensions', () => {
      expect(buffer.width).toBe(80);
      expect(buffer.height).toBe(24);
    });
    
    it('should throw for invalid dimensions', () => {
      expect(() => new ScreenBuffer(0, 24)).toThrow();
      expect(() => new ScreenBuffer(80, 0)).toThrow();
    });
  });
  
  describe('getCell', () => {
    it('should return cell at valid position', () => {
      const cell = buffer.getCell(0, 0);
      expect(cell).toBeDefined();
    });
    
    it('should return undefined for out of bounds', () => {
      expect(buffer.getCell(-1, 0)).toBeUndefined();
      expect(buffer.getCell(0, 100)).toBeUndefined();
    });
  });
});
```

### Test Coverage

Aim for:

- **Unit tests**: > 90% coverage
- **Integration tests**: Critical paths
- **Edge cases**: Empty inputs, boundary values, errors

```typescript
// Test edge cases
describe('edge cases', () => {
  it('should handle empty string', () => {
    expect(parseInput('')).toEqual([]);
  });
  
  it('should handle maximum size', () => {
    const hugeBuffer = new ScreenBuffer(1000, 1000);
    expect(hugeBuffer.width).toBe(1000);
  });
  
  it('should handle unicode characters', () => {
    const cell = createCell('🎉');
    expect(cell.char).toBe('🎉');
    expect(cell.width).toBe(2);
  });
});
```

### Mocking

```typescript
import { vi } from 'vitest';

// Mock dependencies
vi.mock('../terminal/output.js', () => ({
  TerminalOutput: vi.fn().mockImplementation(() => ({
    write: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock timers
vi.useFakeTimers();

it('should debounce calls', () => {
  const fn = vi.fn();
  const debounced = debounce(fn, 100);
  
  debounced();
  debounced();
  debounced();
  
  expect(fn).not.toHaveBeenCalled();
  
  vi.advanceTimersByTime(100);
  
  expect(fn).toHaveBeenCalledTimes(1);
});
```

### Snapshot Testing

```typescript
it('should match snapshot', () => {
  const buffer = createBuffer(10, 5);
  drawBox(buffer, 0, 0, 10, 5);
  
  expect(bufferToString(buffer)).toMatchSnapshot();
});
```

## Pull Request Process

### Before Submitting

1. **Run all tests**
   ```bash
   npm test
   ```

2. **Check code style**
   ```bash
   npm run lint
   npm run format
   ```

3. **Update documentation**
   - Add JSDoc comments
   - Update relevant docs
   - Add to CHANGELOG.md

4. **Write tests**
   - Unit tests for new code
   - Integration tests for features
   - Update existing tests if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
- [ ] CHANGELOG.md updated
```

### Review Process

1. **Automated checks** must pass:
   - CI build
   - All tests
   - Linting
   - Code coverage

2. **Code review** by maintainers:
   - At least one approval required
   - Address all comments
   - Resolve conflicts

3. **Merge**:
   - Squash and merge
   - Use conventional commit message

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Test changes
- **chore**: Build/tooling changes

### Examples

```
feat(layout): add flex-wrap support

Implement flex-wrap property for the layout engine.
Supports nowrap, wrap, and wrap-reverse values.

Closes #123
```

```
fix(rendering): correct cell width calculation for unicode

Unicode characters with width > 1 were not being
accounted for in layout calculations.

Fixes #456
```

```
docs(api): update event handling examples

Add comprehensive examples for keyboard and mouse
event handling patterns.
```

## Release Process

### Version Bumping

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (features)
npm version minor

# Major release (breaking changes)
npm version major
```

### Release Checklist

- [ ] Update CHANGELOG.md
- [ ] Update version in package.json
- [ ] Create git tag
- [ ] Push to GitHub
- [ ] CI passes
- [ ] Publish to npm
- [ ] Create GitHub release

### CHANGELOG Format

```markdown
## [1.2.0] - 2024-01-15

### Added
- New widget: TreeView
- Support for gradient fills

### Changed
- Improved layout performance by 40%

### Fixed
- Memory leak in event loop
- Unicode rendering issues

### Deprecated
- Old color API (use new color system)
```

## Getting Help

- **Discord**: [Join our server](https://discord.gg/tui-framework)
- **GitHub Discussions**: [Ask questions](https://github.com/your-org/tui-framework/discussions)
- **Issues**: [Report bugs](https://github.com/your-org/tui-framework/issues)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

### Enforcement

Violations may result in:

1. Warning
2. Temporary ban
3. Permanent ban

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the TUI Framework! 🎉