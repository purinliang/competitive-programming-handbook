# 正文数据与页面外壳分离

> 研究日期：2026-08-23

本文研究如何让正文不再静态嵌入每篇文章的 HTML 和 Next.js 导航载荷。它记录
目标架构、原型测量和迁移边界；迁移完成以前，当前公网版本仍使用原有静态导出，
不能把本文当作已经生效的部署说明。

## 结论

正文是出版数据，不是页面代码。Git 中的 Markdown 继续作为唯一创作源；发布时把
Markdown 编译成独立、版本化的正文对象，浏览器在共享页面外壳中按文章身份读取。
页面外壳、正文、导航和用户数据分别发布：

```text
Git Markdown ──编译──> 版本化正文对象 ──读取──> 共享阅读页面
                              │
学习路线与模块目录 ──编译──> 导航清单

用户、评论与答题记录 ─────────────────────> D1
```

推荐使用 R2 保存编译后的正文、题目、搜索索引和导航清单，但浏览器只依赖普通 HTTP
接口，不依赖 R2 专有协议。R2 是对象存储，不是文档数据库；这里使用它，是因为
系统总是根据稳定键读取一整篇文档，不需要查询正文内部字段。

初始 HTML 只包含应用外壳、加载占位和 JavaScript 入口，不包含任何文章正文。
浏览器从当前 URL 得到导航模式与 `article_key`，再读取相应正文对象。

## 当前问题

当前 `next.config.ts` 使用 `output: "export"`。学习路线和模块目录分别调用
`generateStaticParams()`，为每篇公开正文生成一条静态路由。构建时，Next.js 把
正文写入初始 HTML，又把相同内容写入客户端导航所需的 RSC 载荷。

同一篇正文还会在 `.content-cache/articles/catalog/` 和
`.content-cache/articles/learning-path/` 各保存一次。只有学习正文确实不同于模块
正文时才需要两个版本；当前多数文件只是逐字复制。

以“后缀数组”为例：

| 形态 | 大小 |
| --- | ---: |
| 原始 Markdown | 15,009 B |
| 单份预编译正文对象 | 114,971 B |
| 学习路线静态路由 | 约 1.04 MB |
| 模块目录静态路由 | 约 0.80 MB |

一条静态路由除了 `index.html`，还包含完整载荷、页面载荷和路由树等文件。这个重复
不是 Markdown 自身造成的，而是页面生成边界造成的。

2026-08-23 的全站测量如下：

| 项目 | 文件数 | 未压缩大小 |
| --- | ---: | ---: |
| 原始 Markdown | 399 | 3,382,233 B |
| 当前内容缓存 | 1,160 | 66,952,029 B |
| 当前静态站点 | 3,944 | 632,513,196 B |
| 运行时正文原型 | 784 | 38,000,981 B |

原型中的 786 个导航版本只对应 410 份不同正文对象；另外保存 367 份小测对象、搜索
索引、学习进度定义、导航清单和一个 470 B 的固定 HTML 壳。全部原型文件分别 gzip
后合计约 5.85 MB。原型还没有加入正式 React、CSS 和图像资产；当前共享的 Next.js
资源与内容图片合计约 2.7 MB，因此即使沿用相近的前端规模，目标产物仍比当前整站
小一个数量级。

## 发布对象

### 正文对象

正文对象只保存渲染正文和正文自身的元数据，不携带学习路线、模块目录、上一篇或
下一篇：

```json
{
  "html": "<h1>后缀数组</h1>...",
  "contentRevision": "7f31a2...",
  "documentEpoch": 1,
  "sections": [],
  "tableOfContents": []
}
```

内容对象使用完整内容的哈希作为路径：

```text
objects/<sha256>.json
```

相同的模块正文和学习正文自然指向同一个对象。真正不同的两个出版版本仍共享同一个
`article_key`，但在发布清单中分别指向各自对象。对象一旦发布便不覆盖，可以使用
长期不可变缓存，也可以随时把清单回退到旧版本。

编译后的 HTML 是可信出版数据。浏览器不运行 Markdown、Shiki 或 LaTeX 编译器，
避免扩大客户端包、产生不同渲染结果或把原始 HTML 安全边界移到浏览器。

