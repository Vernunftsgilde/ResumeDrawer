import { isDemoMode, supabase } from '@/lib/supabase'
import type { ContactType } from '@/lib/types'

export interface ContactDraft {
  type: ContactType
  email?: string
  subject?: string
  body: string
  target_slug?: string
}

export async function sendContactMessage(draft: ContactDraft): Promise<void> {
  if (isDemoMode) {
    // 演示模式下没有云端落库，只做一次本地记录，避免用户以为提交成功却查不到
    const key = 'rd:demo-contacts'
    const list = JSON.parse(localStorage.getItem(key) ?? '[]') as ContactDraft[]
    list.unshift({ ...draft, subject: draft.subject ?? new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(list.slice(0, 20)))
    return
  }

  const { error } = await supabase!.from('contact_messages').insert({
    type: draft.type,
    email: draft.email || null,
    subject: draft.subject || null,
    body: draft.body,
    target_slug: draft.target_slug || null,
    user_id: (await supabase!.auth.getUser()).data.user?.id ?? null,
  })
  if (error) throw new Error(error.message)
}
