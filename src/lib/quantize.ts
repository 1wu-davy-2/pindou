import { PaletteColor, GenerateParams, GenerateResult } from '@/types';

function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return dr * dr + dg * dg + db * db;
}

function findNearestColor(pixel: [number, number, number], palette: PaletteColor[]): PaletteColor {
  let minDist = Infinity;
  let nearest = palette[0];
  for (const color of palette) {
    const dist = colorDistance(pixel, color.rgb);
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
  const gridSize = gridWidth * gridHeight;
  const outData = new Uint8ClampedArray(gridSize * 4);
  const colorMap = new Map<string, number>();
  const usedColorSet = new Map<string, PaletteColor>();

  const scaleX = imageData.width / gridWidth;
  const scaleY = imageData.height / gridHeight;

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const cx = Math.floor(gx * scaleX + scaleX / 2);
      const cy = Math.floor(gy * scaleY + scaleY / 2);
      const srcIdx = (cy * imageData.width + cx) * 4;

      const srcR = pixels[srcIdx];
      const srcG = pixels[srcIdx + 1];
      const srcB = pixels[srcIdx + 2];

      const nearest = findNearestColor([srcR, srcG, srcB], palette.colors);

      const outIdx = (gy * gridWidth + gx) * 4;
      const [r, g, b] = nearest.rgb;
      outData[outIdx] = r;
      outData[outIdx + 1] = g;
      outData[outIdx + 2] = b;
      outData[outIdx + 3] = 255;

      const key = nearest.code;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
      usedColorSet.set(key, nearest);
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
