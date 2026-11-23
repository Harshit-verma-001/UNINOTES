import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { noteFilePath } from "@/lib/note-files"

export async function GET() {
  try {
    const user = await requireRole(["host", "admin"])
    if (user.role === "host" && !user.departmentId) return NextResponse.json([])

    const notes = await prisma.note.findMany({
      where: { status: "pending", departmentId: user.role === "host" ? user.departmentId! : undefined },
      select: {
        id: true, title: true, description: true, subject: true, fileUrl: true, createdAt: true,
        contributor: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(notes.map(note => ({ ...note, fileUrl: noteFilePath(note.id, note.fileUrl) })))
  } catch (error) {
    if (error instanceof Response) return error
    console.error("Unable to list pending notes", error)
    return NextResponse.json({ error: "Failed to load pending notes" }, { status: 500 })
  }
}
