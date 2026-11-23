import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DepartmentGrid } from "@/components/browse/department-grid"

import { NotesList } from "@/components/browse/notes-list"

export default async function BrowsePage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const { search } = await searchParams
  const query = (Array.isArray(search) ? search[0] : search)?.trim()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Browse Notes</h1>
            <p className="mt-2 text-muted-foreground">
              {query ? <>Search results for <strong>{query}</strong></> : "Select a department to start exploring study notes"}
            </p>
          </div>
          {query ? <NotesList key={query} search={query} /> : <DepartmentGrid />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
