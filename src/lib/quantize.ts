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

function clampByte(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function getPixel(imageData: ImageData, x: number, y: number): [number, number, number] {
  const px = Math.min(imageData.width - 1, Math.max(0, x));
  const py = Math.min(imageData.height - 1, Math.max(0, y));
  const idx = (py * imageData.width + px) * 4;
  return [
    imageData.data[idx],
    imageData.data[idx + 1],
    imageData.data[idx + 2],
  ];
}

export function sampleSharpCellColors(
  imageData: ImageData,
  gridWidth: number,
  gridHeight: number
): [number, number, number][] {
  const scaleX = imageData.width / gridWidth;
  const scaleY = imageData.height / gridHeight;
  const cellColors: [number, number, number][] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const x0 = Math.floor(gx * scaleX);
      const x1 = Math.max(x0 + 1, Math.ceil((gx + 1) * scaleX));
      const y0 = Math.floor(gy * scaleY);
      const y1 = Math.max(y0 + 1, Math.ceil((gy + 1) * scaleY));

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let minLuma = 255;
      let maxLuma = 0;
      let count = 0;

      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const [r, g, b] = getPixel(imageData, sx, sy);
          sumR += r;
          sumG += g;
          sumB += b;
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          minLuma = Math.min(minLuma, luma);
          maxLuma = Math.max(maxLuma, luma);
          count++;
        }
      }

      const avgR = sumR / count;
      const avgG = sumG / count;
      const avgB = sumB / count;
      const centerX = Math.floor((gx + 0.5) * scaleX);
      const centerY = Math.floor((gy + 0.5) * scaleY);
      const [centerR, centerG, centerB] = getPixel(imageData, centerX, centerY);
      const contrast = maxLuma - minLuma;
      const centerWeight = Math.min(1, contrast / 255);

      cellColors.push([
        clampByte(avgR * (1 - centerWeight) + centerR * centerWeight),
        clampByte(avgG * (1 - centerWeight) + centerG * centerWeight),
        clampByte(avgB * (1 - centerWeight) + centerB * centerWeight),
      ]);
    }
  }

  return cellColors;
}

export function generatePixelData(
  imageData: ImageData,
  params: GenerateParams
): GenerateResult {
  const { gridWidth, gridHeight, palette } = params;
  const colorMap = new Map<string, number>();
  const usedColorSet = new Map<string, PaletteColor>();

  const cellColors = sampleSharpCellColors(imageData, gridWidth, gridHeight);

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
