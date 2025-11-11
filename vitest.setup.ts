
import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function(pointerId) {
        if (!this.m_capturedPointerIds) {
            return false;
        }
        return this.m_capturedPointerIds.has(pointerId);
    };
}
if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = function(pointerId) {
        if (this.m_capturedPointerIds === undefined) {
            this.m_capturedPointerIds = new Set();
        }
        this.m_capturedPointerIds.add(pointerId);
    };
}
if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = function(pointerId) {
        this.m_capturedPointerIds.delete(pointerId);
    };
}

Element.prototype.scrollIntoView = vi.fn();
