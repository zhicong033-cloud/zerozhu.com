# zerozhu.com 个人网站项目上下文交接

这份文档用于在新对话中快速恢复上下文。目标是继续建设并上线维护 `zerozhu.com` 个人网站。

## 1. 项目基本信息

- 网站域名：`zerozhu.com`
- 网站定位：ZeroZhu 的个人品牌主页
- 当前仓库：`https://github.com/zhicong033-cloud/zerozhu.com`
- 本地目录：`/Users/zhuzhicong/Documents/Codex/2026-05-12/new-chat`
- 部署平台：Cloudflare Pages
- Cloudflare Pages 项目名：`zerozhu`
- 当前线上地址：`https://zerozhu.com`
- 最近一次部署预览地址：`https://9d1b6e9f.zerozhu.pages.dev`
- 当前分支：`main`
- 最近关键提交：`5fe69c7 Align homepage with portfolio framework`

## 2. 用户已确认的公开信息

- 邮箱：`zhicong033@gmail.com`
- GitHub：`https://github.com/zhicong033-cloud`
- X / Twitter：无
- 微信公众号名称：`忙而不匆1802`
- 小红书账号：`朱智聪Zero`
- 抖音账号：`朱智聪Zero`
- 个人网站倾向：`zerozhu.com` 作为个人主页和长期内容沉淀入口

## 3. 网站内容方向

用户希望网站后续承载以下内容：

- 创意 ideas
- AI 应用和工具 demo
- 对 AI 技术的学习与思考
- 读书感悟
- 旅行体验和感悟
- 生活状态分享
- 照片和视频展示
- 留言 / 交流区
- 交流合作入口

核心气质：个人品牌名片 + AI 产品实践者 + 内容沉淀空间。整体应克制、清爽、专业，但不冷冰冰。

## 4. 当前导航结构

顶部导航已按用户最新方向调整为极简三栏目：

- 创作
- 项目
- 订阅

对应首页锚点：

- `#writing`：创作，承接创意、AI 笔记、读书、生活和旅行文字。
- `#projects`：项目，承接工具 demo 和产品实验。
- `#subscribe`：订阅，承接公众号、小红书、抖音、邮箱、GitHub 和留言入口。

原先的五个内容方向仍然保留，但被重新归类为更聚焦的个人品牌结构：创意 / 生活 / 旅行 / 阅读 / AI 思考归入「创作」，产品 / Demo / 工具实验归入「项目」，留言 / 合作 / 联系归入「订阅」。

## 5. 页面结构现状

当前项目是静态网站，无构建步骤，主要文件如下：

- `index.html`：首页
- `styles.css`：全站样式
- `products/teleprompter.html`：录屏提词器产品介绍页
- `ideas/ai-notes.html`：AI 学习和思考文章页
- `life/reading-note.html`：读书 / 生活文章页
- `travel/gallery.html`：旅行照片展示页
- `guestbook.html`：交流合作 / 留言页
- `assets/zerozhu-portrait.png`：头像图
- `assets/hero-background.png`：首页首屏抽象背景图
- `_headers`：Cloudflare Pages 安全头配置
- `sitemap.xml` / `robots.txt`：SEO 基础文件

当前仓库中 `styles.css` 有未提交改动。继续开发前请先查看并确认这些改动是否保留。

## 6. 设计参考与边界

当前主要参考方向改为借鉴 Dan Koe 个人品牌站的结构与表达方式：

- 参考网站：`https://thedankoe.com/`

用户明确选择：只借鉴结构，不全站改黑底，不照搬黑金视觉，不复制 Dan Koe 文案。当前应借鉴的是：

- 极简导航
- 首屏先放观点标语
- 小标签 + 大标题 + 短说明 + CTA 的节奏
- 内容优先的首页结构
- 创作 / 项目 / 订阅这类个人品牌入口
- 把个人作为品牌或产品持续构建的表达方式

此前参考过 `https://personalweb-gnurtbnc.manus.space/` 的 portfolio 框架，但当前优先级低于 Dan Koe 的结构参考。注意：不要复制任何参考网站的原始内容、口号、配色或商业化话术，文案和素材要保持 ZeroZhu 原创。

