import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();

// Node's real BroadcastChannel would keep the test process alive and leak between tests.
class FakeChannel {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage() {}
  close() {}
}
vi.stubGlobal("BroadcastChannel", FakeChannel);

afterEach(() => {
  cleanup();
  localStorage.clear();
  history.replaceState(null, "", "/");
  delete document.documentElement.dataset.motion;
  delete document.documentElement.dataset.frozen;
  delete document.documentElement.dataset.presenter;
  vi.mocked(window.scrollTo).mockClear();
});
