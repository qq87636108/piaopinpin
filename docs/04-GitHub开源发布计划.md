# 票拼拼 · GitHub 开源发布计划（v1.0 · 2026-09-27，C12 拍板）

## 一、目的（用户原话收录）
1. 为开源做点贡献。
2. 在 GitHub 发一个带预览网站内容的项目，把网址放上去，增加外链。

## 二、时机
项目**完成后**才发布（用户拍板"做完以后"）。开发期只在本机+Gitea 私有库+测试机流转，不建公开仓库、不 push GitHub。

## 三、价值校准（先说实话，避免预期偏差）
- GitHub README 里的外链是 **rel="nofollow"/ugc**，Google 不直接传递权重 → "赚外链 SEO 分"这个预期要打折。
- 真实收益在别处且更值钱：①**品牌搜索路径**（搜"票拼拼 GitHub"→README→官网，高质量回访与直接流量）；②**导航站/工具站收录背书**（"开源+GitHub 仓库"是被各类 awesome/工具目录收录的硬门槛，这些目录的链接才是真外链）；③**AdSense 审核信任信号**（审核员可查"运营方有真实开源项目"）；④开源贡献本身 + 未来潜在社区反馈改进产品。

## 四、发布物形态
```
github: piaopinpin/  （repo 名待定 Q3）
├── README.md            # 中英双语；预览网址放首屏徽章区；截图；隐私声明(文件不出浏览器)；自托管指南
├── LICENSE              # Q2 待拍板，默认推荐 MIT（与发票酱一致、社区摩擦最小）
├── .github/workflows/pages.yml   # 可选：GitHub Pages 在线演示（enableAds=false 分支）
├── index.html / m/ / core/ / ui/ / vendor/ / tests/fixtures/
└── ads-config.example.js  # ★模板（占位 pub-id）；真实 ads-config.js 永不进仓库，只存生产服务器
```

## 五、发布前脱敏硬检清单（一道不过就不发）
1. **真实发票样本绝不进公开仓库**——用户提供的真票含企业名/税号/票号，属敏感数据。fixtures 只放：①自造假票（模拟版式，如原型的 demo SVG）②公开渠道可查的样例票（核对无真实主体后）。
2. 全仓 grep 脱敏扫描：`ca-pub-`、slot ID、密码、token、IP（64.188.24.185 / 192.168.31.*）、邮箱、daogong 内部路径 → 全部替换占位符。生产 ads-config.js 用 `.gitignore` 排除。
3. README/注释/commit 历史三层都要扫（git 历史若脏，用全新 orphan 仓库首发，不做本地 git 直推）。
4. 第三方库 LICENSE 合规：vendor/ 内 pdf.js(Apache/MIT)、JSZip(MIT)、Sortable(MIT)、pdf-lib(MIT)、OFD 库(Apache-2.0) → LICENSE 附带 NOTICE 列出依赖协议（Apache-2.0 要求声明）。
5. 隐私政策/关于页链接在项目内自洽（README 指向线上站）。

## 六、README 预览站内容设计（对应目的 2）
- 首屏：项目名 + Slogan + **[在线使用 →]** 大按钮徽章（指向线上域名）+ Live Demo 截图 GIF（30 秒上传→打印操作演示）。
- 段落序：这是什么 → 30 秒上手 → 隐私承诺 → 支持格式表 → 自建部署（三步） → 反馈/贡献 → License。
- GitHub Pages 演示（若开 Q4=做）：与线上版同码不同配置（enableAds=false），README 双链："官方在线版"（主网址）+"演示镜像"（pages.dev 域）。

## 七、待拍板
| Q | 问题 | 默认建议 |
|---|---|---|
| Q2 | 开源协议 | **MIT**（发票酱同款，社区摩擦最小）；Apache-2.0 带专利条款次选 |
| Q3 | 仓库名 | `piaopinpin` 还是 `invoice-tile-print`（英文名更国际化检索，中文名"票拼拼"进 README 标题）→ 默认建议英文 repo 名 |
| Q4 | 要不要 GitHub Pages 在线演示 | 建议做（零成本，README 徽章可点，海外可达） |
| Q5 | GitHub 账号用哪个、署名身份 | 待用户提供账号；提交署名与线上站归属一致 |
| Q6 | 发布时点 | 默认=WP6 验收通过+生产上线后；期间测试机/Gitea 正常闭环不受影响 |

## 八、与既有铁律的兼容
- 三端同步铁律不变（Gitea 私库=开发主仓，GitHub=发布镜像，方向单向：Gitea→脱敏→GitHub，**严禁反向**，防开源净化前的历史回流）。
- 生产上线仍走人工闸门；开源发布本身也是对外动作，首发须用户说"发"。
