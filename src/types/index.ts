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
