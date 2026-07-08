# 拼豆图片生成器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a website that converts uploaded images into Perler bead (拼豆) patterns with multiple brand palettes, color-coded views, and PDF export.

**Architecture:** Pure client-side SPA using Next.js 15 App Router. Image processing via Canvas API in the browser. Color quantization via RGB nearest-neighbor matching against built-in brand palettes. PDF generation via jsPDF. Static deploy to Vercel.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Canvas API, jsPDF

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `E:\opt\pindou\package.json`
- Create: `E:\opt\pindou\tsconfig.json`
- Create: `E:\opt\pindou\next.config.ts`
- Create: `E:\opt\pindou\postcss.config.js`
- Create: `E:\opt\pindou\tailwind.config.ts`
- Create: `E:\opt\pindou\src\app\globals.css`
- Create: `E:\opt\pindou\src\app\layout.tsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "pindou",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "jspdf": "^2.5.2"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd E:\opt\pindou && npm install`

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.ts**

```ts
const nextConfig = {};
module.exports = nextConfig;
```

- [ ] **Step 5: Create postcss.config.js**

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: { '@tailwindcss/postcss': {} },
};
module.exports = config;
```

- [ ] **Step 6: Create tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
};
export default config;
```

- [ ] **Step 7: Create src/app/globals.css**

```css
@import "tailwindcss";
```

- [ ] **Step 8: Create src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '拼豆工坊 - 图片转拼豆图案',
  description: '上传图片，生成拼豆（Perler Beads）图案，支持多品牌色板',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Create .gitignore**

```
node_modules/
.next/
out/
```

- [ ] **Step 10: Verify build**

Run: `cd E:\opt\pindou && npx next build` (should succeed with empty page)

---

### Task 2: Type Definitions

**Files:**
- Create: `E:\opt\pindou\src\types\index.ts`

- [ ] **Step 1: Write type definitions**

```ts
export interface PaletteColor {
  name: string;
  code: string;
  hex: string;
  rgb: [number, number, number];
}

export interface Palette {
  brand: 'Perler' | 'Hama' | 'Artkal';
  name: string;
  colors: PaletteColor[];
}

export enum OutputMode {
  PixelOnly = 'pixel',
  ColorCode = 'colorcode',
  PixelAndCode = 'both',
  All = 'all',
}

export interface GenerateParams {
  gridWidth: number;
  gridHeight: number;
  palette: Palette;
  mode: OutputMode;
  maxColors?: number;
}

export interface GenerateResult {
  pixelData: ImageData;
  colorMap: Map<string, number>;
  usedColors: PaletteColor[];
  gridWidth: number;
  gridHeight: number;
}
```

---

### Task 3: Brand Color Palettes

**Files:**
- Create: `E:\opt\pindou\src\lib\palettes.ts`

- [ ] **Step 1: Write palette data**

