# 正文数据与页面外壳分离

> 最近修订：2026-08-24

本文记录如何让正文不再静态嵌入每篇文章的 HTML 和 Next.js 导航载荷，以及迁移
过程中的测量、协议和回滚边界。

## 当前实现

全部已发表文章已经使用同一个 `/reader/` React 阅读外壳。Worker 把原有文章 URL
内部映射到这个外壳，浏览器地址仍保持：

```text
/learning-path/<module>/<slug>/
/catalog/<module>/<slug>/
```

构建流程把正文、小测、导航、搜索索引和逐文章交互定义编译到
`public/content/objects/<sha256>.json`。相同的学习正文和模块正文自动复用同一个
对象。`release.json` 是唯一的可变版本指针：发布器先写完所有不可变对象，最后才
覆盖它。初始 HTML 与 RSC 只包含页面骨架，不包含正文句子、代码、目录数据或题目。

Worker 已经接管 `/content/*`：若存在 `CONTENT` R2 binding，则优先读取 R2；否则或
对象未命中时回退到同路径 Static Assets。`release.json` 使用一分钟重新验证缓存，
内容哈希对象使用一年不可变缓存。本地构建与迁移期部署使用同一份 Static Assets
数据源，因此 UI 测试不依赖公网 R2。

原来编译进 Worker 的 `interaction-manifest.json` 已拆成逐文章对象。评论、已阅和
答题接口按当前 release 读取交互定义，正文修改不会再迫使 Worker 重新打包 2.6 MB
出版数据。

文章链接不再生成 `?entry=`。当前导航入口保存在 `history.state`，并用当前标签页的
`sessionStorage` 作为刷新后备；旧链接仍会读取一次参数并通过
`history.replaceState()` 清理 URL。

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

## 迁移前的问题与测量

迁移前 `next.config.ts` 使用 `output: "export"`。学习路线和模块目录分别调用
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

1. Worker 为任意文章 URL 返回同一个 `/reader/` 静态外壳；
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
一个回滚版本。发布状态记录每个版本的完整引用集合；第三个版本切换成功后，仅删除
“过期版本引用 − 当前版与上一版引用”的对象。Git 历史负责更早版本的重新构建。
`pnpm rollback:content` 只覆盖短缓存的 `release.json`，可以立即切回上一版，不会
重新上传正文对象。

日常增量编译以每篇 Markdown、显示标题和来源路径的哈希为准。正文没有变化时，继续
复用原有 HTML 对象；修改 CSS、React 组件或普通网站样式不会触发数百篇正文重新渲染。
渲染规则发生变化后，增量命令会保留尚未修改文章的既有结果并明确提示数量。需要让
所有正文统一采用最新规则时，显式运行：

```bash
pnpm content:prepare:full
```

需要直接全量发布到 R2 时运行 `pnpm publish:content:full`。这项操作用于渲染协议迁移
和定期统一，不属于每次发布的固定步骤。

本地运行 `pnpm dev` 时会监听 Markdown、题目和正文资源。保存文件后只增量编译变化
的内容；阅读页检测到新的本地发布版本后会在保留滚动位置的同时重新读取正文，不经过
R2，也不需要重启开发服务器。

## 平台选择

### 推荐：共享 React 阅读壳、Static Assets 与 R2

严格要求“正文不进入初始 HTML”时，React SPA 与这个模型最一致：构建只产生一个
HTML 外壳和共享 JavaScript/CSS。Cloudflare Workers Static Assets 支持把未命中
静态文件的浏览器导航统一回落到 `/index.html`，同时继续让 `/api/*` 进入现有 Hono
Worker：

- [Cloudflare SPA 路由](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)

当前 UI 继续使用 React 和 Next.js 静态导出，但只生成固定数量的页面外壳。文章站内
切换由共享阅读器管理，普通文章链接仍可直接访问、刷新、前进、后退和带锚点打开。
内容协议不依赖 Next.js 页面数量，以后更换前端构建工具也不需要迁移正文数据。

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

## 迁移状态

1. 已完成全站正文、小测、导航、搜索和交互定义的内容寻址编译；
2. 已完成 Static Assets 本地数据源和 R2 读取回退；
3. 已完成共享 React 阅读外壳与正式文章路由切换；
4. 已删除两组 `generateStaticParams()` 和逐文章 HTML/RSC；
5. 已验证直接访问、刷新、锚点、站内切换、浏览器返回和公开讨论读取；
6. 已完成 R2 增量发布器及本地模拟测试；
7. 已启用 R2、创建 `handbook-content` bucket 并加入 `CONTENT` binding；
8. 已完成首次 R2 上传以及公网文章、导航、搜索、小测、评论接口和缓存验收；
9. 已拆分自动部署触发条件，并验证只修改网站外壳时不会重新发布 R2 正文。

迁移不修改 D1 表，也不改变 `article_key`、`documentEpoch`、分节 ID 或题目 ID。出现
问题时可以直接把流量切回当前静态导出版本，内容对象不影响旧站运行。

## 本地验证

运行：

```bash
cd apps/web
pnpm content:prepare
pnpm test:runtime-content
pnpm test:runtime-browser
pnpm test:content-publish
```

第一项检查 release 及其全部引用；第二项通过真实浏览器检查文章路由、锚点、站内
切换、目录、搜索和错误状态；第三项使用 Wrangler 本地 R2，验证相同版本不上传、
单篇正文变化只增加必要对象、release 最后切换，并只保留当前版与上一版。
