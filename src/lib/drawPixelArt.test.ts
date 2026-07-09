import { describe, expect, it, vi } from 'vitest';
import { setupHiDpiCanvas } from './drawPixelArt';

describe('setupHiDpiCanvas', () => {
  it('sizes the backing canvas by device pixel ratio without forcing distorted CSS height', () => {
    const scale = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      style: {} as CSSStyleDeclaration,
      getContext: () => ({
        scale,
        imageSmoothingEnabled: true,
      }),
    } as unknown as HTMLCanvasElement;

    const ctx = setupHiDpiCanvas(canvas, 100, 50, 2);

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);
    expect(canvas.style.width).toBe('100px');
    expect(canvas.style.height).toBe('auto');
    expect(canvas.style.aspectRatio).toBe('100 / 50');
    expect(ctx.imageSmoothingEnabled).toBe(false);
    expect(scale).toHaveBeenCalledWith(2, 2);
  });
});
