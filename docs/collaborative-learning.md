# 协作学习系统实施目标

## 目标

在不改变公开静态阅读体验的前提下，为学习路线正文增加账户、分节已阅、小测验同步和内容讨论。读者可以针对整篇文章或某个二级标题所属的内容块留言；评论默认只有作者本人和管理员可见，也可以主动公开，并可选择向其他读者匿名。

Git 继续保存正文、题目、答案与解析。D1 只保存身份和用户产生的状态，不复制 Markdown。

## 第一版范围

- 匿名读者无需登录即可阅读正文、搜索和在浏览器本地完成小测验。
- 登录用户可以同步每个二级标题的已阅状态和每道题的作答状态。
- 登录用户可以对整篇文章或某个二级标题创建讨论串并继续回复。
- 新讨论默认设为私密，只有作者和管理员可见；作者可以主动设为公开。
- 公开讨论可以署名或匿名。匿名只对其他普通读者隐藏身份，平台管理员始终能够追溯作者。
- 评论正文支持 GFM 与 LaTeX；原始 HTML 不执行，外部链接使用用户生成内容的安全属性。
- 第一版只让学习路线出版版本产生进度和讨论。模块目录正文继续公开查阅；目录可以按
  稳定文章 ID 展示对应学习正文的小测完成状态，但模块正文不另建一份交互状态。
- 管理员可以查看私密讨论、回复、锁定、软删除和处理举报；不能以普通读者身份公开他人的真实身份。

第一版不支持任意字符范围批注、实时协同光标、附件、站内私信和付费权限。这些能力不能阻塞二级标题块级讨论上线。

## 部署结构

同一个 Cloudflare Worker 项目同时提供静态资源和 API：

```text
公开页面、RSC、CSS、JS、SVG ── Workers Static Assets
                              └─ asset-first，不执行应用 Worker

/api/* ── Worker（Hono + Better Auth）── D1
```

`assets.run_worker_first` 只匹配 `/api/*`。因此增加登录和 D1 后，普通文章请求仍由静态资源直接响应；同源 API 和 HttpOnly Cookie 也不需要额外的 CORS 配置。

账户第一版使用 Better Auth，并先接入 GitHub OAuth，满足当前小规模使用和管理员登录。面向学生开放前再接入适合目标地区的邮箱注册与验证服务；在没有可靠的验证邮件和密码重置通道以前，不开放无法找回的邮箱密码账户。Cloudflare Access 只可保护内部管理入口，不能替代公开学生账户。

## 内容身份

### 文档

交互使用下面的稳定键：

```text
document_key = learning-path:<article_key>
```

例如 `learning-path:cpp/a-plus-b-problem`。模块目录若以后开放讨论，使用独立的 `catalog:<article_key>`，不能与学习路线正文共用评论。

每篇正文继续计算 `content_revision`。它用于描述整篇文章的版本，不用于决定某个小节的已阅状态。

### 二级标题块

一个二级标题块从该 `##` 标题开始，到下一个 `##` 标题或文章末尾为止。每个块生成：

```text
section_id
section_revision
heading_id
title
quoted_text
```

`heading_id` 只负责页面锚点。`section_id` 才是数据库身份，禁止使用标题在文章中的序号。

默认 `section_id` 由标题的 slug 得到。插入或删除其他标题不会改变它；正文内容变化也不会改变它。需要允许标题改名但保留讨论时，在标题前显式声明：

```markdown
<!-- section-id: oj-results -->
## 评测结果
```

显式 ID 只允许小写字母、数字和短横线，并且在一篇文章内唯一。重复标题若会依赖自动追加的序号，构建检查应要求作者改用显式 ID，避免在前方插入同名标题后发生错位。

`section_revision` 是该标题及其全部块内容的规范化哈希。修改同一小节只改变这个 revision，不影响其他小节。

大规模改写时，作者应更换相关的显式 `section_id`；若整篇文章的语义映射已经不可信，可以提升该文档的 `document_epoch`。旧记录保留为历史记录，不自动绑定到新结构。

`document_epoch` 默认是 `1`。确需让整篇文章进入新的身份空间时，在学习正文中显式声明：

```markdown
<!-- document-epoch: 2 -->
```

同一篇正文只能声明一次，值必须是正整数。普通增删段落、修改小节或调整题目不能提升 epoch；优先依靠各自的 revision 精确失效。只有整篇文章已经无法可靠映射旧结构时才递增，并保留数据库中的旧记录供历史查询。

### 小测验

题目继续使用人工维护的语义 `question_id`。构建阶段为每一道题单独计算 `question_revision`，其输入包含题干、全部选项、正确答案和解析。

新增、删除或修改另一道题不能使本题记录失效。题意发生变化时保留 `question_id` 并更新 revision；题目被完全替换时使用新的 ID。展示顺序从来不是身份。

## 更新后的状态语义

不根据文件修改时间判断状态，也不在出版更新时批量删除数据。哈希 revision 是确定性的，能区分内容是否真正变化，也不会因为重新构建产生误报。

### 已阅

已阅记录保存当时的 `section_revision`。只有它等于当前构建中的 revision 时才显示为已阅；不相等时显示为未读，并可以提示“本节在上次阅读后已更新”。旧记录保留用于审计和以后展示学习历史。

### 作答

作答记录保存 `question_id` 和 `question_revision`。只有 revision 相同的正确答案才计入当前完成进度。修改一道题不会清除其他题目的状态。

目录进度按文章而不是按题目计数。一篇文章只有在当前版本的全部题目都答对后才算完成；
没有小测的文章不进入分母。文章行只显示安静的完成记号，单元和专题显示
“已完成文章数 / 含小测文章数”。学习路线、模块目录和正文左侧导航复用同一结果。

