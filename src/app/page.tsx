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
  const totalBeads = result ? result.gridWidth * result.gridHeight : gridWidth * gridHeight;
  const sampleBeads = [
    '#ff8ab3', '#ffd166', '#95e6c8', '#c9b7ff', '#ffb783', '#ffffff',
    '#ffffff', '#ff6f9f', '#fff0a8', '#8eddf2', '#ffffff', '#b6f2d9',
    '#c9b7ff', '#ffffff', '#ff8ab3', '#ffcfdf', '#ffe89a', '#ffffff',
    '#8eddf2', '#ffd166', '#ffffff', '#95e6c8', '#ffb783', '#ff8ab3',
  ];

  return (
    <main className="bead-surface relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-[-7rem] top-16 h-64 w-64 rounded-full bg-[#ff8ab3]/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-44 h-72 w-72 rounded-full bg-[#95e6c8]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-[#c9b7ff]/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-8 grid min-w-0 items-end gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-semibold text-[#9b4e6b] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#ff6f9f]" />
              软萌手作图纸生成器
            </div>
            <h1 className="max-w-3xl break-all text-[2.05rem] font-black leading-tight text-[#3f2b3a] sm:text-5xl lg:text-6xl">
              <span className="sm:block">把喜欢的照片变成</span>
              <span className="sm:block">可爱的拼豆小作品</span>
            </h1>
            <p className="mt-4 max-w-2xl break-words text-base leading-7 text-[#7c6371] sm:text-lg">
              上传头像、宠物、偶像或礼物照片，选择拼豆板尺寸和品牌色板，一键生成像素预览、编号图和物料清单。
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#7b5669]">
              <span className="rounded-full bg-white/75 px-3 py-1.5 shadow-sm">甜感配色</span>
              <span className="rounded-full bg-white/75 px-3 py-1.5 shadow-sm">清晰编号</span>
              <span className="rounded-full bg-white/75 px-3 py-1.5 shadow-sm">可打印 PDF</span>
            </div>
          </div>

          <div className="hidden rounded-[2rem] border border-white/80 bg-white/55 p-5 shadow-xl shadow-pink-200/30 backdrop-blur md:block">
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-[#7d4f63]">
              <span>今日灵感板</span>
              <span>{gridWidth} x {gridHeight}</span>
            </div>
            <div className="grid grid-cols-6 gap-2 rounded-[1.5rem] bg-[#fff8fb] p-4">
              {sampleBeads.map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  className="aspect-square rounded-full border border-white shadow-inner shadow-white/80 ring-1 ring-black/5"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </header>

        <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0 space-y-5">
            <ImageUploader onImageLoad={handleImageLoad} />

            {result && (
              <div className="space-y-5">
                {showPreview && (
                  <div className="soft-panel rounded-lg p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-black text-[#503040]">像素预览图</h2>
                        <p className="text-xs text-[#9b7b8a]">先看整体效果，再决定是否调整尺寸。</p>
                      </div>
                      <span className="rounded-full bg-[#ffe8f0] px-3 py-1 text-xs font-bold text-[#b14a71]">
                        {result.usedColors.length} 色
                      </span>
                    </div>
                    <PixelPreview ref={previewRef} result={result} />
                  </div>
                )}

                {showCode && (
                  <div className="soft-panel rounded-lg p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-black text-[#503040]">颜色编号图</h2>
                        <p className="text-xs text-[#9b7b8a]">按格子编号摆珠，适合打印后照着拼。</p>
                      </div>
                      <span className="rounded-full bg-[#e6fbf4] px-3 py-1 text-xs font-bold text-[#2f8a6d]">
                        编号版
                      </span>
                    </div>
                    <ColorCodeView ref={codeRef} result={result} />
                  </div>
                )}

                {showList && <MaterialList result={result} />}
                <DownloadBar result={result} brandLabel={selectedPalette.name} previewCanvasRef={previewRef} codeCanvasRef={codeRef} />
              </div>
            )}
          </div>

          <aside className="min-w-0">
            <div className="soft-panel sticky top-5 rounded-lg p-5">
              <div className="mb-5 rounded-lg bg-gradient-to-br from-[#fff0f6] via-white to-[#effff9] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b65f7c]">创作设置</p>
                <h2 className="mt-1 text-2xl font-black text-[#442b39]">调一调甜度</h2>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-white/80 p-2">
                    <p className="text-lg font-black text-[#ff6f9f]">{gridWidth}</p>
                    <p className="text-[11px] text-[#9b7b8a]">宽度</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-2">
                    <p className="text-lg font-black text-[#4aa889]">{gridHeight}</p>
                    <p className="text-[11px] text-[#9b7b8a]">高度</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-2">
                    <p className="text-lg font-black text-[#8a73d6]">{totalBeads}</p>
                    <p className="text-[11px] text-[#9b7b8a]">颗数</p>
                  </div>
                </div>
              </div>

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
          </aside>
        </section>
      </div>
    </main>
  );
}
