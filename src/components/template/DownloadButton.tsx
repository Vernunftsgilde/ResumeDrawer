import { Download, ExternalLink } from 'lucide-react'
import { recordDownload } from '@/api/templates'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { Template } from '@/lib/types'

/**
 * 外链下载按钮。站点不托管任何模板文件，点这里会跳到原作者的页面。
 * 这是本站的版权边界，不要改成"站内下载"。
 */
export function DownloadButton({
  template,
  size = 'lg',
  className,
}: {
  template: Template
  size?: 'md' | 'lg'
  className?: string
}) {
  return (
    <a
      href={template.download_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={() => void recordDownload(template.slug)}
      className={cn(buttonVariants({ variant: 'primary', size }), className)}
    >
      <Download />
      去原站下载
      <ExternalLink className="!size-3.5 opacity-70" />
    </a>
  )
}

/** 卡片上的轻量下载入口 */
export function DownloadIconButton({ template }: { template: Template }) {
  return (
    <a
      href={template.download_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => {
        e.stopPropagation()
        void recordDownload(template.slug)
      }}
      title="去原站下载"
      aria-label="去原站下载"
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'shrink-0')}
    >
      <Download />
    </a>
  )
}
