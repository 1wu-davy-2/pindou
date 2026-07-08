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
