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
