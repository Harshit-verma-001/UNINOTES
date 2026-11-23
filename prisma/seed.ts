import "dotenv/config"
import { prisma } from "../lib/db"

async function main() {
  const depts = [
    { slug: "bca", name: "BCA", fullName: "Bachelor of Computer Applications", description: "Computer science fundamentals, programming, and software development" },
    { slug: "bba", name: "BBA", fullName: "Bachelor of Business Administration", description: "Business management, marketing, finance, and entrepreneurship" },
    { slug: "btech", name: "BTech", fullName: "Bachelor of Technology", description: "Engineering principles, technical skills, and innovation" },
    { slug: "ba", name: "BA", fullName: "Bachelor of Arts", description: "Humanities, social sciences, languages, and liberal arts" },
  ]

  for (const d of depts) {
    await prisma.department.upsert({
      where: { slug: d.slug },
      create: d,
      update: d,
    })
  }

  console.log("Seeded departments.")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
