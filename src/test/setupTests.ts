import '@testing-library/jest-dom';

// Polyfills for JSDOM environment used by Vitest

// IntersectionObserver is used by framer-motion's viewport features and isn't available in JSDOM
class MockIntersectionObserver implements IntersectionObserver {
	readonly root: Element | null = null;
	readonly rootMargin: string = '';
	readonly thresholds: ReadonlyArray<number> = [0];
	constructor(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_callback: IntersectionObserverCallback,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_options?: IntersectionObserverInit
	) {}
	observe(): void {}
	unobserve(): void {}
	disconnect(): void {}
	takeRecords(): IntersectionObserverEntry[] { return []; }
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
	(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
		MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

// Some components/libraries expect matchMedia in the environment
if (typeof globalThis.matchMedia === 'undefined') {
	(globalThis as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

// ResizeObserver is used by carousels/animations (e.g., embla-carousel)
class MockResizeObserver implements ResizeObserver {
	constructor(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_callback: ResizeObserverCallback
	) {}
	observe(): void {}
	unobserve(): void {}
	disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
	(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
		MockResizeObserver as unknown as typeof ResizeObserver;
}

// Optional: silence scrollIntoView calls in tests
if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.scrollIntoView) {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	HTMLElement.prototype.scrollIntoView = function () {} as unknown as (arg?: boolean | ScrollIntoViewOptions) => void;
}

