'use client';

import { useCallback, useRef, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ParameterPanel from '@/components/ParameterPanel';
import PixelPreview from '@/components/PixelPreview';
import ColorCodeView from '@/components/ColorCodeView';
import MaterialList from '@/components/MaterialList';
import DownloadBar from '@/components/DownloadBar';
import { palettes } from '@/lib/palettes';
import { generatePixelData } from '@/lib/quantize';
import { GenerateResult, OutputMode, Palette } from '@/types';

export default function HomePage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(palettes[0]);
  const [gridWidth, setGridWidth] = useState(58);
  const [gridHeight, setGridHeight] = useState(58);
  const [outputMode, setOutputMode] = useState<OutputMode>(OutputMode.All);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const codeRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img);
    setResult(null);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!image) return;
    setGenerating(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);

      const res = generatePixelData(imageData, {
        gridWidth,
        gridHeight,
        palette: selectedPalette,
        mode: outputMode,
      });

      setResult(res);
      setGenerating(false);
    }, 50);
  }, [image, gridWidth, gridHeight, selectedPalette, outputMode]);

  const showPreview = result && (outputMode === OutputMode.PixelOnly || outputMode === OutputMode.PixelAndCode || outputMode === OutputMode.All);
  const showCode = result && (outputMode === OutputMode.ColorCode || outputMode === OutputMode.PixelAndCode || outputMode === OutputMode.All);
  const showList = result && outputMode === OutputMode.All;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">拼豆工坊</h1>
        <p className="text-gray-500 mt-1 text-sm">
          上传图片 → 生成拼豆图案 · Perler · Hama · Artkal
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <ImageUploader onImageLoad={handleImageLoad} />

          {result && (
            <div className="space-y-4">
              {showPreview && (
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-2">像素预览图</h2>
                  <PixelPreview ref={previewRef} result={result} />
                </div>
              )}
              {showCode && (
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-2">颜色编号图</h2>
                  <ColorCodeView ref={codeRef} result={result} />
                </div>
              )}
              {showList && <MaterialList result={result} />}
              <DownloadBar result={result} brandLabel={selectedPalette.name} previewCanvasRef={previewRef} codeCanvasRef={codeRef} />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <ParameterPanel
              palettes={palettes}
              selectedPalette={selectedPalette}
              onPaletteChange={setSelectedPalette}
              gridWidth={gridWidth}
              gridHeight={gridHeight}
              onGridChange={(w, h) => {
                setGridWidth(w);
                setGridHeight(h);
              }}
              outputMode={outputMode}
              onOutputModeChange={setOutputMode}
              onGenerate={handleGenerate}
              hasImage={!!image}
              generating={generating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
