import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill IntersectionObserver for JSDOM (used by framer-motion and others)
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class MockIntersectionObserver {
    constructor(_: IntersectionObserverCallback, __?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  // @ts-expect-error - assign to window for test env
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  // @ts-expect-error - assign to global for libraries referencing global directly
  (global as typeof globalThis).IntersectionObserver = window.IntersectionObserver;
}

// Polyfill matchMedia for libraries relying on media queries (e.g., embla-carousel)
if (typeof window !== 'undefined' && !('matchMedia' in window)) {
  // @ts-expect-error - define for test env
  window.matchMedia = (query: string) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    } as unknown as MediaQueryList;
  };
}

// Mock embla carousel libraries to avoid DOM/Media API issues in tests
vi.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [() => {}]
}));

vi.mock('embla-carousel-autoplay', () => ({
  __esModule: true,
  default: () => () => ({})
}));

