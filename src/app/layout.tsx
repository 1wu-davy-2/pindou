import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '拼豆工坊 - 图片转拼豆图案',
  description: '上传图片，生成拼豆（Perler Beads）图案，支持多品牌色板',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
