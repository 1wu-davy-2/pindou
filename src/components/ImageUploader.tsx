'use client';

import { useCallback, useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageLoad: (img: HTMLImageElement) => void;
}

export default function ImageUploader({ onImageLoad }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreview(url);
        const img = new Image();
        img.onload = () => onImageLoad(img);
        img.src = url;
      };
      reader.readAsDataURL(file);
    },
    [onImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div
      className={`soft-panel group relative cursor-pointer overflow-hidden rounded-lg p-5 text-center transition-all duration-300 ${
        dragging
          ? 'scale-[1.01] border-[#ff6f9f] bg-[#fff0f6]'
          : 'hover:-translate-y-0.5 hover:border-[#ff9abd]'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
          <div className="rounded-lg bg-white/70 p-3 shadow-inner shadow-pink-100">
            <img
              src={preview}
              alt="上传图片预览"
              className="mx-auto max-h-80 rounded-lg object-contain"
            />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b65f7c]">图片已就绪</p>
            <h2 className="mt-2 text-2xl font-black text-[#442b39]">可以生成拼豆图纸啦</h2>
            <p className="mt-2 text-sm leading-6 text-[#8d7482]">想换一张图，直接点击这里重新上传。</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-xl py-8">
          <div className="mx-auto mb-5 grid h-24 w-24 grid-cols-3 gap-2 rounded-[1.6rem] bg-white/80 p-3 shadow-inner shadow-pink-100">
            {['#ff8ab3', '#ffe89a', '#95e6c8', '#c9b7ff', '#ffffff', '#ffb783', '#8eddf2', '#ffcfdf', '#ffffff'].map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="rounded-full border border-white shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b65f7c]">上传照片</p>
          <h2 className="mt-2 text-2xl font-black text-[#442b39]">拖进来，做成拼豆小图纸</h2>
          <p className="mt-2 text-sm text-[#8d7482]">支持 JPG / PNG / WebP，图片只在浏览器里处理。</p>
          <div className="candy-shadow mt-5 inline-flex rounded-full bg-[#ff6f9f] px-5 py-2.5 text-sm font-bold text-white">
            选择图片
          </div>
        </div>
      )}
    </div>
  );
}
