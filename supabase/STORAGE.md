# Supabase 控制台操作清单

SQL 脚本负责建表、策略、函数；下面几步只能在控制台点，按顺序做一次即可。

## 1. 创建项目

1. 打开 https://supabase.com/dashboard → New project
2. 记下数据库密码（后面可能用到），区域选离用户近的（国内访问建议 Singapore / Tokyo）
3. 项目创建完成后，进入 **Project Settings → API**，复制：
   - `Project URL` → 填入 `VITE_SUPABASE_URL`
   - `anon public` key → 填入 `VITE_SUPABASE_ANON_KEY`
   - （**不要**复制 `service_role` key，它拥有绕过 RLS 的完整权限）

## 2. 关闭邮箱验证

用户选择的是「邮箱 + 密码，关闭邮箱验证」，注册后即可登录：

**Authentication → Providers → Email**
- 确认 `Email provider` 为开启
- 取消勾选 **Confirm email**（关掉后注册即登录，不依赖邮件送达）

> Supabase 内置 SMTP 每小时只能发几封邮件，仅用于开发调试。若将来要正式开启邮箱验证，
> 需要在 **Authentication → Emails → SMTP Settings** 里配置自己的邮件服务。

## 3. 执行 SQL 脚本

**SQL Editor → New query**，按以下顺序各粘贴运行一次（每段都可重复运行）：

| 顺序 | 文件 | 作用 |
|---|---|---|
| 1 | `01-schema.sql` | 扩展、函数、9 张表、索引、触发器 |
| 2 | `02-policies.sql` | RLS 策略 + 创建 `previews` 存储桶 |
| 3 | `03-rpc.sql` | 搜索 / 计数 / 收藏 / 上报 / 统计函数 |
| 4 | `04-seed.sql` | 49 条种子数据 |
| 5 | `06-patch.sql` | 增量补丁：投稿归属默认值、表级 GRANT、搜索字段补全、补充索引 |
| 6 | `05-verify.sql` | 自检，所有 `ok` 列应为 `t` |

> `06-patch.sql` 必须在 `04-seed.sql` 之后跑 —— 它会重算已有 49 条数据的 `search_norm`。
> 不跑也不会报错，但搜分类名（如「互联网」）和标签会搜不到。

## 4. 把自己设为管理员

模板写操作、投稿审核、联系消息查看都需要 `admin` 角色。先注册一个账号，然后运行：

```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = '你的邮箱@example.com'
);
```

## 5. 存储桶（预览图）

`02-policies.sql` 已经自动创建了 `previews` 桶（公开读，登录用户只能写自己 uid 目录下的文件）。
可以在 **Storage** 页面确认它存在。

上传真实预览图时的约定路径：

```
previews/<用户 uid>/<模板 slug>.png
```

上传后把 `templates.preview_kind` 改成 `'self-hosted'`，并填入：

```sql
update public.templates
   set preview_kind = 'self-hosted',
       preview_storage_path = '<uid>/<slug>.png'
 where slug = '某个模板的 slug';
```

前端会自动用 Storage 公开 URL 渲染，无需改代码。
没上传真实图的模板保持 `preview_kind = 'generated'`，由前端程序化生成占位缩略图。

## 6. 免费额度注意

- 项目连续 **7 天没有任何请求会被暂停**，控制台会有提示，点一下即可恢复
- 本项目数据量很小（几十条模板），数据库与存储的免费额度远远够用
- **Project Settings → Usage** 可以看当前用量
