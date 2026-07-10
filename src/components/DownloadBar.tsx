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
    <div className="soft-panel flex flex-wrap gap-2 rounded-lg p-4">
      <button
        onClick={() => downloadPNG(previewCanvasRef.current, 'preview')}
        className="rounded-2xl bg-[#ff6f9f] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5"
      >
        下载 PNG 像素图
      </button>
      <button
        onClick={() => downloadPNG(codeCanvasRef.current, 'code')}
        className="rounded-2xl bg-[#8a73d6] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
      >
        下载 PNG 编号图
      </button>
      <button
        onClick={() => downloadPdf(result, brandLabel)}
        className="rounded-2xl bg-[#4aa889] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5"
      >
        下载 PDF 清单
      </button>
    </div>
  );
}
