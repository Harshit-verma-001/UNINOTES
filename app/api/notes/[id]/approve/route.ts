import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["host", "admin"])
    const { id: noteId } = await params

    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // A host can only approve notes in their own department
    if (user.role === "host" && user.departmentId !== note.departmentId) {
      return NextResponse.json({ error: "You can only approve notes in your department." }, { status: 403 })
    }

    const result = await prisma.note.updateMany({
      where: { id: noteId, status: "pending" },
      data: {
        status: "approved",
        approvedById: user.id,
      },
    })

    if (!result.count) return NextResponse.json({ error: "Note has already been reviewed" }, { status: 409 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Response) return err // Re-throw auth errors
    console.error(err)
    return NextResponse.json({ error: "Failed to approve note" }, { status: 500 })
  }
}