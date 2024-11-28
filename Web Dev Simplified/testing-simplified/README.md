# Setting Up Vitest and Testing Library

This guide will walk you through the steps to set up Vitest and Testing Library in your project.

## Prerequisites

Make sure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)

## Step 1: Install Vitest

First, install Vitest as a development dependency:

```bash
npm install --save-dev vitest
```

## Step 2: Install Testing Library

Next, install the necessary Testing Library packages:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

## Step 3: Configure Vitest

Create a `vitest.config.js` file in the root of your project and add the following configuration:

```javascript
/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.js',
  },
});
```

## Step 4: Setup Testing Library

Create a `setupTests.js` file in the root of your project and add the following setup code:

```javascript
import '@testing-library/jest-dom';
```

## Step 5: Write Your Tests

You can now write your tests using Vitest and Testing Library. Create a `__tests__` directory and add your test files there. For example, create a `App.test.js` file:

```javascript
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

## Step 6: Run Your Tests

To run your tests, add the following script to your `package.json`:

```json
"scripts": {
  "test": "vitest"
}
```

Then, run the tests using the following command:

```bash
npm test
```

That's it! You have successfully set up Vitest and Testing Library in your project. Happy testing!