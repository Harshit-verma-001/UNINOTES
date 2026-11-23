import { createClient } from "@supabase/supabase-js"

export const NOTES_BUCKET = "notes"
export const uploadKeyPattern = /^upload:([a-z0-9]+)\/([0-9a-f-]{36}\.(?:pdf|docx?|pptx?))$/

export function externalNoteUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

function legacyStoragePath(url: URL) {
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const prefix = "/storage/v1/object/public/notes/"
  if (!storageUrl || url.origin !== new URL(storageUrl).origin || !url.pathname.startsWith(prefix)) {
    return null
  }
  return url.pathname.slice(prefix.length)
}

export function submittedExternalNoteUrl(value: string | null) {
  const url = externalNoteUrl(value)
  return url && !legacyStoragePath(new URL(url)) ? url : null
}

export function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing storage configuration")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function noteFilePath(id: string, value: string | null) {
  if (value && (uploadKeyPattern.test(value) || externalNoteUrl(value))) {
    return `/api/notes/${encodeURIComponent(id)}/file`
  }
  return null
}

export async function resolveNoteFile(value: string | null) {
  const upload = value?.match(uploadKeyPattern)
  let key = upload ? `${upload[1]}/${upload[2]}` : null
  const external = externalNoteUrl(value)
  if (!key && external) {
    const path = legacyStoragePath(new URL(external))
    if (path) key = decodeURIComponent(path)
  }
  if (!key) return external

  const { data, error } = await storageClient().storage.from(NOTES_BUCKET)
    .createSignedUrl(key, 60, { download: true })
  if (error) throw error
  return data.signedUrl
}
