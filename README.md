# zerozhu.com

ZeroZhu 的个人品牌主页，一个可直接部署到 Cloudflare Pages 的静态网站。

当前内容包括：

- 个人定位：首页首屏和关于我
- 联系方式：邮箱、GitHub、微信公众号

## 本地预览

直接打开 `index.html`，或者在当前目录启动一个静态服务器：

```bash
python3 -m http.server 8788
```

然后访问：

```text
http://localhost:8788
```

## Cloudflare Pages 部署

### 方式一：连接 Git 仓库

1. 把当前目录提交到 GitHub 或 GitLab。
2. 打开 Cloudflare Dashboard。
3. 进入 `Workers & Pages` -> `Create application` -> `Pages`。
4. 选择仓库。
5. 构建设置：
   - Framework preset: `None`
   - Build command: 留空
   - Build output directory: `/`
6. 部署完成后，在 Pages 项目的 `Custom domains` 中添加 `zerozhu.com`。

### 方式二：直接上传

1. 打开 Cloudflare Dashboard。
2. 进入 `Workers & Pages` -> `Create application` -> `Pages`。
3. 选择 `Upload assets`。
4. 上传本目录中的文件。
5. 在 Pages 项目的 `Custom domains` 中添加 `zerozhu.com`。

## 后续可替换内容

- `index.html` 里的姓名、介绍、项目方向和邮箱。
- `styles.css` 里的颜色、排版和视觉标识。
- `favicon.svg` 里的站点图标。
- `assets/zerozhu-portrait.png` 里的个人头像。

## 上线前检查

确认以下内容是否需要替换：

- 邮箱：`zhicong033@gmail.com`
- GitHub：`https://github.com/zhicong033-cloud`
- 微信公众号：`忙而不匆1802`
- `sitemap.xml` 中的 `lastmod` 日期
