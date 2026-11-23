import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { NOTES_BUCKET, storageClient } from "@/lib/note-files"

const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024
const signatures = new Map([
  ["pdf", "255044462d"],
  ["doc", "d0cf11e0a1b11ae1"],
  ["ppt", "d0cf11e0a1b11ae1"],
  ["docx", "504b0304"],
  ["pptx", "504b0304"],
])

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.toLowerCase().startsWith("multipart/form-data;") || !request.body) {
      return NextResponse.json({ error: "Expected a multipart upload." }, { status: 400 })
    }

    const reader = request.body.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BODY_BYTES) {
        await reader.cancel()
        return NextResponse.json({ error: "File exceeds the 10 MB limit." }, { status: 413 })
      }
      chunks.push(value)
    }

    const form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": contentType },
    }).formData().catch(() => null)
    const file = form?.get("file")
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Select a document to upload." }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File exceeds the 10 MB limit." }, { status: 413 })
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
    const signature = signatures.get(extension)
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!signature || !buffer.subarray(0, signature.length / 2).equals(Buffer.from(signature, "hex"))) {
      return NextResponse.json({ error: "Upload a PDF, DOC, DOCX, PPT or PPTX document." }, { status: 415 })
    }

    const storage = storageClient().storage
    const bucket = await storage.getBucket(NOTES_BUCKET)
    if (bucket.error) throw bucket.error
    if (bucket.data.public) throw new Error("The notes bucket must be private")

    const key = `${user.id}/${randomUUID()}.${extension}`
    const { error } = await storage.from(NOTES_BUCKET)
      .upload(key, buffer, { contentType: "application/octet-stream", upsert: false })
    if (error) throw error

    return NextResponse.json({ url: `upload:${key}` })
  } catch (error) {
    console.error("Upload failed", error)
    return NextResponse.json({ error: "Upload failed." }, { status: 500 })
  }
}