```ts
import { Palette } from '@/types';

export const palettes: Palette[] = [
  {
    brand: 'Perler',
    name: 'Perler Beads',
    colors: [
      { name: 'White',       code: '01', hex: '#FFFFFF', rgb: [255, 255, 255] },
      { name: 'Cream',       code: '02', hex: '#FFFDD0', rgb: [255, 253, 208] },
      { name: 'Tan',         code: '03', hex: '#D2B48C', rgb: [210, 180, 140] },
      { name: 'Light Brown', code: '04', hex: '#8B6914', rgb: [139, 105, 20] },
      { name: 'Dark Brown',  code: '05', hex: '#5C4033', rgb: [92, 64, 51] },
      { name: 'Black',       code: '06', hex: '#1C1C1C', rgb: [28, 28, 28] },
      { name: 'Red',         code: '07', hex: '#EE2C2C', rgb: [238, 44, 44] },
      { name: 'Orange',      code: '08', hex: '#FF8C00', rgb: [255, 140, 0] },
      { name: 'Yellow',      code: '09', hex: '#FFD700', rgb: [255, 215, 0] },
      { name: 'Lime',        code: '10', hex: '#7CFC00', rgb: [124, 252, 0] },
      { name: 'Green',       code: '11', hex: '#228B22', rgb: [34, 139, 34] },
      { name: 'Dark Green',  code: '12', hex: '#006400', rgb: [0, 100, 0] },
      { name: 'Sky Blue',    code: '13', hex: '#87CEEB', rgb: [135, 206, 235] },
      { name: 'Blue',        code: '14', hex: '#4169E1', rgb: [65, 105, 225] },
      { name: 'Dark Blue',   code: '15', hex: '#000080', rgb: [0, 0, 128] },
      { name: 'Purple',      code: '16', hex: '#800080', rgb: [128, 0, 128] },
      { name: 'Pink',        code: '17', hex: '#FF69B4', rgb: [255, 105, 180] },
      { name: 'Pastel Pink', code: '18', hex: '#FFB6C1', rgb: [255, 182, 193] },
      { name: 'Peach',       code: '19', hex: '#FFDAB9', rgb: [255, 218, 185] },
      { name: 'Gray',        code: '20', hex: '#808080', rgb: [128, 128, 128] },
      { name: 'Light Gray',  code: '21', hex: '#C0C0C0', rgb: [192, 192, 192] },
      { name: 'Dark Gray',   code: '22', hex: '#404040', rgb: [64, 64, 64] },
      { name: 'Coral',       code: '23', hex: '#FF6B6B', rgb: [255, 107, 107] },
      { name: 'Teal',        code: '24', hex: '#008080', rgb: [0, 128, 128] },
      { name: 'Turquoise',   code: '25', hex: '#40E0D0', rgb: [64, 224, 208] },
      { name: 'Lavender',    code: '26', hex: '#E6E6FA', rgb: [230, 230, 250] },
      { name: 'Maroon',      code: '27', hex: '#800000', rgb: [128, 0, 0] },
      { name: 'Olive',       code: '28', hex: '#808000', rgb: [128, 128, 0] },
      { name: 'Navy',        code: '29', hex: '#1A237E', rgb: [26, 35, 126] },
      { name: 'Hot Coral',   code: '30', hex: '#FF6F61', rgb: [255, 111, 97] },
    ],
  },
  {
    brand: 'Hama',
    name: 'Hama Beads',
    colors: [
      { name: 'White',       code: '01', hex: '#FFFFFF', rgb: [255, 255, 255] },
      { name: 'Black',       code: '02', hex: '#1C1C1C', rgb: [28, 28, 28] },
      { name: 'Red',         code: '03', hex: '#D32F2F', rgb: [211, 47, 47] },
      { name: 'Orange',      code: '04', hex: '#F57C00', rgb: [245, 124, 0] },
      { name: 'Yellow',      code: '05', hex: '#FBC02D', rgb: [251, 192, 45] },
      { name: 'Light Green', code: '06', hex: '#8BC34A', rgb: [139, 195, 74] },
      { name: 'Dark Green',  code: '07', hex: '#388E3C', rgb: [56, 142, 60] },
      { name: 'Sky Blue',    code: '08', hex: '#81D4FA', rgb: [129, 212, 250] },
      { name: 'Blue',        code: '09', hex: '#1976D2', rgb: [25, 118, 210] },
      { name: 'Dark Blue',   code: '10', hex: '#1A237E', rgb: [26, 35, 126] },
      { name: 'Purple',      code: '11', hex: '#7B1FA2', rgb: [123, 31, 162] },
      { name: 'Pink',        code: '12', hex: '#EC407A', rgb: [236, 64, 122] },
      { name: 'Brown',       code: '13', hex: '#5D4037', rgb: [93, 64, 55] },
      { name: 'Beige',       code: '14', hex: '#F5F5DC', rgb: [245, 245, 220] },
      { name: 'Gray',        code: '15', hex: '#9E9E9E', rgb: [158, 158, 158] },
      { name: 'Dark Gray',   code: '16', hex: '#616161', rgb: [97, 97, 97] },
      { name: 'Light Blue',  code: '17', hex: '#BBDEFB', rgb: [187, 222, 251] },
      { name: 'Turquoise',   code: '18', hex: '#0097A7', rgb: [0, 151, 167] },
      { name: 'Lavender',    code: '19', hex: '#CE93D8', rgb: [206, 147, 216] },
      { name: 'Light Pink',  code: '20', hex: '#F8BBD0', rgb: [248, 187, 208] },
      { name: 'Lime',        code: '21', hex: '#CDDC39', rgb: [205, 220, 57] },
      { name: 'Maroon',      code: '22', hex: '#880E4F', rgb: [136, 14, 79] },
      { name: 'Navy',        code: '23', hex: '#0D47A1', rgb: [13, 71, 161] },
      { name: 'Cream',       code: '24', hex: '#FFECB3', rgb: [255, 236, 179] },
      { name: 'Salmon',      code: '25', hex: '#FF8A80', rgb: [255, 138, 128] },
      { name: 'Pistachio',   code: '26', hex: '#C5E1A5', rgb: [197, 225, 165] },
    ],
  },
  {
    brand: 'Artkal',
    name: 'Artkal Beads',
    colors: [
      { name: 'White',       code: 'A01', hex: '#FFFFFF', rgb: [255, 255, 255] },
      { name: 'Black',       code: 'A02', hex: '#1A1A1A', rgb: [26, 26, 26] },
      { name: 'Red',         code: 'A03', hex: '#E53935', rgb: [229, 57, 53] },
      { name: 'Dark Red',    code: 'A04', hex: '#B71C1C', rgb: [183, 28, 28] },
      { name: 'Orange',      code: 'A05', hex: '#FB8C00', rgb: [251, 140, 0] },
      { name: 'Dark Orange', code: 'A06', hex: '#E65100', rgb: [230, 81, 0] },
      { name: 'Yellow',      code: 'A07', hex: '#FFD600', rgb: [255, 214, 0] },
      { name: 'Lemon',       code: 'A08', hex: '#FFF176', rgb: [255, 241, 118] },
      { name: 'Lime',        code: 'A09', hex: '#C6FF00', rgb: [198, 255, 0] },
      { name: 'Green',       code: 'A10', hex: '#43A047', rgb: [67, 160, 71] },
      { name: 'Dark Green',  code: 'A11', hex: '#1B5E20', rgb: [27, 94, 32] },
      { name: 'Forest',      code: 'A12', hex: '#2E7D32', rgb: [46, 125, 50] },
      { name: 'Sky Blue',    code: 'A13', hex: '#81D4FA', rgb: [129, 212, 250] },
      { name: 'Blue',        code: 'A14', hex: '#1E88E5', rgb: [30, 136, 229] },
      { name: 'Dark Blue',   code: 'A15', hex: '#0D47A1', rgb: [13, 71, 161] },
      { name: 'Royal Blue',  code: 'A16', hex: '#1565C0', rgb: [21, 101, 192] },
      { name: 'Purple',      code: 'A17', hex: '#8E24AA', rgb: [142, 36, 170] },
      { name: 'Dark Purple', code: 'A18', hex: '#4A148C', rgb: [74, 20, 140] },
      { name: 'Pink',        code: 'A19', hex: '#EC407A', rgb: [236, 64, 122] },
      { name: 'Hot Pink',    code: 'A20', hex: '#D81B60', rgb: [216, 27, 96] },
      { name: 'Pastel Pink', code: 'A21', hex: '#F8BBD0', rgb: [248, 187, 208] },
      { name: 'Peach',       code: 'A22', hex: '#FFCCBC', rgb: [255, 204, 188] },
      { name: 'Coral',       code: 'A23', hex: '#FF7043', rgb: [255, 112, 67] },
      { name: 'Brown',       code: 'A24', hex: '#6D4C41', rgb: [109, 76, 65] },
      { name: 'Dark Brown',  code: 'A25', hex: '#3E2723', rgb: [62, 39, 35] },
      { name: 'Beige',       code: 'A26', hex: '#FFE0B2', rgb: [255, 224, 178] },
      { name: 'Gray',        code: 'A27', hex: '#9E9E9E', rgb: [158, 158, 158] },
      { name: 'Dark Gray',   code: 'A28', hex: '#424242', rgb: [66, 66, 66] },
      { name: 'Light Gray',  code: 'A29', hex: '#E0E0E0', rgb: [224, 224, 224] },
      { name: 'Turquoise',   code: 'A30', hex: '#00BCD4', rgb: [0, 188, 212] },
      { name: 'Teal',        code: 'A31', hex: '#00897B', rgb: [0, 137, 123] },
      { name: 'Lavender',    code: 'A32', hex: '#CE93D8', rgb: [206, 147, 216] },
      { name: 'Maroon',      code: 'A33', hex: '#880E4F', rgb: [136, 14, 79] },
      { name: 'Olive',       code: 'A34', hex: '#827717', rgb: [130, 119, 23] },
      { name: 'Navy',        code: 'A35', hex: '#1A237E', rgb: [26, 35, 126] },
      { name: 'Salmon',      code: 'A36', hex: '#FFAB91', rgb: [255, 171, 145] },
      { name: 'Mint',        code: 'A37', hex: '#A5D6A7', rgb: [165, 214, 167] },
      { name: 'Ivory',       code: 'A38', hex: '#FFF8E1', rgb: [255, 248, 225] },
      { name: 'Wine Red',    code: 'A39', hex: '#4A0024', rgb: [74, 0, 36] },
      { name: 'Chocolate',   code: 'A40', hex: '#4E342E', rgb: [78, 52, 46] },
    ],
  },
];

export function getPalette(brand: string): Palette | undefined {
  return palettes.find((p) => p.brand === brand);
}
```