### 文章清单

文章清单负责把稳定身份和导航模式映射到正文对象：

```json
{
  "articles": {
    "strings/suffix-array": {
      "catalog": {
        "objectPath": "objects/<hash>.json",
        "route": "/catalog/strings/suffix-array/",
        "title": "后缀数组"
      },
      "learningPath": {
        "objectPath": "objects/<hash>.json",
        "route": "/learning-path/strings/suffix-array/",
        "title": "后缀数组"
      }
    }
  }
}
```

第一版可以一次缓存完整清单。后续若首屏测量证明清单过大，再按学习阶段和模块拆分；
不能在没有数据以前提前制造复杂的多层查询协议。

### 导航、搜索和小测

- 学习路线与模块目录分别生成导航清单，只保存文章身份、入口身份和顺序；
- 小测独立成内容寻址对象，只在学习正文需要时读取；
- 搜索索引只在搜索页首次使用时读取；
- SVG 和其他图片继续作为独立对象，不嵌进正文 JSON；
- Worker 校验评论、分节身份和答题版本时读取按文章拆分的交互定义，不再把整本书的
  `interaction-manifest.json` 编译进 Worker。

## 页面请求

直接打开文章时：

1. 静态资源服务为任意文章 URL 返回同一个 `index.html`；
2. 客户端路由从 URL 解析导航模式和 `article_key`；
3. 页面显示固定高度的正文骨架，同时读取文章清单和对应导航；
4. 根据清单读取版本化正文对象；
5. 正文到达后一次性替换骨架，再加载小测、用户进度和评论。

站内切换文章时保留旧正文，等新正文准备完成再切换，并使用现有顶部加载条表达等待；
不能先清空页面再等待网络，重新制造已经解决过的闪动问题。

### 导航入口不进入 URL

`entry` 表示读者这一次从哪个单元或专题入口进入正文。它影响左侧目录、上一篇、
下一篇和返回目录的位置，却不属于文章身份，也不应该成为可复制链接的一部分。目标
路由不再生成 `?entry=...`：

- 目录链接通过浏览器 `history.state` 携带 `entryKey`；
- 前进、后退和刷新继续使用当前历史记录中的入口；
- `sessionStorage` 只作为当前标签页内的刷新后备，不同步到其他设备；
- 外部链接、新标签页或没有导航状态的直接访问使用正文声明的默认入口；
- 上一篇和下一篇在跳转时继续传递各自的入口状态；
- 返回学习路线或模块目录时，用同一状态展开并定位对应入口；
- 旧 `?entry=` 链接在迁移期读取一次，把值写入历史状态，再用
  `history.replaceState()` 删除查询参数，不能产生一次额外跳转。

同一篇正文可能拥有多个入口，这个事实仍然保留在导航清单中。这里只是把临时导航
上下文从公开 URL 移到浏览器会话状态，不是重新把文章身份和入口身份混为一谈。

内容哈希对象使用长期不可变缓存。文章清单使用短缓存和重新验证；发布顺序必须先
上传新对象，再更新清单，因此读者不会得到指向尚不存在对象的入口。旧对象至少保留
一个回滚周期，清理工作独立进行。

## 平台选择

### 推荐：React SPA、Static Assets 与 R2

严格要求“正文不进入初始 HTML”时，React SPA 与这个模型最一致：构建只产生一个
HTML 外壳和共享 JavaScript/CSS。Cloudflare Workers Static Assets 支持把未命中
静态文件的浏览器导航统一回落到 `/index.html`，同时继续让 `/api/*` 进入现有 Hono
Worker：

- [Cloudflare SPA 路由](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)

当前 UI 组件可以继续使用 React。仓库中直接依赖 `next/link`、`next/navigation` 或
Next 页面约定的文件数量很少，主要集中在路由和上下文恢复边界；迁移不等于重写视觉
组件。Vite 只负责产生共享 SPA 资源，内容协议与具体前端构建工具无关。

R2 对象读写具有全局强一致性，适合发布版本化文档对象：

