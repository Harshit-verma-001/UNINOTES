import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { resolveNoteFile } from "@/lib/note-files"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const note = await prisma.note.findUnique({
    where: { id },
    select: { fileUrl: true, status: true, departmentId: true },
  })
  const canReview = user.role === "admin" || (user.role === "host" && user.departmentId === note?.departmentId)
  if (!note || (note.status !== "approved" && !canReview)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  try {
    const destination = await resolveNoteFile(note.fileUrl)
    if (!destination) return NextResponse.json({ error: "File not found" }, { status: 404 })
    return NextResponse.redirect(destination, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Unable to resolve note file", error)
    return NextResponse.json({ error: "File unavailable" }, { status: 502 })
  }
}
