<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Handbook web rules

仓库根目录 `AGENTS.md` 的规则继续生效。修改 Next.js 行为前，先阅读本目录 `node_modules/next/dist/docs/` 中当前版本对应的文档。

- 公开文章、学习路线、模块目录、搜索、题目与讲解不得被登录页或鉴权重定向阻挡。用户身份只控制进度同步、作答历史、留言和管理功能。
- `notes/` 是文章与 SVG 的唯一事实来源；题目正文也应保存在 Git。D1 只保存用户产生的状态，不复制出版内容。
- 文章运行时身份使用相对模块路径与文件名组成的 `article_key`，不使用六位目录编号。
- Next.js 继续静态导出，Markdown、目录和 Shiki 只在构建期运行；Cloudflare 使用 Static Assets 分发 `out/`，轻量 Worker 只处理 `/api/*`，不部署 Next.js 运行时。
- 用户进度、作答与留言通过独立的 `/api/*` Worker 边界叠加，不能迫使静态正文按请求重新渲染，也不能把出版内容复制进 D1。
- UI 以 `docs/ui-design.md` 为准，并继承 Arctic Aria 的共享组件体系。`../arctic-aria` 是只读设计来源，不得在 handbook 工作中修改。
- 新的重复交互先进入共享组件，不在页面中创建局部按钮、面板、列表、表单、弹窗、通知或颜色系统。
- Markdown 渲染必须继续支持 GFM、LaTeX、代码块、相对文章链接和 `notes/assets/` 中的 SVG，并保留内容修订与段落定位元数据。
- 用户评论允许 GFM 与 LaTeX，但必须忽略原始 HTML，并在输出前完成危险链接与身份信息隔离；不能把未受信任字符串直接传给 `dangerouslySetInnerHTML`。
- `scripts/build-content.mjs` 是内容编译边界：它读取 `notes/` 并生成 ignored 的 `.content-cache/` 与公开搜索索引。页面代码只能读取预编译结果，不得重新引入 Markdown 或 Shiki 运行时渲染。
