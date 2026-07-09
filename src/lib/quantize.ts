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
  const pixels = imageData.data;
  const imgW = imageData.width;
  const imgH = imageData.height;
  const gridSize = gridWidth * gridHeight;
  const outData = new Uint8ClampedArray(gridSize * 4);
  const colorMap = new Map<string, number>();
  const usedColorSet = new Map<string, PaletteColor>();

  const scaleX = imgW / gridWidth;
  const scaleY = imgH / gridHeight;

  const cellColors: [number, number, number][] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const x0 = Math.floor(gx * scaleX);
      const y0 = Math.floor(gy * scaleY);
      const x1 = Math.floor((gx + 1) * scaleX);
      const y1 = Math.floor((gy + 1) * scaleY);

      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const idx = (py * imgW + px) * 4;
          sumR += pixels[idx];
          sumG += pixels[idx + 1];
          sumB += pixels[idx + 2];
          count++;
        }
      }

      const avgR = Math.round(sumR / count);
      const avgG = Math.round(sumG / count);
      const avgB = Math.round(sumB / count);
      cellColors.push([avgR, avgG, avgB]);
    }
  }

  const errors: [number, number, number][] = new Array(gridSize).fill([0, 0, 0]).map(() => [0, 0, 0]);

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const idx = gy * gridWidth + gx;
      const [ar, ag, ab] = cellColors[idx];
      const [er, eg, eb] = errors[idx];
      const adjustedR = Math.min(255, Math.max(0, Math.round(ar + er)));
      const adjustedG = Math.min(255, Math.max(0, Math.round(ag + eg)));
      const adjustedB = Math.min(255, Math.max(0, Math.round(ab + eb)));

      const nearest = findNearestColor([adjustedR, adjustedG, adjustedB], palette.colors);
      const [mr, mg, mb] = nearest.rgb;

      const errR = adjustedR - mr;
      const errG = adjustedG - mg;
      const errB = adjustedB - mb;

      const outIdx = idx * 4;
      outData[outIdx] = mr;
      outData[outIdx + 1] = mg;
      outData[outIdx + 2] = mb;
      outData[outIdx + 3] = 255;

      const key = nearest.code;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
      usedColorSet.set(key, nearest);

      const distribute = (tx: number, ty: number, w: number) => {
        if (tx < 0 || tx >= gridWidth || ty < 0 || ty >= gridHeight) return;
        const eIdx = ty * gridWidth + tx;
        const prev = errors[eIdx];
        errors[eIdx] = [prev[0] + errR * w, prev[1] + errG * w, prev[2] + errB * w];
      };

      distribute(gx + 1, gy, 7 / 16);
      distribute(gx - 1, gy + 1, 3 / 16);
      distribute(gx, gy + 1, 5 / 16);
      distribute(gx + 1, gy + 1, 1 / 16);
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
