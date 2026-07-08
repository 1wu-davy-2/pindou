import { GenerateResult } from '@/types';

const CELL_GAP = 1;
const LABEL_FONT_SIZE = 10;

export function drawPixelPreview(
  canvas: HTMLCanvasElement,
  result: GenerateResult,
  cellSize: number
): void {
  const { pixelData, gridWidth, gridHeight } = result;
  const w = gridWidth * (cellSize + CELL_GAP) + CELL_GAP;
  const h = gridHeight * (cellSize + CELL_GAP) + CELL_GAP;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const idx = (y * gridWidth + x) * 4;
      const [r, g, b, a] = pixelData.data.slice(idx, idx + 4);
      ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      ctx.fillRect(
        CELL_GAP + x * (cellSize + CELL_GAP),
        CELL_GAP + y * (cellSize + CELL_GAP),
        cellSize,
        cellSize
      );
    }
  }
}

export function drawColorCodeView(
  canvas: HTMLCanvasElement,
  result: GenerateResult,
  cellSize: number
): void {
  const { pixelData, gridWidth, gridHeight, usedColors } = result;
  const codeMap = new Map<string, string>();
  for (const c of usedColors) {
    codeMap.set(c.code, c.code);
  }

  const w = gridWidth * (cellSize + CELL_GAP) + CELL_GAP;
  const h = gridHeight * (cellSize + CELL_GAP) + CELL_GAP;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(0, 0, w, h);

  const codeColors = new Map<string, [number, number, number]>();

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const idx = (y * gridWidth + x) * 4;
      const r = pixelData.data[idx];
      const g = pixelData.data[idx + 1];
      const b = pixelData.data[idx + 2];
      const colorKey = `${r},${g},${b}`;

      if (!codeColors.has(colorKey)) {
        codeColors.set(colorKey, [r, g, b]);
      }

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(
        CELL_GAP + x * (cellSize + CELL_GAP),
        CELL_GAP + y * (cellSize + CELL_GAP),
        cellSize,
        cellSize
      );
    }
  }

  const brandCodeMap = new Map<string, string>();
  for (const c of usedColors) {
    brandCodeMap.set(`${c.rgb[0]},${c.rgb[1]},${c.rgb[2]}`, c.code);
  }

  ctx.font = `${LABEL_FONT_SIZE}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const idx = (y * gridWidth + x) * 4;
      const colorKey = `${pixelData.data[idx]},${pixelData.data[idx + 1]},${pixelData.data[idx + 2]}`;
      const code = brandCodeMap.get(colorKey);
      if (!code) continue;

      const px = CELL_GAP + x * (cellSize + CELL_GAP) + cellSize / 2;
      const py = CELL_GAP + y * (cellSize + CELL_GAP) + cellSize / 2;
      const [r, g, b] = codeColors.get(colorKey) || [0, 0, 0];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      ctx.fillStyle = brightness > 128 ? '#000' : '#fff';
      ctx.fillText(code, px, py);
    }
  }
}
