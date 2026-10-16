# 部署手册：GitHub → Cloudflare Pages → Supabase

代码推送到 GitHub 后，剩下的配置分三部分：**Cloudflare Pages 建站**、**Supabase 后台配置**、
**两边互相登记域名**。按顺序做一次即可。

---

## 一、Cloudflare Pages 建站

1. 打开 https://dash.cloudflare.com → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选中本仓库（公开仓库直接可见；私有仓库要点 *Configure account* 授权）
3. **Set up builds and deployments** 填：

   | 字段 | 值 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `Vite`（或 None，下面的命令已经写死） |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/`（留空） |

4. 展开 **Environment variables (advanced)**，点 *Add variable*，加这 **4** 个：

   | 变量名 | 值 |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `VITE_SUPABASE_URL` | Supabase 的 Project URL，形如 `https://xxxxxxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Supabase 的 `anon public` key |
   | `VITE_SITE_URL` | 正式域名，先填 `https://xxx.pages.dev`，绑自定义域名后改成最终域名 |

   > `VITE_*` 变量在**构建时**被 Vite 打进产物，改完必须点 **Retry deployment → Retry with same commit** 重新构建才生效。
   > 只做「Redeploy」不会重新注入变量。

5. 点 **Save and Deploy**，等 1–2 分钟，出现 `*.pages.dev` 即成功。

**SPA 路由为什么不会 404**：仓库里 `public/_redirects` 内容是 `/*  /index.html  200`，
Cloudflare Pages 原生支持这个文件，直接访问 `/t/xxx` 或刷新页面会自动回落到 SPA 入口。不需要额外配置。

---

## 二、绑定自定义域名

### 2.1 域名在 Cloudflare 托管（推荐）

1. Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 输入域名（如 `resumedrawer.com`），Cloudflare 会自动加 DNS 记录和证书，等几分钟即可
3. 建议同时把 `www` 加为第二个自定义域名

### 2.2 域名在其他注册商

1. Pages 项目 → **Custom domains** → 输入域名
2. Cloudflare 会给出一条 CNAME，去注册商后台添加：

   ```
   类型  CNAME
   主机  @ （或 www）
   目标  <你的项目名>.pages.dev
   ```

3. 等 DNS 生效 + 证书签发（通常几分钟到半小时）

### 2.3 域名加完后必须回头改两个地方

- Cloudflare Pages → **Settings → Environment variables** → 把 `VITE_SITE_URL` 改成 `https://你的域名`，然后重新构建
- 见下面 Supabase 第三节的 **URL Configuration**

---

## 三、Supabase 后台配置

### 3.1 拿到 API 凭据

**Project Settings → API**，复制两个值（就是填进 Cloudflare 的那两个）：

- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` → `VITE_SUPABASE_ANON_KEY`

> ⚠️ **绝对不要用 `service_role` key**。它会绕过所有 RLS 策略，一旦进了前端产物等于数据库裸奔。
> `anon` key 被打包进前端是 Supabase 的正常设计，安全性由 RLS 保证。

### 3.2 URL Configuration（这一步最容易漏）

**Authentication → URL Configuration**，填：

| 字段 | 值 |
| ---|--- |
| Site URL | `https://你的域名` |
| Redirect URLs | 加一条 `https://你的域名/**` |

同时把本地地址也加进 Redirect URLs 方便调试：

```
http://localhost:5173/**
```

不加的话，注册/登录/重置密码会被 Supabase 拦截并报 `redirect_to` 不允许。

### 3.3 关闭邮箱验证

**Authentication → Providers → Email**：
- `Email provider` 保持开启
- **取消勾选 `Confirm email`** —— 关掉后注册即登录，不依赖邮件送达

> Supabase 内置 SMTP 每小时只发几封，仅供调试。正式启用邮箱验证要去
> **Authentication → Emails → SMTP Settings** 配自己的邮件服务。

### 3.4 执行 SQL 脚本

**SQL Editor → New query**，按序各粘贴运行一次（都可重复运行）：

| 顺序 | 文件 | 作用 |
|---|---|---|
| 1 | `supabase/01-schema.sql` | 扩展、函数、9 张表、索引、触发器 |
| 2 | `supabase/02-policies.sql` | RLS 策略 + 创建 `previews` 存储桶 |
| 3 | `supabase/03-rpc.sql` | 搜索 / 计数 / 收藏 / 上报 / 统计函数 |
| 4 | `supabase/04-seed.sql` | 49 条种子数据 |
| 5 | `supabase/06-patch.sql` | 投稿归属默认值、表级 GRANT、搜索字段补全、补充索引 |
| 6 | `supabase/05-verify.sql` | 自检，所有 `ok` 列应为 `t` |

> `06-patch.sql` 必须在 `04-seed.sql` 之后跑 —— 它重算已有 49 条数据的 `search_norm`。
> 不跑不报错，但搜分类名（如「互联网」）和标签会搜不到。

### 3.5 把自己设为管理员

先在网站注册一个账号，然后 SQL Editor 执行：

```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = '你的邮箱@example.com'
);
```

### 3.6 存储桶

`02-policies.sql` 已自动创建 `previews` 桶（公开读，登录用户只能写自己 uid 目录下）。
在 **Storage** 页面确认存在即可。

免费额度提醒：项目连续 **7 天无请求会被暂停**，控制台点一下即可恢复。

---

## 四、验收清单

- [ ] `https://你的域名` 能打开首页
- [ ] 随便点进 `/t/某个slug`，**刷新页面**仍是正常页面而不是 404
- [ ] 注册 → 登录 → 收藏，数据能落到 Supabase（Table Editor 里能看到新行）
- [ ] 忘记密码能收到重置流程（依赖 3.2 的 Redirect URLs）
- [ ] `https://你的域名/sitemap.xml` 可访问，里面的域名是正式域名而不是 localhost

---

## 常见问题

**Q: 部署后网站还是演示模式（提示未连接云端）？**
环境变量没生效。Cloudflare 的 `VITE_*` 是构建期注入的，改完必须 **Retry deployment**，
并且要确认变量加在了 **Production** 环境（不是只有 Preview）。

**Q: 构建失败，报 Node 版本不对？**
加 `NODE_VERSION = 22`（项目 `engines` 要求 `>=20.19 || >=22.12`，`.nvmrc` 写的 22）。

**Q: 登录报 `redirect_to` 不允许？**
Supabase → Authentication → URL Configuration → Redirect URLs 没加你的域名。

**Q: 自定义域名一直 Pending？**
DNS 还没生效，用 `nslookup 你的域名` 确认 CNAME 已指向 `*.pages.dev`。Cloudflare
托管域名的话要确认代理状态是「已代理」（橙色云）。
