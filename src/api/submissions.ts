import { isDemoMode, supabase } from '@/lib/supabase'
import type { Submission } from '@/lib/types'

export interface SubmissionDraft {
  title: string
  source_name: string
  source_author?: string
  source_url: string
  download_url: string
  category_slug?: string
  file_formats: string[]
  layout?: string
  license_type: string
  license_note?: string
  note?: string
}

const DEMO_KEY = 'rd:demo-submissions'

function readDemo(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]') as Submission[]
  } catch {
    return []
  }
}

function writeDemo(list: Submission[]): void {
  localStorage.setItem(DEMO_KEY, JSON.stringify(list))
}

export async function createSubmission(draft: SubmissionDraft): Promise<void> {
  if (isDemoMode) {
    const list = readDemo()
    list.unshift({
      id: `demo-${Date.now()}`,
      submitted_by: null,
      title: draft.title,
      source_url: draft.source_url,
      download_url: draft.download_url,
      source_name: draft.source_name,
      source_author: draft.source_author ?? null,
      category_slug: draft.category_slug ?? null,
      file_formats: draft.file_formats,
      layout: (draft.layout as Submission['layout']) ?? null,
      note: draft.note ?? null,
      status: 'pending',
      review_note: null,
      created_at: new Date().toISOString(),
    })
    writeDemo(list)
    return
  }

  const { error } = await supabase!.from('submissions').insert({
    title: draft.title,
    source_name: draft.source_name,
    source_author: draft.source_author || null,
    source_url: draft.source_url,
    download_url: draft.download_url,
    category_slug: draft.category_slug || null,
    file_formats: draft.file_formats,
    layout: draft.layout || null,
    license_type: draft.license_type,
    license_note: draft.license_note || null,
    note: draft.note || null,
  })
  if (error) throw new Error(error.message)
}

export async function listMySubmissions(): Promise<Submission[]> {
  if (isDemoMode) return readDemo()

  const { data, error } = await supabase!
    .from('submissions')
    .select('id, submitted_by, title, source_url, download_url, source_name, source_author, category_slug, file_formats, layout, note, status, review_note, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Submission[]
}

export async function deleteSubmission(id: string): Promise<void> {
  if (isDemoMode) {
    writeDemo(readDemo().filter((s) => s.id !== id))
    return
  }
  const { error } = await supabase!.from('submissions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** 管理员：待审核列表 */
export async function listPendingSubmissions(): Promise<Submission[]> {
  if (isDemoMode) return readDemo().filter((s) => s.status === 'pending')

  const { data, error } = await supabase!
    .from('submissions')
    .select('id, submitted_by, title, source_url, download_url, source_name, source_author, category_slug, file_formats, layout, note, status, review_note, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Submission[]
}

export async function reviewSubmission(id: string, status: 'approved' | 'rejected', reviewNote?: string): Promise<void> {
  if (isDemoMode) {
    writeDemo(readDemo().map((s) => (s.id === id ? { ...s, status, review_note: reviewNote ?? null } : s)))
    return
  }
  const { error } = await supabase!
    .from('submissions')
    .update({ status, review_note: reviewNote ?? null })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
