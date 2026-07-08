# 拼豆图片生成器 - 设计文档

## 概述

上传一张图片，自动生成拼豆 (Perler Beads / Hama Beads / Artkal) 图案。面向拼豆创作者/店铺，支持多品牌色板，输出像素预览图、颜色编号图和可打印 PDF。

## 技术方案

**方案 A：纯客户端 SPA（推荐）**

| 项目 | 选择 |
|------|------|
| 框架 | Next.js 15 App Router |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 图像处理 | Canvas API (浏览器端) |
| 颜色量化 | RGB 欧几里得最近色匹配 + 可选 Median Cut |
| PDF 生成 | jsPDF |
| 部署 | Vercel (静态站点) |

核心优势：图片不出浏览器（隐私安全）、零服务器成本、可离线。

## 用户流程

1. **上传图片** — 拖拽或点击上传 JPG/PNG/WebP，自动显示预览
2. **调整参数** — 拼豆板尺寸、品牌色板、输出模式、颜色数限制
3. **生成结果** — 点击生成，显示拼豆图、编号图、耗材清单
4. **下载输出** — 下载 PNG 或 PDF

## 页面布局

单页应用，布局结构：

```
┌─────────────────────────────────────────┐
│ Header: 拼豆工坊                          │
├──────────────────┬──────────────────────┤
│  左: 上传+预览    │  右: 参数控制          │
│  ┌────────────┐  │  · 拼豆板尺寸 (按钮组) │
│  │ Drag & Drop │  │  · 品牌色板 (按钮组)  │
│  │   区域       │  │  · 输出模式 (复选框)  │
│  └────────────┘  │  · 颜色数限制         │
│  [预览缩略图]     │  [生成按钮]           │
├──────────────────┴──────────────────────┤
│  结果区 (生成后显示)                      │
│  ┌──────────┐ ┌──────────┐              │
│  │ 像素预览图 │ │ 颜色编号图 │             │
│  └──────────┘ └──────────┘              │
│  耗材清单: [色号] [名称] [数量]            │
│  [下载 PNG] [下载 PDF]                   │
└─────────────────────────────────────────┘
```

## 组件树

```
<HomePage>
 ├── <Header />
 ├── <ImageUploader />          拖拽/点击上传
 ├── <ParameterPanel />         尺寸/色板/模式/颜色数
 ├── <button> 生成 </button>
 └── <ResultSection>            条件显示
      ├── <PixelPreview />      Canvas 绘制拼豆图
      ├── <ColorCodeView />     Canvas 编号图 + 色号文字
      ├── <MaterialList />      耗材表格
      └── <DownloadBar />       PNG / PDF 下载
```

## 核心算法

1. **预处理**：Canvas 加载图片 → 等比例缩放 → 居中裁剪到目标网格尺寸
2. **颜色量化**：对每个像素，在选定品牌色板中计算 RGB 欧几里得距离，找最近色
3. **结果生成**：
   - 像素图：逐像素绘制颜色方块
   - 编号图：方块上叠加品牌色号
   - 耗材清单：统计每种颜色出现次数
4. **PDF 导出**：jsPDF 生成 A4 页面，含编号图 + 耗材清单 + 色块图例

## 数据类型

```typescript
interface Palette {
  brand: 'Perler' | 'Hama' | 'Artkal';
  name: string;
  colors: PaletteColor[];
}

interface PaletteColor {
  name: string;
  code: string;       // 品牌色号
  hex: string;
  rgb: [number, number, number];
}

interface GenerateParams {
  gridWidth: number;
  gridHeight: number;
  palette: Palette;
  mode: OutputMode;
  maxColors?: number;
}

interface GenerateResult {
  pixelData: ImageData;
  colorMap: Map<string, number>;
  usedColors: PaletteColor[];
  gridWidth: number;
  gridHeight: number;
}

enum OutputMode {
  PixelOnly,
  ColorCode,
  PixelAndCode,
  All,
}
```

## 项目结构

```
pindou/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← 首页
│   │   ├── layout.tsx        ← 根布局
│   │   └── globals.css       ← 全局样式
│   ├── components/
│   │   ├── ImageUploader.tsx
│   │   ├── ParameterPanel.tsx
│   │   ├── PixelPreview.tsx
│   │   ├── ColorCodeView.tsx
│   │   ├── MaterialList.tsx
│   │   └── DownloadBar.tsx
│   ├── lib/
│   │   ├── palettes.ts       ← 色板数据
│   │   ├── quantize.ts       ← 颜色量化
│   │   ├── drawPixelArt.ts   ← Canvas 绘制
│   │   └── generatePdf.ts    ← PDF 生成
│   └── types/
│       └── index.ts
├── public/
│   └── palettes/             ← 色板 JSON
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

## 色板数据

内置三种品牌色板，以 JSON 格式存储：
- **Perler Beads**：约 80 色
- **Hama Beads**：约 70 色
- **Artkal**：约 200+ 色

每个颜色包含：名称、品牌色号、HEX、RGB。

## 部署

纯静态部署到 Vercel，无需额外配置。`vercel.json` 仅需声明 framework 为 nextjs。

## 未涉及范围（v1 不包含）

- 用户登录/保存历史
- 批量处理
- 自定义色板编辑
- 多语言