---

### Task 4: Color Quantization Algorithm

**Files:**
- Create: `E:\opt\pindou\src\lib\quantize.ts`

- [ ] **Step 1: Write the quantize module**

```ts
import { PaletteColor, Palette, GenerateParams, GenerateResult } from '@/types';

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
  const { gridWidth, gridHeight, palette, mode } = params;
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
```

---

### Task 5: Canvas Drawing Utilities

**Files:**
- Create: `E:\opt\pindou\src\lib\drawPixelArt.ts`

- [ ] **Step 1: Write canvas drawing utilities**

```ts
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
```

---

### Task 6: PDF Generation

**Files:**
- Create: `E:\opt\pindou\src\lib\generatePdf.ts`

- [ ] **Step 1: Write PDF generation**

```ts
import { jsPDF } from 'jspdf';
import { GenerateResult } from '@/types';

export function downloadPdf(result: GenerateResult, brandLabel: string): void {
  const { usedColors, colorMap } = result;
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;

  doc.setFontSize(18);
  doc.text('拼豆图案 - ' + brandLabel, margin, 25);

  doc.setFontSize(10);
  doc.text(`网格尺寸: ${result.gridWidth} x ${result.gridHeight}`, margin, 35);

  let y = 45;

  const sortedColors = [...usedColors].sort((a, b) => {
    const countA = colorMap.get(a.code) || 0;
    const countB = colorMap.get(b.code) || 0;
    return countB - countA;
  });

  doc.setFontSize(14);
  doc.text('耗材清单', margin, y);
  y += 8;

  const colW = contentW / 4;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('色号', margin, y);
  doc.text('名称', margin + colW, y);
  doc.text('颜色', margin + colW * 2, y);
  doc.text('数量', margin + colW * 3, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  for (const color of sortedColors) {
    const count = colorMap.get(color.code) || 0;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(8);
    doc.text(color.code, margin, y);
    doc.text(color.name, margin + colW, y);

    doc.setFillColor(color.rgb[0], color.rgb[1], color.rgb[2]);
    doc.rect(margin + colW * 2, y - 3, 12, 5, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin + colW * 2, y - 3, 12, 5, 'S');

    doc.text(String(count), margin + colW * 3, y);
    y += 6;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`拼豆总数: ${result.gridWidth * result.gridHeight}`, margin, y + 10);

  doc.save(`pindou-${result.gridWidth}x${result.gridHeight}.pdf`);
}
```

