import { PaletteColor, GenerateParams, GenerateResult } from '@/types';

function weightedColorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

function findNearestColor(pixel: [number, number, number], palette: PaletteColor[]): PaletteColor {
  let minDist = Infinity;
  let nearest = palette[0];
  for (const color of palette) {
    const dist = weightedColorDistance(pixel, color.rgb);
    if (dist < minDist) {
      minDist = dist;
      nearest = color;
    }
  }
  return nearest;
}

export function generatePixelData(
  imageData: ImageData,
  params: GenerateParams
): GenerateResult {
  const { gridWidth, gridHeight, palette } = params;
  const colorMap = new Map<string, number>();
  const usedColorSet = new Map<string, PaletteColor>();

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = imageData.width;
  srcCanvas.height = imageData.height;
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCtx.putImageData(imageData, 0, 0);

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = gridWidth;
  thumbCanvas.height = gridHeight;
  const thumbCtx = thumbCanvas.getContext('2d')!;
  thumbCtx.imageSmoothingEnabled = true;
  thumbCtx.imageSmoothingQuality = 'high';
  thumbCtx.drawImage(srcCanvas, 0, 0, gridWidth, gridHeight);

  const downscaled = thumbCtx.getImageData(0, 0, gridWidth, gridHeight);
  const pixels = downscaled.data;

  const scaleX = imageData.width / gridWidth;
  const scaleY = imageData.height / gridHeight;

  const cellColors: [number, number, number][] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const idx = (gy * gridWidth + gx) * 4;
      cellColors.push([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
    }
  }

  const outData = new Uint8ClampedArray(gridWidth * gridHeight * 4);
  const errR: number[][] = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(0));
  const errG: number[][] = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(0));
  const errB: number[][] = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(0));

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const idx = gy * gridWidth + gx;
      const [ar, ag, ab] = cellColors[idx];
      const r = Math.min(255, Math.max(0, Math.round(ar + errR[gy][gx])));
      const g = Math.min(255, Math.max(0, Math.round(ag + errG[gy][gx])));
      const b = Math.min(255, Math.max(0, Math.round(ab + errB[gy][gx])));

      const nearest = findNearestColor([r, g, b], palette.colors);
      const [mr, mg, mb] = nearest.rgb;

      const derrR = r - mr;
      const derrG = g - mg;
      const derrB = b - mb;

      const oi = idx * 4;
      outData[oi] = mr;
      outData[oi + 1] = mg;
      outData[oi + 2] = mb;
      outData[oi + 3] = 255;

      const key = nearest.code;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
      usedColorSet.set(key, nearest);

      const distort = (tx: number, ty: number, w: number) => {
        if (tx < 0 || tx >= gridWidth || ty < 0 || ty >= gridHeight) return;
        errR[ty][tx] += derrR * w;
        errG[ty][tx] += derrG * w;
        errB[ty][tx] += derrB * w;
      };

      distort(gx + 1, gy, 7 / 16);
      distort(gx - 1, gy + 1, 3 / 16);
      distort(gx, gy + 1, 5 / 16);
      distort(gx + 1, gy + 1, 1 / 16);
    }
  }

  const finalPixelData = new ImageData(outData, gridWidth, gridHeight);

  return {
    pixelData: finalPixelData,
    colorMap,
    usedColors: Array.from(usedColorSet.values()),
    gridWidth,
    gridHeight,
  };
}
