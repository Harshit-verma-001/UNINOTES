import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [submitted, approved, totalDownloads, ratingsData] = await Promise.all([
    prisma.note.count({ where: { contributorId: user.id } }),
    prisma.note.count({ where: { contributorId: user.id, status: "approved" } }),
    prisma.note.aggregate({
      where: { contributorId: user.id },
      _sum: { downloadCount: true },
    }),
    prisma.rating.aggregate({
      where: { note: { contributorId: user.id } },
      _avg: { value: true },
    }),
  ])

  return NextResponse.json({
    notesSubmitted: submitted,
    notesApproved: approved,
    totalDownloads: totalDownloads._sum.downloadCount ?? 0,
    avgRating: ratingsData._avg.value ? Math.round(ratingsData._avg.value * 10) / 10 : 0,
  })
}