---

### Task 7: ImageUploader Component

**Files:**
- Create: `E:\opt\pindou\src\components\ImageUploader.tsx`

- [ ] **Step 1: Write ImageUploader component**

```tsx
'use client';

import { useCallback, useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageLoad: (img: HTMLImageElement) => void;
}

export default function ImageUploader({ onImageLoad }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreview(url);
        const img = new Image();
        img.onload = () => onImageLoad(img);
        img.src = url;
      };
      reader.readAsDataURL(file);
    },
    [onImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="max-h-64 mx-auto rounded-lg object-contain"
        />
      ) : (
        <div className="text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">点击或拖拽上传图片</p>
          <p className="text-xs mt-1">支持 JPG / PNG / WebP</p>
        </div>
      )}
    </div>
  );
}
```

---

### Task 8: ParameterPanel Component

**Files:**
- Create: `E:\opt\pindou\src\components\ParameterPanel.tsx`

- [ ] **Step 1: Write ParameterPanel component**

```tsx
'use client';

import { Palette, OutputMode } from '@/types';

interface ParameterPanelProps {
  palettes: Palette[];
  selectedPalette: Palette;
  onPaletteChange: (p: Palette) => void;
  gridWidth: number;
  gridHeight: number;
  onGridChange: (w: number, h: number) => void;
  outputMode: OutputMode;
  onOutputModeChange: (m: OutputMode) => void;
  maxColors: number;
  onMaxColorsChange: (n: number) => void;
  onGenerate: () => void;
  hasImage: boolean;
  generating: boolean;
}

const GRID_PRESETS = [
  { label: '29×29', w: 29, h: 29 },
  { label: '45×45', w: 45, h: 45 },
  { label: '58×58', w: 58, h: 58 },
  { label: '72×72', w: 72, h: 72 },
];

export default function ParameterPanel({
  palettes,
  selectedPalette,
  onPaletteChange,
  gridWidth,
  gridHeight,
  onGridChange,
  outputMode,
  onOutputModeChange,
  onGenerate,
  hasImage,
  generating,
}: ParameterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Grid Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          拼豆板尺寸
        </label>
        <div className="flex flex-wrap gap-2">
          {GRID_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onGridChange(preset.w, preset.h)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                gridWidth === preset.w && gridHeight === preset.h
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            min={4}
            max={200}
            value={gridWidth}
            onChange={(e) => onGridChange(Number(e.target.value), gridHeight)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg"
            placeholder="W"
          />
          <span className="text-gray-400 self-center">×</span>
          <input
            type="number"
            min={4}
            max={200}
            value={gridHeight}
            onChange={(e) => onGridChange(gridWidth, Number(e.target.value))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg"
            placeholder="H"
          />
        </div>
      </div>

      {/* Palette */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          品牌色板
        </label>
        <div className="flex flex-wrap gap-2">
          {palettes.map((p) => (
            <button
              key={p.brand}
              onClick={() => onPaletteChange(p)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedPalette.brand === p.brand
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {p.name}
              <span className="ml-1 text-xs opacity-75">({p.colors.length}色)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Output Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          输出模式
        </label>
        <div className="flex flex-wrap gap-3">
          {[
            { value: OutputMode.All, label: '全部' },
            { value: OutputMode.PixelAndCode, label: '像素图+编号' },
            { value: OutputMode.PixelOnly, label: '仅像素图' },
            { value: OutputMode.ColorCode, label: '仅编号图' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="outputMode"
                checked={outputMode === opt.value}
                onChange={() => onOutputModeChange(opt.value)}
                className="accent-blue-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!hasImage || generating}
        className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${
          hasImage && !generating
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {generating ? '生成中...' : '✨ 生成拼豆图'}
      </button>
    </div>
  );
}
```

