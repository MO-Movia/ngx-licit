/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

// Node.js 22+ ships a built-in `localStorage` global that is `undefined` unless
// `--localstorage-file` is provided. Vitest's jsdom `populateGlobal` skips
// copying jsdom's `localStorage` because the property already exists on the
// Node.js global. This setup file bridges that gap by exposing jsdom's
// `localStorage` (and `sessionStorage`) on the global so tests can use them.
const jsdom = (globalThis as { jsdom?: { window: Window } }).jsdom;
if (jsdom?.window && !globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    get: () => jsdom.window.localStorage,
    configurable: true,
  });
}
if (jsdom?.window && !globalThis.sessionStorage) {
  Object.defineProperty(globalThis, 'sessionStorage', {
    get: () => jsdom.window.sessionStorage,
    configurable: true,
  });
}
