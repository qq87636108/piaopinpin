# 票拼拼 piaopinpin

**电子发票拼版打印助手** — 发票拼一拼，A4 打印更省纸。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## 🎯 在线预览

**👉 [点击体验票拼拼](https://piaopinpin.daogong.cc)** — 无需安装，打开即用！

> 📱 支持手机和电脑浏览器 · 📄 文件全程本地处理，不上传服务器

### 📸 界面预览

![票拼拼界面预览](docs/images/piaopinpin-screenshot.png)

*上传发票 → 选择拼版 → 实时预览 → 一键打印*

## ✨ 功能特点

- **纯浏览器处理**：所有文件解析、裁切、拼版均在浏览器本地完成，发票文件不上传服务器
- **多格式支持**：PDF 发票、OFD 数电票、XML 数电票、图片格式（PNG/JPG）
- **智能裁边**：自动识别发票内容区域，裁掉多余白边
- **灵活拼版**：支持 1-4 张/页，可调页边距和卡片间距
- **实时预览**：A4 纸张实时预览，所见即所得
- **打印优化**：一键打印，支持剪切虚线辅助裁剪
- **免费开源**：完全免费使用，代码开源在 GitHub

## 🚀 快速开始

### 在线使用

直接访问 [票拼拼在线版](https://piaopinpin.daogong.cc)（如有部署）

### 本地运行

1. 克隆仓库：
   ```bash
   git clone https://github.com/your-username/piaopinpin.git
   cd piaopinpin
   ```

2. 启动本地服务器：
   ```bash
   # 使用 Node.js
   node site/dev-server.cjs
   
   # 或使用 Python
   cd site && python3 -m http.server 3090
   ```

3. 打开浏览器访问 `http://localhost:3090`

## 📁 项目结构

```
piaopinpin/
├── site/                      # 前端代码
│   ├── index.html             # 主页面
│   ├── privacy.html           # 隐私政策
│   ├── about.html             # 关于我们
│   ├── terms.html             # 使用条款
│   ├── contact.html           # 联系我们
│   ├── ads-config.js          # 广告配置（不入库）
│   ├── ads-config.example.js  # 广告配置示例
│   ├── dev-server.cjs         # 本地开发服务器
│   ├── ui/
│   │   └── app.js             # 主控制器
│   ├── core/
│   │   ├── state.js           # 全局状态管理
│   │   ├── layout.js          # 排版引擎
│   │   ├── preview.js         # 预览渲染
│   │   ├── crop.js            # 智能裁边
│   │   ├── print.css          # 打印样式
│   │   ├── ads.js             # 广告位
│   │   └── parsers/
│   │       ├── dispatch.js    # 文件类型嗅探
│   │       ├── pdf.js         # PDF 解析（pdf.js 4.x）
│   │       ├── ofd.js         # OFD 解析（ofdjs）
│   │       ├── xml.js         # XML 解析
│   │       └── image.js       # 图片解析
│   └── vendor/                # 第三方库
│       ├── pdfjs4/            # PDF.js 4.10.38
│       ├── ofdjs/             # OFD 解析库（已修补）
│       ├── jszip.min.js       # ZIP 解压
│       ├── Sortable.min.js    # 拖拽排序
│       ├── pdf-lib.min.js     # PDF 生成
│       └── tailwind.js        # Tailwind CSS
├── docs/                      # 内部文档（不公开）
├── 真票样本/                   # 测试用发票（不入库）
├── 交接档案.md                 # 项目交接文档
├── 发布前复盘报告.md           # 发布前审查报告
├── LICENSE                    # MIT 开源协议
└── README.md                  # 本文件
```

## 🛠️ 技术栈

- **前端框架**：原生 JavaScript（ES Modules）
- **样式**：Tailwind CSS（CDN）
- **PDF 解析**：PDF.js 4.10.38（Mozilla 开源）
- **OFD 解析**：ofdjs（@sharp9 开源，已修补）
- **拖拽排序**：Sortable.js
- **ZIP 解压**：JSZip
- **PDF 生成**：pdf-lib

## 📝 使用说明

1. **上传发票**：点击上传区域或拖拽文件到页面
2. **选择拼版**：点击左侧"每页发票拼版张数"按钮（1-4 张）
3. **调整设置**：拖动滑块调整页边距和卡片间距
4. **预览**：右侧实时预览 A4 纸张效果
5. **打印**：点击"立即打印 (A4)"按钮

## 🔧 配置广告（可选）

如果需要启用 Google AdSense 广告：

1. 复制 `site/ads-config.example.js` 为 `site/ads-config.js`
2. 填入你的 AdSense 配置：
   ```javascript
   const ADS_CONFIG = {
     enableAds: true,
     adClient: "ca-pub-XXXXXXXXXXXXXXXX",  // 你的 AdSense pub-id
     adSlot: "XXXXXXXXXX",                  // 你的广告单元 ID
     adFormat: "auto",
     debug: false
   };
   ```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 📄 License

本项目基于 [MIT License](LICENSE) 开源。

## 📚 技术文档

详细的技术实现文档请查看：[技术文档](docs/技术文档.md)

- 架构设计
- 核心功能实现（PDF/OFD 解析、智能裁边、排版引擎）
- 已知问题与解决方案
- 开发指南

## 🔗 相关链接

- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF 解析引擎
- [ofdjs](https://github.com/nicepkg/ofdjs) - OFD 解析库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 📧 联系方式

- 邮箱：admin@daogong.cc
- GitHub Issues：[提交 Issue](https://github.com/your-username/piaopinpin/issues)

---

**票拼拼** — 让发票打印更简单、更省纸。
