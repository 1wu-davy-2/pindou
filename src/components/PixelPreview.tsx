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
        <div className="flex aspect-square items-center justify-center rounded-lg bg-white/60 text-sm text-[#a98a99]">
          上传图片后生成预览
        </div>
      );
    }

    return (
      <canvas
        ref={canvasRef}
        className="mx-auto max-w-full rounded-lg border border-white/80 bg-white shadow-inner shadow-pink-100"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }
);

export default PixelPreview;
