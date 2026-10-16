-- ============================================================================
-- ResumeDrawer · 04-seed.sql
-- 由 scripts/gen-seed-sql.mjs 从 src/data/seed.json 自动生成，请勿手工编辑
-- 生成时间：2026-10-16T18:31:13.566Z
-- 收录 49 条模板 / 8 个分类 / 16 个标签
--
-- 说明：本站只做索引，不托管任何模板文件。download_url 指向来源页面（部分为来源的模板库入口）。
--       上线前建议跑一次 node scripts/check-links.mjs 校验外链可用性。
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 分类
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, short_desc, color_hex, icon, sort_order) values
  ('tech', '技术 / 研发', '前后端、算法、数据、测试等工程岗位', '#2563eb', 'Code', 1),
  ('product', '产品 / 运营', '产品经理、项目管理、内容与市场运营', '#0891b2', 'Compass', 2),
  ('design', '设计 / 创意', '视觉、UI/UX、平面与内容创作', '#7c3aed', 'Palette', 3),
  ('finance', '金融 / 财会', '投行、行研、会计与财务分析', '#059669', 'Landmark', 4),
  ('academic', '学术 / 科研', '教职申请、博士后、基金与会议材料', '#1d4ed8', 'GraduationCap', 5),
  ('campus', '应届 / 实习', '在校生、实习生与应届毕业求职', '#ea580c', 'Sparkles', 6),
  ('management', '管理 / 高管', '总监级以上、跨部门管理与战略岗', '#9f1239', 'Briefcase', 7),
  ('general', '通用 / 综合', '不挑行业的通用版式与万能结构', '#475569', 'LayoutTemplate', 8)
on conflict (slug) do update set
  name = excluded.name,
  short_desc = excluded.short_desc,
  color_hex = excluded.color_hex,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 标签
-- ---------------------------------------------------------------------------
insert into public.tags (slug, name, kind) values
  ('ats-friendly', 'ATS 友好', 'feature'),
  ('one-page', '一页纸', 'feature'),
  ('two-page', '两页', 'feature'),
  ('with-photo', '含照片位', 'feature'),
  ('skill-bar', '技能条', 'feature'),
  ('project-section', '项目经历栏', 'feature'),
  ('icon-header', '图标化联系方式', 'style'),
  ('no-photo', '无照片纯文字', 'feature'),
  ('open-source', '开源可改', 'topic'),
  ('latex', 'LaTeX 系', 'topic'),
  ('editable-source', '含可编辑源文件', 'feature'),
  ('cover-letter', '配套求职信', 'feature'),
  ('print-ready', '打印友好', 'feature'),
  ('multilingual', '多语言版本', 'feature'),
  ('minimalist', '极简排版', 'style'),
  ('creative', '创意风格', 'style')
on conflict (slug) do update set name = excluded.name, kind = excluded.kind;

