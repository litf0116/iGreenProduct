import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.location
delete (window as any).location;
window.location = { href: '' };

// Store original localStorage methods
const originalGetItem = window.localStorage.getItem;
const originalSetItem = window.localStorage.setItem;
const originalRemoveItem = window.localStorage.removeItem;
const originalClear = window.localStorage.clear;

// Create localStorage mock that forwards to real localStorage
// This allows both mocking in component tests and real usage in API tests
const localStorageMock = {
  getItem: vi.fn((key: string) => originalGetItem.call(window.localStorage, key)),
  setItem: vi.fn((key: string, value: string) => originalSetItem.call(window.localStorage, key, value)),
  removeItem: vi.fn((key: string) => originalRemoveItem.call(window.localStorage, key)),
  clear: vi.fn(() => originalClear.call(window.localStorage)),
};

global.localStorage = localStorageMock as Storage;
