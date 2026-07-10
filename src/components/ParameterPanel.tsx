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
  { label: '29 x 29', w: 29, h: 29 },
  { label: '45 x 45', w: 45, h: 45 },
  { label: '58 x 58', w: 58, h: 58 },
  { label: '72 x 72', w: 72, h: 72 },
];

const OUTPUT_OPTIONS = [
  { value: OutputMode.All, label: '全部', hint: '预览 + 编号 + 清单' },
  { value: OutputMode.PixelAndCode, label: '双图', hint: '像素图 + 编号图' },
  { value: OutputMode.PixelOnly, label: '像素图', hint: '只看成品效果' },
  { value: OutputMode.ColorCode, label: '编号图', hint: '只打印摆珠图' },
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
      <div>
        <label className="mb-3 block text-sm font-black text-[#513244]">
          拼豆板尺寸
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GRID_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onGridChange(preset.w, preset.h)}
              className={`rounded-2xl border px-3 py-2 text-sm font-bold transition-all ${
                gridWidth === preset.w && gridHeight === preset.h
                  ? 'border-[#ff6f9f] bg-[#ff6f9f] text-white shadow-lg shadow-pink-200'
                  : 'border-white/80 bg-white/70 text-[#7c6371] hover:border-[#ffacc7] hover:bg-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <input
            type="number"
            min={4}
            max={200}
            value={gridWidth}
            onChange={(e) => onGridChange(Number(e.target.value), gridHeight)}
            className="min-w-0 rounded-2xl border border-white/90 bg-white/75 px-3 py-2 text-center text-sm font-bold text-[#513244] outline-none transition focus:border-[#ff6f9f] focus:ring-4 focus:ring-pink-100"
            placeholder="宽"
          />
          <span className="text-[#c58da5]">x</span>
          <input
            type="number"
            min={4}
            max={200}
            value={gridHeight}
            onChange={(e) => onGridChange(gridWidth, Number(e.target.value))}
            className="min-w-0 rounded-2xl border border-white/90 bg-white/75 px-3 py-2 text-center text-sm font-bold text-[#513244] outline-none transition focus:border-[#ff6f9f] focus:ring-4 focus:ring-pink-100"
            placeholder="高"
          />
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-black text-[#513244]">
          品牌色板
        </label>
        <div className="space-y-2">
          {palettes.map((p) => (
            <button
              key={p.brand}
              onClick={() => onPaletteChange(p)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                selectedPalette.brand === p.brand
                  ? 'border-[#ff6f9f] bg-white text-[#513244] shadow-lg shadow-pink-100'
                  : 'border-white/80 bg-white/60 text-[#7c6371] hover:border-[#ffacc7] hover:bg-white'
              }`}
            >
              <span className="flex -space-x-1">
                {p.colors.slice(0, 4).map((color) => (
                  <span
                    key={`${p.brand}-${color.code}`}
                    className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-black">{p.name}</span>
                <span className="text-xs opacity-70">{p.colors.length} 个颜色</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-black text-[#513244]">
          输出模式
        </label>
        <div className="grid grid-cols-2 gap-2">
          {OUTPUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={outputMode === opt.value}
              onClick={() => onOutputModeChange(opt.value)}
              className={`rounded-2xl border p-3 text-left transition-all ${
                outputMode === opt.value
                  ? 'border-[#95e6c8] bg-[#edfff8] text-[#285f50] shadow-lg shadow-emerald-100'
                  : 'border-white/80 bg-white/60 text-[#7c6371] hover:border-[#b6efd9] hover:bg-white'
              }`}
            >
              <span className="block text-sm font-black">{opt.label}</span>
              <span className="mt-0.5 block text-[11px] leading-4 opacity-70">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!hasImage || generating}
        className={`w-full rounded-[1.3rem] px-5 py-3.5 text-sm font-black transition-all ${
          hasImage && !generating
            ? 'candy-shadow bg-gradient-to-r from-[#ff6f9f] via-[#ff8fb6] to-[#ffb783] text-white hover:-translate-y-0.5'
            : 'cursor-not-allowed bg-white/60 text-[#c7aebb]'
        }`}
      >
        {generating ? '正在生成...' : '生成拼豆图纸'}
      </button>
    </div>
  );
}