- [R2 一致性模型](https://developers.cloudflare.com/r2/reference/consistency/)
- [通过 Worker 读取 R2](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)

生产环境优先由同源 Worker 的 `/content/*` 读取 R2，并对内容哈希 URL 设置不可变
缓存。这样不需要公开整个存储桶，也不引入跨域配置。

### 不推荐的替代方案

- **继续为全部文章静态导出小页面壳**：虽然正文可以移出 HTML，公共 UI 或路由协议
  变化仍会重新生成数百条路由，没有消除错误边界；
- **把正文放进 D1**：正文以整篇读取，不需要关系查询；这会把出版数据、用户数据和
  数据库迁移绑在一起；
- **把正文放进 KV**：KV 适合高读取、低写入数据，但它是最终一致的，其他地区可能
  在一分钟或更久以后才看见更新，不利于作者发布后立即验收；
- **仅把前端迁到 Vercel**：如果仍使用全量静态导出，文件重复不会消失；若 D1 与
  GitHub 登录继续留在 Cloudflare，还会增加跨站 Cookie、代理和部署协调；
- **立即改用 OpenNext SSR**：Cloudflare 当前支持 Next.js SSR 和 ISR，但服务器渲染
  会重新把正文写进每次返回的 HTML。它可以作为将来的搜索引擎渲染层，却不是本次
  “正文与 HTML 分离”的直接答案。

KV 的一致性限制和 OpenNext 当前能力分别见：

- [Workers KV 工作方式](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Cloudflare 上的 Next.js](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

## 取舍

正文改为客户端读取以后，首屏需要额外的内容请求。应通过骨架、并行读取、浏览器
缓存、边缘缓存和站内预取解决，不能用重新嵌入全部正文来掩盖。内部导航完成第一次
清单请求后，只需再读取目标正文对象。

初始 HTML 不含正文，会削弱不执行 JavaScript 的搜索引擎和链接预览。现阶段网站是
学习应用，稳定阅读、发布速度和用户状态优先；同时保留站点地图、正确 URL 和加载后
的 `document.title`。如果以后搜索流量成为实际需求，可以在不改变正文对象协议的
前提下增加只负责元数据或搜索引擎快照的渲染层。不能为了尚未测量的 SEO 需求恢复
全量路由复制。

## 迁移顺序

1. 保留当前公网版本，先让内容编译器稳定生成去重后的正文、小测和导航对象；
2. 为本地开发增加与 R2 相同的文件数据源，使 UI 测试不依赖线上资源；
3. 建立 React SPA 阅读外壳，迁移当前导航、正文目录、小测、评论和登录状态组件；
4. 在独立预览入口验证直接访问、刷新、站内跳转、返回目录、锚点、搜索和错误状态；
5. 创建 R2 bucket 和 `/content/*` Worker 路由，上传对象后再更新发布清单；
6. 将 Static Assets 改为 SPA 回落，切换正式文章路由；
7. 删除两组 `generateStaticParams()` 和按文章生成的 HTML/RSC 文件；
8. 分离 `build:web`、`publish:content` 和 `deploy:worker`：正文修改只执行内容发布，
   UI 与 Worker 修改才执行各自部署；
9. 保留切换前的 Cloudflare Worker 版本和旧静态资源，完成公网验收后再清理旧对象。

迁移不修改 D1 表，也不改变 `article_key`、`documentEpoch`、分节 ID 或题目 ID。出现
问题时可以直接把流量切回当前静态导出版本，内容对象不影响旧站运行。

## 本地原型

运行：

```bash
cd apps/web
pnpm content:prepare
pnpm content:prototype
```

脚本读取现有 `.content-cache/`，把相同出版版本按内容哈希合并，结果写入已忽略的
`.content-object-prototype/`。目录包含固定 `shell.html`、`shell.js`、正文与小测
对象、文章清单、导航、搜索索引和测量报告。脚本会检查页面壳不含正文身份，并验证
清单引用的每个正文对象都存在；连续运行时不会重写已有的内容哈希对象。

这个原型只验证发布模型和规模，不接管现有路由，也不代表最终 UI 实现。
