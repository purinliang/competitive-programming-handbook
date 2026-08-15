# Cloudflare 协作学习部署

公开正文由 Workers Static Assets 直接分发，只有 `/api/*` 进入 Hono Worker。D1 保存账户与用户状态，不保存 Markdown、题目正文或 SVG。

## 首次建立资源

在 `apps/web/` 中确认当前 Cloudflare 账号，再创建 D1：

```bash
pnpm exec wrangler whoami
pnpm exec wrangler d1 create handbook-learning
```

把命令返回的 `database_id` 写入 `wrangler.jsonc`，随后应用生产迁移：

```bash
pnpm db:migrate:remote
```

## GitHub 登录

GitHub OAuth App 的 Homepage URL 使用网站公开 origin，Authorization callback URL 为：

```text
https://<公开域名>/api/auth/callback/github
```

第一版只有“使用 GitHub 登录”，没有站内密码注册表单。首次授权成功后，Better Auth 会自动建立站内用户。

下面四项只写入 Cloudflare Secret，不进入 Git、`.env` 或聊天记录：

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
pnpm exec wrangler secret put GITHUB_CLIENT_ID
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
```

`BETTER_AUTH_SECRET` 应使用密码生成器产生至少 32 字节的随机值。Turnstile 的公开 Site Key 可以写入普通变量；若暂未创建 Turnstile Widget，则同时省略 Site Key 和 Secret，网站仍可登录，但新建讨论暂时只受 GitHub 登录和 D1 限流保护。

## Turnstile 与部署

取得 Site Key 后，在 `wrangler.jsonc` 的 `vars` 中配置：

```json
{
  "TURNSTILE_SITE_KEY": "<site-key>"
}
```

最后执行完整验证和部署：

```bash
pnpm test:collaboration
pnpm deploy
```

部署后至少检查公开文章、`/api/health`、GitHub 登录、已阅同步、私密讨论和匿名公开讨论。

## 授予管理员角色

用户至少登录一次后，使用其邮箱在 D1 中授予管理员角色：

```bash
pnpm exec wrangler d1 execute handbook-learning --remote --command \
  "INSERT INTO user_roles (userId, role, updatedAt)
   SELECT id, 'admin', CAST(strftime('%s', 'now') AS INTEGER) * 1000
   FROM user WHERE email = '<管理员邮箱>'
   ON CONFLICT (userId) DO UPDATE SET
     role = 'admin', updatedAt = excluded.updatedAt;"
```

管理员审核页位于 `/admin/discussions/`。普通用户访问审核 API 时得到 404，避免暴露管理端数据结构。