-- ---------------------------------------------------------------------------
-- 模板（只存元信息 + 外链，不存任何模板文件）
-- ---------------------------------------------------------------------------
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'awesome-cv-latex', 'Awesome CV', 'GitHub 上最知名的 LaTeX 简历模板之一，标题区带重名效果，适合中高级技术岗。', (select id from public.categories where slug = 'tech'), 'single-column', 'mid', 'blue',
  false, true, '{en}', '{tex,pdf}', 2,
  'oss', 'GitHub', 'posquit0', 'https://github.com/posquit0/Awesome-CV', 'https://github.com/posquit0/Awesome-CV',
  'generated', 'published', true,
  3016, 377, 102, now() - make_interval(days => 186)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'sb2nov-resume', 'sb2nov Resume', '经典双栏 LaTeX 简历，左侧技能与联系方式、右侧主经历，信息密度高。', (select id from public.categories where slug = 'tech'), 'two-column', 'mid', 'navy',
  false, true, '{en}', '{tex,pdf}', 2,
  'oss', 'GitHub', 'sb2nov', 'https://github.com/sb2nov/resume', 'https://github.com/sb2nov/resume',
  'generated', 'published', true,
  486, 81, 9, now() - make_interval(days => 182)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'jakegut-resume', 'Jake''s Resume', '单栏极简 LaTeX 简历，Google 工程师风格，几乎零装饰，ATS 通过率极高。', (select id from public.categories where slug = 'tech'), 'single-column', 'junior', 'mono',
  false, true, '{en}', '{tex,pdf}', 1,
  'oss', 'GitHub', 'jakegut', 'https://github.com/jakegut/resume', 'https://github.com/jakegut/resume',
  'generated', 'published', true,
  2296, 328, 46, now() - make_interval(days => 137)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'mcdowell-cv', 'McDowell CV', '源自 MIT 职业中心的 LaTeX 简历模板，结构克制，适合理工科应届与在校生。', (select id from public.categories where slug = 'campus'), 'single-column', 'fresh-grad', 'mono',
  false, true, '{en}', '{tex,pdf}', 1,
  'oss', 'GitHub', 'dnl-blkv', 'https://github.com/dnl-blkv/mcdowell-cv', 'https://github.com/dnl-blkv/mcdowell-cv',
  'generated', 'published', false,
  1170, 390, 78, now() - make_interval(days => 163)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'deedy-resume', 'Deedy Resume', '带头像位的双栏 LaTeX 简历，视觉成熟，适合设计感要求不高的技术岗。', (select id from public.categories where slug = 'tech'), 'sidebar', 'mid', 'blue',
  true, false, '{en}', '{tex,pdf}', 2,
  'oss', 'GitHub', 'deedydas', 'https://github.com/deedydas/Deedy-Resume', 'https://github.com/deedydas/Deedy-Resume',
  'generated', 'published', false,
  1806, 258, 62, now() - make_interval(days => 39)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'jsonresume-standard', 'JSON Resume 官方主题', '用 JSON 描述简历内容、主题渲染排版，一份数据换多套皮肤。', (select id from public.categories where slug = 'general'), 'single-column', 'general', 'mono',
  false, true, '{en}', '{json,html,pdf}', 2,
  'oss', 'JSON Resume', 'JSON Resume 社区', 'https://jsonresume.org/', 'https://jsonresume.org/themes/',
  'generated', 'published', false,
  6006, 858, 69, now() - make_interval(days => 91)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'reactive-resume', 'Reactive Resume', '开源自托管的在线简历编辑器，内置多套模板，可导出 PDF 与 JSON。', (select id from public.categories where slug = 'general'), 'single-column', 'general', 'blue',
  false, true, '{zh,en}', '{html,pdf,json}', 2,
  'oss', 'Reactive Resume', 'Amruth Pillai', 'https://rxresu.me/', 'https://rxresu.me/',
  'generated', 'published', true,
  1890, 378, 30, now() - make_interval(days => 159)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'resume-github-io', 'GitHub Resume Generator', '用 Markdown 写简历、按 GitHub 用户名生成网页版简历，程序员展示项目很顺手。', (select id from public.categories where slug = 'tech'), 'single-column', 'junior', 'dark',
  false, false, '{en}', '{html,md}', 1,
  'oss', 'GitHub Resume', 'GitHub 社区', 'https://resume.github.io/', 'https://resume.github.io/',
  'generated', 'published', false,
  3796, 949, 180, now() - make_interval(days => 70)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'overleaf-cv-gallery', 'Overleaf CV 模板库', 'Overleaf 官方模板库中的简历与 CV 分类，数百套 LaTeX 模板在线直接编译。', (select id from public.categories where slug = 'general'), 'single-column', 'general', 'blue',
  false, true, '{en}', '{tex,pdf}', 2,
  'free-personal', 'Overleaf', 'Overleaf', 'https://www.overleaf.com/latex/templates/tagged/cv', 'https://www.overleaf.com/latex/templates/tagged/cv',
  'generated', 'published', true,
  4732, 676, 176, now() - make_interval(days => 57)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'latextemplates-curricula', 'LaTeX Templates · CV 合集', '第三方 LaTeX 模板站的简历分类，按版式与配色筛选，含预览图。', (select id from public.categories where slug = 'general'), 'two-column', 'general', 'morandi',
  false, true, '{en}', '{tex,pdf}', 2,
  'free-personal', 'LaTeX Templates', 'LaTeX Templates', 'https://www.latextemplates.com/cat/curricula-vitae', 'https://www.latextemplates.com/cat/curricula-vitae',
  'generated', 'published', false,
  1050, 175, 37, now() - make_interval(days => 128)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'canva-resume-templates', 'Canva 简历模板库', '在线拖拽编辑，中文模板丰富，免费档即可导出 PDF，改文案最快。', (select id from public.categories where slug = 'general'), 'two-column', 'general', 'colorful',
  true, false, '{zh,en}', '{pdf}', 1,
  'account-required', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', true,
  1030, 206, 33, now() - make_interval(days => 147)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'microsoft-create-resume', 'Microsoft Create 简历模板', '微软官方模板站，Word 在线编辑，版式规整、单位领导看得惯。', (select id from public.categories where slug = 'general'), 'single-column', 'general', 'blue',
  true, true, '{zh,en}', '{docx}', 1,
  'free-personal', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', false,
  2110, 422, 34, now() - make_interval(days => 175)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'figma-community-resume', 'Figma 社区简历模板', '设计师常用：Figma 社区里的简历文件，复制即可改，配色和字体完全可控。', (select id from public.categories where slug = 'design'), 'portfolio', 'mid', 'colorful',
  true, false, '{en}', '{fig,pdf}', 2,
  'free-personal', 'Figma Community', 'Figma 社区作者', 'https://www.figma.com/community/search?type=files&q=resume%20template', 'https://www.figma.com/community/search?type=files&q=resume%20template',
  'generated', 'published', true,
  5214, 869, 165, now() - make_interval(days => 102)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'notion-resume-gallery', 'Notion 简历模板库', 'Notion 模板库中的简历模板，适合需要同时维护网页版与 PDF 的人。', (select id from public.categories where slug = 'general'), 'single-column', 'junior', 'mono',
  false, true, '{zh,en}', '{html,pdf}', 1,
  'free-personal', 'Notion', 'Notion 社区', 'https://www.notion.com/gallery?query=resume', 'https://www.notion.com/gallery?query=resume',
  'generated', 'published', false,
  3892, 973, 224, now() - make_interval(days => 82)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'zety-resume-templates', 'Zety 简历模板', '成体系的在线简历工具，模板偏商务，支持导出 Word 与 PDF。', (select id from public.categories where slug = 'general'), 'sidebar', 'mid', 'navy',
  false, true, '{en}', '{docx,pdf}', 1,
  'account-required', 'Zety', 'Zety', 'https://zety.com/resume-templates', 'https://zety.com/resume-templates',
  'generated', 'published', false,
  3702, 617, 167, now() - make_interval(days => 158)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'novoresume-templates', 'Novorésumé 简历模板', '免费档可用的在线模板，版式现代，适合一页纸的表达。', (select id from public.categories where slug = 'campus'), 'single-column', 'fresh-grad', 'blue',
  false, true, '{en}', '{pdf}', 1,
  'account-required', 'Novorésumé', 'Novorésumé', 'https://novoresume.com/resume-templates', 'https://novoresume.com/resume-templates',
  'generated', 'published', false,
  4788, 684, 96, now() - make_interval(days => 45)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'flowcv-templates', 'FlowCV 简历模板', '免费额度较友好的在线简历工具，中文支持尚可，导出干净。', (select id from public.categories where slug = 'general'), 'single-column', 'junior', 'green',
  false, true, '{zh,en}', '{pdf}', 1,
  'free-personal', 'FlowCV', 'FlowCV', 'https://flowcv.com/', 'https://flowcv.com/resume-templates',
  'generated', 'published', false,
  1482, 494, 99, now() - make_interval(days => 175)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'kickresume-templates', 'Kickresume 简历模板', '模板数量多，含作品集与求职信配套，视觉风格偏活泼。', (select id from public.categories where slug = 'design'), 'two-column', 'junior', 'colorful',
  true, false, '{en}', '{docx,pdf}', 2,
  'account-required', 'Kickresume', 'Kickresume', 'https://www.kickresume.com/en/resume-templates/', 'https://www.kickresume.com/en/resume-templates/',
  'generated', 'published', false,
  4242, 606, 73, now() - make_interval(days => 55)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'standard-resume', 'Standard Resume 模板', '克制的单栏在线简历，字号与留白讲究，适合投海外公司。', (select id from public.categories where slug = 'general'), 'single-column', 'mid', 'mono',
  false, true, '{en}', '{pdf}', 1,
  'account-required', 'Standard Resume', 'Standard Resume', 'https://standardresume.co/', 'https://standardresume.co/templates',
  'generated', 'published', false,
  6132, 876, 228, now() - make_interval(days => 197)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'resume-io-templates', 'Resume.io 简历模板', '上手最快的在线工具之一，模板分类清晰，免费档可试导出。', (select id from public.categories where slug = 'general'), 'sidebar', 'junior', 'navy',
  true, true, '{zh,en}', '{docx,pdf}', 1,
  'account-required', 'Resume.io', 'Resume.io', 'https://resume.io/templates', 'https://resume.io/templates',
  'generated', 'published', false,
  402, 67, 9, now() - make_interval(days => 156)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'moderncv-latex', 'moderncv · LaTeX 简历类', 'LaTeX 官方文档类之一，银行与投行风格，欧洲求职常用。', (select id from public.categories where slug = 'finance'), 'single-column', 'mid', 'blue',
  true, true, '{en,de,fr}', '{tex,pdf}', 2,
  'oss', 'CTAN', 'Xavier Danaux', 'https://ctan.org/pkg/moderncv', 'https://ctan.org/pkg/moderncv',
  'generated', 'published', false,
  2958, 986, 118, now() - make_interval(days => 127)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'friggeri-cv', 'Friggeri CV', '极简大字标题的 LaTeX 简历，留白多，适合创意与研究岗。', (select id from public.categories where slug = 'academic'), 'two-column', 'senior', 'mono',
  true, false, '{en}', '{tex,pdf}', 2,
  'oss', 'GitHub', 'Adrian Friggeri', 'https://github.com/afriggeri/CV', 'https://github.com/afriggeri/CV',
  'generated', 'published', false,
  3430, 686, 110, now() - make_interval(days => 147)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'academic-cv-latex', '学术 CV（论文列表版）', '面向教职与博士后的长 CV： publications、基金、教学与报告清单齐全。', (select id from public.categories where slug = 'academic'), 'single-column', 'senior', 'navy',
  false, true, '{en}', '{tex,pdf}', 4,
  'oss', 'GitHub', '社区维护', 'https://github.com/posquit0/Awesome-CV', 'https://github.com/posquit0/Awesome-CV',
  'generated', 'published', false,
  1544, 193, 44, now() - make_interval(days => 154)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'cv-two-page-europass', 'Europass CV', '欧盟官方 CV 格式，跨国申请与留学场景的通用语言。', (select id from public.categories where slug = 'academic'), 'two-column', 'general', 'blue',
  true, true, '{en,de,fr,es}', '{docx,pdf}', 2,
  'free-personal', 'Europass', 'European Commission', 'https://europa.eu/europass/en/create-europass-cv', 'https://europa.eu/europass/en/create-europass-cv',
  'generated', 'published', false,
  2988, 996, 259, now() - make_interval(days => 129)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'tech-two-column-ats', '技术岗双栏 ATS 简历', '双栏但保持纯文本可读，机器解析不丢字段，适合投大厂。', (select id from public.categories where slug = 'tech'), 'two-column', 'senior', 'navy',
  false, true, '{en}', '{docx,pdf}', 2,
  'free-commercial', 'Overleaf', 'Overleaf 社区', 'https://www.overleaf.com/latex/templates/tagged/cv', 'https://www.overleaf.com/latex/templates/tagged/cv',
  'generated', 'published', false,
  4660, 932, 205, now() - make_interval(days => 133)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'frontend-portfolio-cv', '前端 / 作品集型简历', '上半部分放项目截图，下半部分写经历，投创业团队很吃香。', (select id from public.categories where slug = 'tech'), 'portfolio', 'mid', 'colorful',
  true, false, '{zh,en}', '{fig,pdf}', 2,
  'free-personal', 'Figma Community', 'Figma 社区作者', 'https://www.figma.com/community/search?type=files&q=resume', 'https://www.figma.com/community/search?type=files&q=resume',
  'generated', 'published', false,
  3070, 614, 123, now() - make_interval(days => 175)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'product-manager-cv', '产品经理简历（项目制）', '以项目为单位的写法：背景、动作、结果三段式，突出业务指标。', (select id from public.categories where slug = 'product'), 'single-column', 'mid', 'blue',
  false, true, '{zh}', '{docx,pdf}', 2,
  'free-commercial', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', true,
  1248, 416, 92, now() - make_interval(days => 37)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'operations-growth-cv', '运营 / 增长简历', '强调数据结果的运营简历版式，指标栏前置。', (select id from public.categories where slug = 'product'), 'sidebar', 'junior', 'green',
  false, true, '{zh}', '{docx}', 1,
  'free-commercial', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', false,
  3316, 829, 158, now() - make_interval(days => 58)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'ux-designer-cv', 'UI/UX 设计师简历', '侧边放工具与作品集链接，正文用案例结构叙述。', (select id from public.categories where slug = 'design'), 'sidebar', 'mid', 'morandi',
  true, false, '{zh,en}', '{fig,pdf}', 2,
  'free-personal', 'Figma Community', 'Figma 社区作者', 'https://www.figma.com/community/search?type=files&q=resume', 'https://www.figma.com/community/search?type=files&q=resume',
  'generated', 'published', true,
  2976, 992, 218, now() - make_interval(days => 185)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'graphic-designer-infographic', '信息图型创意简历', '用图形表达技能占比与时间线，视觉冲击强，慎用 ATS 系统。', (select id from public.categories where slug = 'design'), 'infographic', 'junior', 'colorful',
  true, false, '{zh,en}', '{psd,ai,pdf}', 1,
  'free-personal', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', false,
  4530, 906, 145, now() - make_interval(days => 179)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'finance-analyst-cv', '财务 / 分析师简历', '投行与行研偏好的克制度：纯文字、无图、数字说话。', (select id from public.categories where slug = 'finance'), 'single-column', 'junior', 'mono',
  false, true, '{en,zh}', '{docx,pdf}', 1,
  'free-commercial', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', false,
  1992, 664, 66, now() - make_interval(days => 65)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'investment-banking-cv', '投行 / PE 简历', '一页纸、无装饰、教育背景置顶，交易与项目清单用要点罗列。', (select id from public.categories where slug = 'finance'), 'single-column', 'intern', 'navy',
  false, true, '{en}', '{docx,pdf}', 1,
  'free-commercial', 'Overleaf', 'Overleaf 社区', 'https://www.overleaf.com/latex/templates/tagged/cv', 'https://www.overleaf.com/latex/templates/tagged/cv',
  'generated', 'published', false,
  3126, 521, 57, now() - make_interval(days => 162)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'accounting-cv', '会计 / 审计简历', '证书栏（CPA / ACCA）前置，项目经历按年审周期组织。', (select id from public.categories where slug = 'finance'), 'two-column', 'mid', 'green',
  true, true, '{zh}', '{docx}', 2,
  'free-personal', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', false,
  2766, 922, 111, now() - make_interval(days => 71)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'campus-fresh-graduate', '应届生一页纸简历', '教育背景置顶、实习与校园经历为主，控制在 A4 一页。', (select id from public.categories where slug = 'campus'), 'single-column', 'fresh-grad', 'blue',
  true, true, '{zh}', '{docx,pdf}', 1,
  'free-commercial', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', true,
  2412, 603, 54, now() - make_interval(days => 12)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'internship-application-cv', '实习申请简历', '课程、竞赛与实验室经历为主，给实习岗留出可迁移技能栏。', (select id from public.categories where slug = 'campus'), 'sidebar', 'intern', 'warm-orange',
  false, true, '{zh}', '{docx}', 1,
  'free-personal', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', false,
  2150, 430, 69, now() - make_interval(days => 131)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'undergraduate-research-cv', '本科生科研简历', '论文、专利与实验技能前置，适合申请暑研与直博。', (select id from public.categories where slug = 'academic'), 'single-column', 'campus', 'navy',
  false, true, '{en,zh}', '{tex,pdf}', 2,
  'oss', 'Overleaf', 'Overleaf 社区', 'https://www.overleaf.com/latex/templates/tagged/cv', 'https://www.overleaf.com/latex/templates/tagged/cv',
  'generated', 'published', false,
  4032, 576, 127, now() - make_interval(days => 69)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'executive-cv', '高管 / 总监简历', '战略与组织层面的叙述，弱化技能罗列，突出业务规模与团队。', (select id from public.categories where slug = 'management'), 'single-column', 'executive', 'wine',
  false, true, '{zh,en}', '{docx,pdf}', 2,
  'free-commercial', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', false,
  2328, 291, 49, now() - make_interval(days => 132)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'career-changer-cv', '跨行转岗简历', '功能型简历：按能力模块组织，弱化行业时间线。', (select id from public.categories where slug = 'general'), 'single-column', 'career-changer', 'green',
  false, true, '{zh}', '{docx,pdf}', 1,
  'free-personal', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', false,
  4990, 998, 80, now() - make_interval(days => 119)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'timeline-cv', '时间轴型简历', '用时间轴串起经历，成长路径一眼可读，适合非技术岗。', (select id from public.categories where slug = 'general'), 'timeline', 'mid', 'blue',
  false, false, '{zh,en}', '{fig,pdf}', 2,
  'free-personal', 'Figma Community', 'Figma 社区作者', 'https://www.figma.com/community/search?type=files&q=resume', 'https://www.figma.com/community/search?type=files&q=resume',
  'generated', 'published', true,
  1420, 284, 28, now() - make_interval(days => 185)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'minimal-typography-cv', '极简排版简历', '只用字形与留白建立层级，无框线无图标，打印与屏幕都干净。', (select id from public.categories where slug = 'general'), 'minimal', 'general', 'mono',
  false, true, '{zh,en}', '{docx,pdf}', 1,
  'free-commercial', 'Overleaf', 'Overleaf 社区', 'https://www.overleaf.com/latex/templates/tagged/cv', 'https://www.overleaf.com/latex/templates/tagged/cv',
  'generated', 'published', false,
  3600, 720, 187, now() - make_interval(days => 13)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'dark-theme-cv', '深色主题简历', '深底浅字的创意简历，适合投递设计工作室与新媒体岗。', (select id from public.categories where slug = 'design'), 'two-column', 'junior', 'dark',
  true, false, '{en}', '{psd,pdf}', 1,
  'free-personal', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', false,
  872, 109, 21, now() - make_interval(days => 138)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'morandi-tone-cv', '莫兰迪配色简历', '低饱和配色，柔和不抢内容，适合教育与心理咨询类岗位。', (select id from public.categories where slug = 'general'), 'sidebar', 'mid', 'morandi',
  true, false, '{zh}', '{docx,pdf}', 2,
  'free-personal', 'Canva', 'Canva', 'https://www.canva.com/templates/resumes/', 'https://www.canva.com/templates/resumes/',
  'generated', 'published', false,
  2870, 574, 138, now() - make_interval(days => 35)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'bilingual-cv', '中英双语简历', '一套版式中英对照，投外企与出海团队时省去两份维护成本。', (select id from public.categories where slug = 'general'), 'single-column', 'mid', 'blue',
  false, true, '{zh,en}', '{docx,pdf}', 2,
  'free-commercial', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', true,
  2380, 340, 34, now() - make_interval(days => 61)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'japanese-resume-rireki', '日文履歴書', '日本求职标准的履歴書格式，含照片与学历栏，JIS 规格。', (select id from public.categories where slug = 'general'), 'single-column', 'junior', 'mono',
  true, false, '{ja}', '{docx,pdf}', 2,
  'free-personal', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', false,
  984, 123, 11, now() - make_interval(days => 52)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'german-lebenslauf', '德文 Lebenslauf', '德国求职常用格式，签名与照片位在页脚，时间线严格倒序。', (select id from public.categories where slug = 'general'), 'sidebar', 'mid', 'mono',
  true, true, '{de}', '{docx,pdf}', 2,
  'free-personal', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', false,
  3882, 647, 84, now() - make_interval(days => 36)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'markdown-resume', 'Markdown 简历', '用 Markdown 写、用工具转 PDF，版本管理友好，程序员最爱。', (select id from public.categories where slug = 'tech'), 'single-column', 'mid', 'mono',
  false, true, '{en,zh}', '{md,pdf,html}', 1,
  'oss', 'JSON Resume', 'JSON Resume 社区', 'https://jsonresume.org/', 'https://jsonresume.org/themes/',
  'generated', 'published', false,
  3560, 712, 128, now() - make_interval(days => 121)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'photoshop-resume-kit', 'PSD 简历素材包', '含 A4 与 Letter 两种尺寸的分层 PSD，改配色只需换图层。', (select id from public.categories where slug = 'design'), 'two-column', 'mid', 'colorful',
  true, false, '{en}', '{psd}', 1,
  'free-personal', 'Figma Community', 'Figma 社区作者', 'https://www.figma.com/community/search?type=files&q=resume', 'https://www.figma.com/community/search?type=files&q=resume',
  'generated', 'published', false,
  4256, 608, 85, now() - make_interval(days => 17)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'illustrator-resume-kit', 'AI 矢量简历素材', '矢量可无限放大，字体与色彩全局替换，适合印刷投递。', (select id from public.categories where slug = 'design'), 'infographic', 'senior', 'morandi',
  true, false, '{en}', '{ai,pdf}', 2,
  'free-personal', 'Figma Community', 'Figma 社区作者', 'https://www.figma.com/community/search?type=files&q=resume', 'https://www.figma.com/community/search?type=files&q=resume',
  'generated', 'published', false,
  1188, 297, 80, now() - make_interval(days => 98)
)
on conflict (slug) do nothing;
insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  'one-page-clean-cv', '干净一页纸（通用）', '最不出错的版本：单栏、无图形、字号克制，适合批量投递。', (select id from public.categories where slug = 'general'), 'single-column', 'general', 'mono',
  false, true, '{zh,en}', '{docx,pdf}', 1,
  'free-commercial', 'Microsoft Create', 'Microsoft', 'https://create.microsoft.com/en-us/search?query=resume', 'https://create.microsoft.com/en-us/search?query=resume',
  'generated', 'published', true,
  5214, 869, 165, now() - make_interval(days => 62)
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 模板 × 标签
-- ---------------------------------------------------------------------------
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'awesome-cv-latex' and g.slug in ('ats-friendly', 'open-source', 'latex', 'editable-source', 'two-page')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'sb2nov-resume' and g.slug in ('ats-friendly', 'open-source', 'latex', 'skill-bar', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'jakegut-resume' and g.slug in ('ats-friendly', 'open-source', 'latex', 'one-page', 'minimalist', 'no-photo')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'mcdowell-cv' and g.slug in ('ats-friendly', 'open-source', 'latex', 'one-page', 'print-ready')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'deedy-resume' and g.slug in ('open-source', 'latex', 'with-photo', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'jsonresume-standard' and g.slug in ('open-source', 'ats-friendly', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'reactive-resume' and g.slug in ('open-source', 'ats-friendly', 'multilingual', 'cover-letter')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'resume-github-io' and g.slug in ('open-source', 'project-section', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'overleaf-cv-gallery' and g.slug in ('latex', 'editable-source', 'print-ready')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'latextemplates-curricula' and g.slug in ('latex', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'canva-resume-templates' and g.slug in ('with-photo', 'multilingual', 'creative')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'microsoft-create-resume' and g.slug in ('ats-friendly', 'with-photo', 'multilingual', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'figma-community-resume' and g.slug in ('with-photo', 'creative', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'notion-resume-gallery' and g.slug in ('ats-friendly', 'multilingual', 'minimalist')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'zety-resume-templates' and g.slug in ('ats-friendly', 'cover-letter', 'print-ready')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'novoresume-templates' and g.slug in ('ats-friendly', 'one-page', 'cover-letter')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'flowcv-templates' and g.slug in ('ats-friendly', 'multilingual', 'one-page')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'kickresume-templates' and g.slug in ('with-photo', 'creative', 'cover-letter')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'standard-resume' and g.slug in ('ats-friendly', 'minimalist', 'one-page')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'resume-io-templates' and g.slug in ('ats-friendly', 'with-photo', 'multilingual')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'moderncv-latex' and g.slug in ('latex', 'multilingual', 'with-photo', 'open-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'friggeri-cv' and g.slug in ('open-source', 'latex', 'minimalist', 'with-photo')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'academic-cv-latex' and g.slug in ('latex', 'open-source', 'two-page', 'print-ready')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'cv-two-page-europass' and g.slug in ('multilingual', 'with-photo', 'ats-friendly')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'tech-two-column-ats' and g.slug in ('ats-friendly', 'skill-bar', 'two-page', 'project-section')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'frontend-portfolio-cv' and g.slug in ('project-section', 'with-photo', 'creative')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'product-manager-cv' and g.slug in ('project-section', 'ats-friendly', 'two-page')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'operations-growth-cv' and g.slug in ('ats-friendly', 'one-page', 'multilingual')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'ux-designer-cv' and g.slug in ('with-photo', 'project-section', 'creative', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'graphic-designer-infographic' and g.slug in ('creative', 'skill-bar', 'with-photo')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'finance-analyst-cv' and g.slug in ('ats-friendly', 'one-page', 'no-photo', 'print-ready')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'investment-banking-cv' and g.slug in ('ats-friendly', 'one-page', 'minimalist', 'no-photo')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'accounting-cv' and g.slug in ('with-photo', 'two-page', 'multilingual')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'campus-fresh-graduate' and g.slug in ('one-page', 'with-photo', 'ats-friendly', 'print-ready')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'internship-application-cv' and g.slug in ('one-page', 'ats-friendly', 'skill-bar')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'undergraduate-research-cv' and g.slug in ('latex', 'two-page', 'print-ready', 'multilingual')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'executive-cv' and g.slug in ('two-page', 'multilingual', 'ats-friendly')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'career-changer-cv' and g.slug in ('ats-friendly', 'one-page', 'skill-bar')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'timeline-cv' and g.slug in ('creative', 'two-page', 'project-section')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'minimal-typography-cv' and g.slug in ('minimalist', 'one-page', 'print-ready', 'ats-friendly')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'dark-theme-cv' and g.slug in ('creative', 'with-photo', 'one-page')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'morandi-tone-cv' and g.slug in ('with-photo', 'two-page', 'skill-bar')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'bilingual-cv' and g.slug in ('multilingual', 'two-page', 'ats-friendly')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'japanese-resume-rireki' and g.slug in ('with-photo', 'two-page', 'print-ready')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'german-lebenslauf' and g.slug in ('with-photo', 'two-page', 'multilingual')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'markdown-resume' and g.slug in ('open-source', 'one-page', 'ats-friendly', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'photoshop-resume-kit' and g.slug in ('creative', 'with-photo', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'illustrator-resume-kit' and g.slug in ('creative', 'print-ready', 'editable-source')
on conflict do nothing;
insert into public.template_tags (template_id, tag_id)
select t.id, g.id from public.templates t, public.tags g
where t.slug = 'one-page-clean-cv' and g.slug in ('one-page', 'ats-friendly', 'minimalist', 'print-ready')
on conflict do nothing;

commit;

-- 校验
select
  (select count(*) from public.templates) as templates,
  (select count(*) from public.categories) as categories,
  (select count(*) from public.tags) as tags,
  (select count(*) from public.template_tags) as template_tags;

