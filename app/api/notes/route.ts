import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { submittedExternalNoteUrl, uploadKeyPattern } from "@/lib/note-files"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

const createNoteSchema = z.object({
  title: z.string().trim().max(200).min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().trim().max(4000).min(10, { message: "Description must be at least 10 characters." }),
  department: z.string().trim().max(80).min(1, { message: "Please select a department." }),
  year: z.number().int().min(1).max(4),
  section: z.string().trim().max(20).min(1, { message: "Please select a section." }),
  subject: z.string().trim().max(150).min(1, { message: "Subject is required." }),
  fileUrl: z.string().max(2048).nullish(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get("department")
    const year = searchParams.get("year")
    const section = searchParams.get("section")
    const subject = searchParams.get("subject")?.trim()
    const search = searchParams.get("search")?.trim()
    const popular = searchParams.get("sort") === "popular"
    if (search && search.length > 150) return NextResponse.json({ error: "Search must be at most 150 characters" }, { status: 400 })

    const where: Prisma.NoteWhereInput = { status: "approved" }

    if (department) {
      const dept = await prisma.department.findUnique({ where: { slug: department } })
      if (!dept) return NextResponse.json([])
      where.departmentId = dept.id
    }
    if (year && !/^[1-4]$/.test(year)) return NextResponse.json({ error: "Invalid year" }, { status: 400 })
    if (year) where.year = Number(year)
    if (section) where.section = section
    if (subject) {
      where.OR = [{ subjectSlug: subject }, { subject: { equals: subject, mode: "insensitive" } }]
    }
    if (search) {
      const contains = { contains: search.replace(/[\\%_]/g, "\\$&"), mode: "insensitive" as const }
      where.AND = [{ OR: [{ title: contains }, { subject: contains }, { description: contains }] }]
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        contributor: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } },
        department: { select: { slug: true } }
      },
      orderBy: popular ? [{ downloadCount: "desc" }, { createdAt: "desc" }] : { createdAt: "desc" },
      take: popular ? 6 : undefined,
    })

    return NextResponse.json(notes.map(note => ({
      id: note.id,
      title: note.title,
      description: note.description,
      subject: note.subject,
      subjectSlug: note.subjectSlug,
      department: note.department.slug,
      year: note.year,
      section: note.section,
      contributor: note.contributor ? `${note.contributor.firstName} ${note.contributor.lastName}` : null,
      host: note.approver ? `${note.approver.firstName} ${note.approver.lastName}` : null,
      downloads: note.downloadCount,
      rating: note.averageRating,
      reviews: note.reviewCount,
      uploadedAt: note.createdAt.toISOString()
    })))
  } catch (error) {
    console.error("Notes GET error:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit notes." }, { status: 401 })
    }
    if (user.role !== "student" && user.role !== "host" && user.role !== "admin") {
      return NextResponse.json({ error: "Only students and hosts can submit notes" }, { status: 403 })
    }

    const body = await request.json()
    const data = createNoteSchema.parse(body)

    const upload = data.fileUrl?.match(uploadKeyPattern)
    const fileUrl = upload?.[1] === user.id ? data.fileUrl : submittedExternalNoteUrl(data.fileUrl ?? null)
    if (data.fileUrl && !fileUrl) {
      return NextResponse.json({ error: "Provide an HTTPS link or upload your own document." }, { status: 400 })
    }

    const department = await prisma.department.findUnique({
      where: { slug: data.department },
    })

    if (!department) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        title: data.title,
        description: data.description,
        departmentId: department.id,
        year: data.year,
        section: data.section,
        subject: data.subject,
        subjectSlug: data.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        fileUrl: fileUrl ?? null,
        contributorId: user.id,
        status: user.role === "admin" ? "approved" : "pending",
        approvedById: user.role === "admin" ? user.id : null,
      },
    })

    return NextResponse.json({ id: note.id, title: note.title, status: note.status, createdAt: note.createdAt }, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((e) => e.message).join(", ") }, { status: 400 })
    }
    console.error("Note creation error:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
