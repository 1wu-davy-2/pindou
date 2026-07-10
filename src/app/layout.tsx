import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '拼豆工坊 - 图片转拼豆图纸',
  description: '上传图片，生成拼豆图纸，支持 Perler、Hama、Artkal 多品牌色板。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
