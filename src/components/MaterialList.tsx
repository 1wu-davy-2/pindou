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
    <div className="soft-panel overflow-hidden rounded-lg">
      <div className="border-b border-[#ffe1ec] px-5 py-4">
        <h3 className="text-base font-black text-[#503040]">物料清单</h3>
        <p className="mt-0.5 text-xs text-[#9b7b8a]">
          共 {sorted.length} 种颜色，约 {result.gridWidth * result.gridHeight} 颗拼豆
        </p>
      </div>
      <div className="hide-scrollbar max-h-72 divide-y divide-[#fff0f5] overflow-y-auto">
        {sorted.map((color) => {
          const count = result.colorMap.get(color.code) || 0;
          const bgColor = `rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})`;
          const brightness = 0.299 * color.rgb[0] + 0.587 * color.rgb[1] + 0.114 * color.rgb[2];
          const textColor = brightness > 128 ? '#000' : '#fff';

          return (
            <div key={color.code} className="flex items-center gap-3 px-5 py-3 text-sm">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[9px] font-black shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {color.code}
              </div>
              <span className="flex-1 font-semibold text-[#6f5261]">{color.name}</span>
              <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-[#a17386]">{color.code}</span>
              <span className="min-w-12 text-right font-mono font-black text-[#503040]">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