### 评论

评论不能因为正文更新而消失。讨论串保存创建时的 `section_revision`、标题和引用摘要：

- ID 仍存在且 revision 相同：显示为当前讨论。
- ID 仍存在但 revision 不同：显示“针对旧版本”，仍挂在同一小节下。
- ID 已不存在：保留在文章的历史讨论中，不猜测性地迁移到另一个标题。
- 整篇文章评论使用特殊目标 `article`，并保存创建时的 `content_revision`。

## 权限与隐私

阅读状态和作答记录永远只有本人和管理员可见，不提供公开开关。

讨论串使用两个互相独立的字段：

```text
visibility = private | public
anonymous = false | true
```

- 默认值是 `private` 和 `false`。
- 私密讨论只允许作者和管理员查看、回复；匿名开关对私密讨论没有额外效果。
- 公开且非匿名时展示作者公开昵称。
- 公开且匿名时向普通读者显示“匿名同学”，但数据库仍保存作者 ID，管理员视图明确显示真实作者。
- 回复继承讨论串的可见范围，不允许一条私密回复意外出现在公开串中。
- 删除使用软删除；审核动作单独记录操作者、原因和时间。

服务端必须根据会话重新判断权限，不能信任前端传入的 `user_id`、角色、匿名状态展示名或目标 revision。

## D1 数据模型

Better Auth 维护 `user`、`session`、`account` 和 `verification`。业务表使用 TEXT UUID 与 UTC 毫秒时间戳：

```text
user_roles
section_progress
question_attempts
discussion_threads
discussion_comments
comment_reports
moderation_events
```

关键唯一约束：

- `section_progress(user_id, document_key, document_epoch, section_id)`
- 每次提交小测验都进入 `question_attempts`，当前状态由同一用户与题目的最新记录得到。
- 讨论串目标由 `document_key + document_epoch + target_kind + target_id` 表示。

Worker 随构建携带一份紧凑的公开内容清单，验证客户端提交的 `document_key`、`section_id`、`section_revision`、`question_id` 和 `question_revision`。D1 不保存题干，也不接受任意伪造的内容键。

## API 边界

第一版使用同源 JSON API：

```text
GET    /api/auth/*
GET    /api/me
GET    /api/learning/state?document_key=...
GET    /api/learning/progress
POST   /api/learning/sections
POST   /api/learning/questions/attempts
GET    /api/discussions?document_key=...&target=...
POST   /api/discussions
POST   /api/discussions/:thread_id/comments
PATCH  /api/discussions/:thread_id
POST   /api/comments/:comment_id/report
GET    /api/admin/discussions
POST   /api/admin/comments/:comment_id/moderate
```

写接口需要登录、Origin 检查、请求体上限和 D1 速率限制。新建讨论在生产环境配置 Turnstile 后强制完成验证；回复和状态写入仍受登录与按动作限流保护。Cookie 使用 `HttpOnly`、`Secure`、`SameSite=Lax`。公开评论输出前由服务端完成匿名化，不能把真实用户对象发送到浏览器以后再隐藏。

`/api/learning/progress` 一次返回当前账户全部学习正文中、每道当前版本题目的最新作答
结果。目录禁止逐篇请求 `/api/learning/state`；前端先读取本地进度，再异步合并这一次
批量响应，并为右侧状态槽预留固定宽度，避免加载登录状态时列表横向闪动。

## 实施阶段

### 1. 内容身份

- 构建二级标题块清单和单独的 `section_revision`。
- 支持显式 `section-id` 并校验唯一性。
- 为每道题生成 `question_revision`，替换整份题库一起失效的本地状态。
- 生成供静态页面和 Worker 共用的紧凑内容清单。

### 2. Worker 与 D1

- 给现有 Static Assets 项目增加只处理 `/api/*` 的 Worker。
- 建立 D1 migration、健康检查和本地数据库工作流。
- 接入 Better Auth、GitHub OAuth、角色与管理员种子流程。
- 保证缺少登录时公开静态路由不受影响。

### 3. 学习状态

- 在二级标题块旁增加已阅操作。
- 登录前继续使用 localStorage；登录后明确询问并合并本地记录。
- 同步逐题作答并正确处理过期 revision。
- 在目录中只显示安静的文章级汇总，不为每个小节堆叠状态标签。

### 4. 讨论

- 实现文章级和二级标题块级讨论入口。
- 默认私密，支持公开与匿名开关、回复和旧版本提示。
- 增加举报、锁定、软删除和管理员审核页。

### 5. 安全与上线

- 对写接口加入 Turnstile、速率限制、长度限制与审计日志。
- 覆盖跨用户私密数据、匿名泄漏、过期 revision 和已删除小节的测试。
- 本地 D1 migration、静态构建和 Wrangler 预览全部通过后再创建生产绑定并部署。

## 完成标准

- 未登录用户仍能直接访问每一篇公开文章，普通文章请求不执行 API Worker。
- 在一篇文章前方插入二级标题，不会改变其他小节的 ID、评论或已阅记录。
- 修改一个小节后，只让该小节的已阅状态失效；旧评论仍可查阅并标明版本。
- 修改一道题后，只让该题的当前完成状态失效。
- 私密讨论无法被其他普通账户通过列表、详情或猜测 ID 读取。
- 匿名公开讨论的普通 API 响应不包含可还原作者身份的信息。
- 删除或大改内容不会把历史评论错误挂到另一段正文。
- D1 暂时不可用时，公开阅读和本地小测验仍然工作。
