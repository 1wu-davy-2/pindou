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