---

### Task 9: Result Components (PixelPreview, ColorCodeView, MaterialList, DownloadBar)

**Files:**
- Create: `E:\opt\pindou\src\components\PixelPreview.tsx`
- Create: `E:\opt\pindou\src\components\ColorCodeView.tsx`
- Create: `E:\opt\pindou\src\components\MaterialList.tsx`
- Create: `E:\opt\pindou\src\components\DownloadBar.tsx`

- [ ] **Step 1: Write PixelPreview component (with forwardRef for download access)**

```tsx
'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { GenerateResult } from '@/types';
import { drawPixelPreview } from '@/lib/drawPixelArt';

interface PixelPreviewProps {
  result: GenerateResult | null;
  cellSize?: number;
}

const PixelPreview = forwardRef<HTMLCanvasElement, PixelPreviewProps>(
  function PixelPreview({ result, cellSize = 14 }, ref) {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref || internalRef) as React.RefObject<HTMLCanvasElement | null>;

    useEffect(() => {
      if (!result || !canvasRef.current) return;
      drawPixelPreview(canvasRef.current, result, cellSize);
    }, [result, cellSize]);

    if (!result) {
      return (
        <div className="bg-gray-100 rounded-xl flex items-center justify-center aspect-square text-gray-400 text-sm">
          上传图片后生成预览
        </div>
      );
    }

    return (
      <canvas
        ref={canvasRef}
        className="rounded-xl max-w-full mx-auto"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }
);

export default PixelPreview;
```

