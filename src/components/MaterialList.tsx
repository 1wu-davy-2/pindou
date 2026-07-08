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
