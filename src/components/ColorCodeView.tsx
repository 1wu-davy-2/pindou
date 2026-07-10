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
        className="mx-auto max-w-full rounded-lg border border-white/80 bg-white shadow-inner shadow-pink-100"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }
);

export default ColorCodeView;