- [ ] **Step 2: Write ColorCodeView component (with forwardRef for download access)**

```tsx
'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { GenerateResult } from '@/types';
import { drawColorCodeView } from '@/lib/drawPixelArt';

interface ColorCodeViewProps {
  result: GenerateResult | null;
  cellSize?: number;
}

const ColorCodeView = forwardRef<HTMLCanvasElement, ColorCodeViewProps>(
  function ColorCodeView({ result, cellSize = 14 }, ref) {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref || internalRef) as React.RefObject<HTMLCanvasElement | null>;

    useEffect(() => {
      if (!result || !canvasRef.current) return;
      drawColorCodeView(canvasRef.current, result, cellSize);
    }, [result, cellSize]);

    if (!result) return null;

    return (
      <canvas
        ref={canvasRef}
        className="rounded-xl max-w-full mx-auto"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }
);

export default ColorCodeView;
```

- [ ] **Step 3: Write MaterialList component**

```tsx
'use client';

import { GenerateResult } from '@/types';

interface MaterialListProps {
  result: GenerateResult | null;
}

export default function MaterialList({ result }: MaterialListProps) {
  if (!result) return null;

  const sorted = [...result.usedColors].sort((a, b) => {
    const ca = result.colorMap.get(a.code) || 0;
    const cb = result.colorMap.get(b.code) || 0;
    return cb - ca;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium text-sm">耗材清单</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          共 {sorted.length} 种颜色 · {result.gridWidth * result.gridHeight} 颗拼豆
        </p>
      </div>
      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {sorted.map((color) => {
          const count = result.colorMap.get(color.code) || 0;
          const bgColor = `rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})`;
          const brightness = 0.299 * color.rgb[0] + 0.587 * color.rgb[1] + 0.114 * color.rgb[2];
          const textColor = brightness > 128 ? '#000' : '#fff';

          return (
            <div key={color.code} className="flex items-center gap-3 px-4 py-2 text-sm">
              <div
                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-[8px] font-mono shrink-0"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {color.code}
              </div>
              <span className="flex-1 text-gray-600">{color.name}</span>
              <span className="text-gray-400 text-xs">{color.code}</span>
              <span className="font-mono text-gray-700">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write DownloadBar component (accepts refs from parent)**

```tsx
'use client';

import { RefObject } from 'react';
import { GenerateResult } from '@/types';
import { downloadPdf } from '@/lib/generatePdf';

interface DownloadBarProps {
  result: GenerateResult | null;
  brandLabel: string;
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  codeCanvasRef: RefObject<HTMLCanvasElement | null>;
}