## 7. 当前首页首屏方向

首页已调整为个人品牌观点先行：

- 顶部品牌文字：`ZeroZhu`
- 首屏 label：`ZERO ZHU`
- 首屏主标题：`我们应该借助 AI 让工作和生活变得更加轻松愉快，而不是让 AI 取代我们。`
- 首屏副标题：记录 AI、产品、创作和生活实践；探索如何把 AI 变成助手，把想法变成作品，也把自己变成一个持续进化的品牌。
- 主按钮：`阅读我的创作`
- 次按钮：`查看我的项目`

首页内容结构调整为：

1. 创作 / Writing：AI 笔记、灵感、读书生活复盘、旅行笔记。
2. 项目 / Projects：录屏提词器和构建记录。
3. Brand System：解释 ZeroZhu 是持续迭代的个人品牌产品。
4. Subscribe：公众号、小红书、抖音、邮箱、GitHub、留言入口。

后续可以继续微调配色、字体和卡片，但核心方向是「把自己作为产品 / 品牌长期构建」。

## 8. 产品内容现状

当前已有一个产品 demo：

- 产品名称：录屏提词器
- 放置位置：产品栏目
- 页面：`products/teleprompter.html`
- 一句话介绍：一款为短视频录制和镜头表达设计的移动端提词工具，让文稿悬浮在录屏画面上，帮助创作者边看提示边自然表达。

后续用户可能会继续添加 AI 应用或工具 demo。

## 9. 留言 / 交流区现状

当前 `guestbook.html` 是简化版交流合作页面，主要通过：

- 邮箱
- GitHub Issues

来承接留言和交流。后续如果需要更像真实留言区，可以考虑：

- GitHub Issues 评论
- Giscus
- Cloudflare Workers + D1
- 第三方表单服务

当前阶段先保持简单，不要过度复杂化。

## 10. 部署方式

该项目是纯静态站点，可直接部署到 Cloudflare Pages。

常用部署命令：

```bash
npx wrangler pages deploy . --project-name=zerozhu --branch=main --commit-dirty=false
```

构建设置：

- Framework preset：`None`
- Build command：留空
- Build output directory：`/`

本地预览：

```bash
python3 -m http.server 8788
```

然后访问：

```text
http://localhost:8788
```

## 11. Cloudflare Pages 存储限制

Cloudflare Pages 更像部署资产限制，不是传统主机硬盘配额。

当前理解：

- 免费版 Pages：最多约 20,000 个文件
- 单个文件最大约 25 MiB
- 付费版文件数上限更高

当前网站实际很小：

- 项目总大小约 3.4 MB
- 非 `.git` 文件约 18 个
- 最大文件是头像图，约 1.3 MB
- 背景图约 192 KB

建议：

- 照片可以放 Pages，但应压缩后上传，单张尽量控制在 300 KB 到 1.5 MB
- 视频不要直接放 Pages，建议用 Cloudflare R2、YouTube、B站、腾讯云 COS 等外部存储，再在网站中嵌入或引用

## 12. 重要工作习惯

- 用户想先确定内容再实施时，要尊重阶段门，不要抢先建设。
- 用户说“继续开发 / 继续任务”时，可以主动推进实现、提交和部署。
- 不要虚构用户没有给出的经历、头衔、项目、社交平台或链接。
- 现有公共信息要保持准确：邮箱、GitHub、公众号、小红书、抖音、无 X/Twitter。
- 设计上要更接近用户给的参考站框架，而不是重新发明一套复杂产品站。
- 当前阶段用户偏向“先简单上线，后面再丰富内容”。

## 13. 建议的新对话起始提示

可以在新对话中这样开始：

```text
请根据这个上下文继续开发我的 zerozhu.com 个人网站。先检查当前项目状态，尤其是 styles.css 的未提交改动，然后继续按照 personalweb-gnurtbnc.manus.space 的框架完善首页、栏目页、文章页、照片展示和交流合作区。保持内容原创，不要复制参考网站文案。
```

