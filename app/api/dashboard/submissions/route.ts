import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notes = await prisma.note.findMany({
    where: { contributorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const list = notes.map((n) => ({
    id: n.id,
    title: n.title,
    status: n.status,
    rejectionReason: n.rejectionReason,
    submittedAt: n.createdAt,
  }))

  return NextResponse.json(list)
}