export default function DownloadBar({ result, brandLabel, previewCanvasRef, codeCanvasRef }: DownloadBarProps) {
  if (!result) return null;

  const downloadPNG = (canvas: HTMLCanvasElement | null, suffix: string) => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pindou-${result.gridWidth}x${result.gridHeight}-${suffix}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => downloadPNG(previewCanvasRef.current, 'preview')}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        ⬇ 下载 PNG (像素图)
      </button>
      <button
        onClick={() => downloadPNG(codeCanvasRef.current, 'code')}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        ⬇ 下载 PNG (编号图)
      </button>
      <button
        onClick={() => downloadPdf(result, brandLabel)}
        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
      >
        ⬇ 下载 PDF (含耗材清单)
      </button>
    </div>
  );
}
```

---

### Task 10: Assemble HomePage

**Files:**
- Create: `E:\opt\pindou\src\app\page.tsx`

- [ ] **Step 1: Write the main page**

```tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ParameterPanel from '@/components/ParameterPanel';
import PixelPreview from '@/components/PixelPreview';
import ColorCodeView from '@/components/ColorCodeView';
import MaterialList from '@/components/MaterialList';
import DownloadBar from '@/components/DownloadBar';
import { palettes } from '@/lib/palettes';
import { generatePixelData } from '@/lib/quantize';
import { GenerateResult, OutputMode, Palette } from '@/types';

export default function HomePage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(palettes[0]);
  const [gridWidth, setGridWidth] = useState(45);
  const [gridHeight, setGridHeight] = useState(45);
  const [outputMode, setOutputMode] = useState<OutputMode>(OutputMode.All);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const codeRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img);
    setResult(null);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!image) return;
    setGenerating(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);

      const res = generatePixelData(imageData, {
        gridWidth,
        gridHeight,
        palette: selectedPalette,
        mode: outputMode,
      });

      setResult(res);
      setGenerating(false);
    }, 50);
  }, [image, gridWidth, gridHeight, selectedPalette, outputMode]);

  const showPreview = result && (outputMode === OutputMode.PixelOnly || outputMode === OutputMode.PixelAndCode || outputMode === OutputMode.All);
  const showCode = result && (outputMode === OutputMode.ColorCode || outputMode === OutputMode.PixelAndCode || outputMode === OutputMode.All);
  const showList = result && outputMode === OutputMode.All;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">拼豆工坊</h1>
        <p className="text-gray-500 mt-1 text-sm">
          上传图片 → 生成拼豆图案 · Perler · Hama · Artkal
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Upload */}
        <div className="lg:col-span-3 space-y-4">
          <ImageUploader onImageLoad={handleImageLoad} />

          {result && (
            <div className="space-y-4">
              {showPreview && (
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-2">像素预览图</h2>
                  <PixelPreview ref={previewRef} result={result} />
                </div>
              )}
              {showCode && (
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-2">颜色编号图</h2>
                  <ColorCodeView ref={codeRef} result={result} />
                </div>
              )}
              {showList && <MaterialList result={result} />}
              <DownloadBar result={result} brandLabel={selectedPalette.name} previewCanvasRef={previewRef} codeCanvasRef={codeRef} />
            </div>
          )}
        </div>

        {/* Right: Parameters */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <ParameterPanel
              palettes={palettes}
              selectedPalette={selectedPalette}
              onPaletteChange={setSelectedPalette}
              gridWidth={gridWidth}
              gridHeight={gridHeight}
              onGridChange={(w, h) => {
                setGridWidth(w);
                setGridHeight(h);
              }}
              outputMode={outputMode}
              onOutputModeChange={setOutputMode}
              maxColors={0}
              onMaxColorsChange={() => {}}
              onGenerate={handleGenerate}
              hasImage={!!image}
              generating={generating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 11: Build & Verify

- [ ] **Step 1: Build the project**

Run: `cd E:\opt\pindou && npx next build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Start dev server and verify manually**

Run: `cd E:\opt\pindou && npx next dev -p 3000`
Open http://localhost:3000
Expected: Page renders with upload area and parameter panel.

- [ ] **Step 3: Test upload workflow**
- Upload an image
- Change palette and grid size
- Click generate
- Verify pixel preview and color code view render
- Verify material list shows colors with counts
- Verify download buttons work (PNG + PDF)
