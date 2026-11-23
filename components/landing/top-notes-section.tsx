"use client"

import { useEffect, useState } from "react"
import { api, type NoteListItem } from "@/lib/api"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Star, FileText, ArrowRight } from "lucide-react"

export function TopNotesSection() {
  const [topNotes, setTopNotes] = useState<NoteListItem[]>([])
  useEffect(() => {
    api.notes.list({ sort: "popular" }).then(setTopNotes).catch(() => setTopNotes([]))
  }, [])

  if (topNotes.length === 0) return null
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Popular Notes
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Approved notes ranked by downloads
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/browse">
              View All Notes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{note.department.toUpperCase()}</Badge>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {note.subject}
                  </p>

                  <p className="mt-3 text-sm text-muted-foreground">
                    by <span className="font-medium text-foreground">{note.contributor}</span>
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="h-4 w-4" />
                      <span>{note.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">{note.rating ?? "Unrated"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/browse">
              View All Notes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
