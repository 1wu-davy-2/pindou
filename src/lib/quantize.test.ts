import { describe, expect, it } from 'vitest';
import { sampleSharpCellColors } from './quantize';

function makeImageData(width: number, height: number, pixels: number[]): ImageData {
  return {
    width,
    height,
    data: new Uint8ClampedArray(pixels),
    colorSpace: 'srgb',
  } as ImageData;
}

describe('sampleSharpCellColors', () => {
  it('keeps high contrast edges crisp instead of averaging them into gray', () => {
    const black = [0, 0, 0, 255];
    const white = [255, 255, 255, 255];
    const source = makeImageData(4, 1, [...black, ...white, ...black, ...white]);

    const colors = sampleSharpCellColors(source, 2, 1);

    expect(colors).toEqual([
      [255, 255, 255],
      [255, 255, 255],
    ]);
  });
});
