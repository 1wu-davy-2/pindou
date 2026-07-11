# 🎨 拼豆工坊 · Pindou Studio

> **上传一张照片，生成可打印的拼豆图案。**  
> 支持 Perler Beads · Hama Beads · Artkal Beads 三大品牌色板，所有处理在浏览器本地完成，无需上传服务器。


<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT" />
</p>


---

## ✨ 功能特性

| 特性 | 说明 |
|------|------|
| 📷 **一键上传** | 拖拽或点击上传，支持 JPG / PNG / WebP |
| 🎨 **多品牌色板** | Perler Beads（75 色）、Hama Beads（66 色）、Artkal Beads（79 色） |
| 🔢 **颜色编号图** | 每个拼豆格子上叠加品牌色号，方便对照取豆 |
| 📊 **耗材清单** | 自动统计每种颜色需要多少颗，按用量排序 |
| 📄 **PDF 导出** | 生成含耗材清单的 A4 PDF，可直接打印 |
| 🖼️ **PNG 导出** | 像素预览图和编号图均可下载为 PNG |
| 📐 **灵活尺寸** | 支持 29×29 到 72×72 预设，也支持任意自定义尺寸 |
| 🔒 **本地处理** | 所有图像计算在浏览器内完成，照片不上传任何服务器 |
| ⚡ **零部署成本** | 纯静态 SPA，可免费部署在 Vercel |

---

## 🖥️ 在线体验

项目已部署在 Vercel，直接访问：

**[https://pindou-studio.vercel.app](https://pindou-studio.vercel.app)**（替换为你自己的部署地址）

或者本地运行：


```bash
git clone https://github.com/1wu-davy-2/pindou.git
cd pindou
npm install
npm run dev
```

打开 `http://localhost:3000` 即可体验。

---

## 🔬 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                      │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌─────────────────────┐  │
│  │  Upload   │ → │  Canvas  │ → │  Color Quantization │  │
│  │  Image    │   │  Resize  │   │  + Dithering        │  │
│  └──────────┘   └──────────┘   └──────────┬──────────┘  │
│                                           ↓              │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Output Generation                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │   │
│  │  │  Pixel   │  │  Color   │  │   Material    │  │   │
│  │  │ Preview  │  │ Code View│  │    List       │  │   │
│  │  └──────────┘  └──────────┘  └───────────────┘  │   │
│  │  ┌──────────┐  ┌──────────┐                      │   │
│  │  │  PNG DL  │  │  PDF DL  │                      │   │
│  │  └──────────┘  └──────────┘                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↑ 全部在浏览器内完成，无服务器端处理 ↓
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Static Hosting)                │
│              CDN · SSL · Automatic Deploys               │
└─────────────────────────────────────────────────────────┘
```

### 核心算法

**1. Canvas 硬件缩放**  
利用 Canvas 的 `imageSmoothingEnabled = true` + `drawImage` 进行硬件加速的双线性插值下采样，相比逐像素手动采样，保留更多图像细节。

**2. 加权 RGB 颜色距离**  
```ts
distance = 2·ΔR² + 4·ΔG² + 3·ΔB²
```
绿通道权重最高（人眼对绿色最敏感），红蓝次之，更贴合人类色彩感知。

**3. Floyd-Steinberg 误差扩散抖动**  
将每个格子的量化颜色误差按比例扩散到相邻格子：

```
    当前像素 → 右: 7/16
    左下: 3/16  ↓下: 5/16  右下: 1/16
```

通过抖动在人眼视觉上「混合」出更多中间色，极大提升照片还原度。

---

## 📁 项目结构

```
pindou/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局 & SEO
│   │   ├── page.tsx             # 主页（状态管理 + 布局编排）
│   │   └── globals.css          # Tailwind CSS 入口
│   ├── components/
│   │   ├── ImageUploader.tsx     # 拖拽/点击上传
│   │   ├── ParameterPanel.tsx    # 参数控制（尺寸、色板、模式）
│   │   ├── PixelPreview.tsx      # 拼豆像素预览（forwardRef）
│   │   ├── ColorCodeView.tsx     # 颜色编号图（forwardRef）
│   │   ├── MaterialList.tsx     # 耗材清单
│   │   └── DownloadBar.tsx      # PNG / PDF 下载
│   ├── lib/
│   │   ├── palettes.ts          # 三大品牌色板数据
│   │   ├── quantize.ts          # 颜色量化核心算法
│   │   ├── drawPixelArt.ts      # Canvas 绘制函数
│   │   └── generatePdf.ts       # jsPDF 导出
│   └── types/
│       └── index.ts             # TypeScript 类型定义
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🚀 部署到 Vercel

本项目为纯静态 SPA，可一键部署到 Vercel：

1. 将代码推送到 GitHub：
   ```bash
   git push origin master
   ```

2. 打开 [vercel.com/new](https://vercel.com/new)，导入该仓库

3. Framework Preset 自动识别为 **Next.js**，无需任何配置

4. 点击 **Deploy**，等待完成即可

> **为什么不需要服务器？**  
> 所有图像处理（缩放、颜色匹配、抖动计算、PDF 生成）均在浏览器中通过 Canvas API 和 JavaScript 完成，Vercel 只需托管静态 HTML/JS/CSS 文件。

---

## 🧪 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

开发服务器默认运行在 `http://localhost:3000`。

---

## 📦 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js 15](https://nextjs.org/) | React 应用框架，App Router |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Tailwind CSS 4](https://tailwindcss.com/) | 样式方案 |
| [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) | 图像处理（缩放、绘制、导出） |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF 文档生成 |
| [Vercel](https://vercel.com/) | 部署平台 |

---

## 📄 开源协议

[MIT](LICENSE)

---

<p align="center">
  Made with ❤️ for the 拼豆 community
</p>
