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
        className="rounded-xl max-w-full mx-auto"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }
);

export default ColorCodeView;
