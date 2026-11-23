# UNINOTES

UNINOTES is a college notes-sharing app built with Next.js, TypeScript, Prisma, PostgreSQL, and Supabase Storage.

- Students can browse and search approved notes, submit documents, download notes, and leave ratings and comments.
- Teachers use the host dashboard to review submissions in their department.
- Admins can moderate submissions across departments.

## Run locally

1. Install Node.js 24 and run `npm ci`.
2. Copy `.env.example` to `.env` and configure PostgreSQL, the JWT secret, and Supabase Storage.
3. For a fresh database, run `npm run db:push` and `npm run db:seed`. Run [the Supabase access SQL](prisma/restrict-supabase-api.sql) after creating the tables, and create a private Storage bucket named `notes`.
4. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

For production setup and a pre-launch check, see the [deployment guide](docs/deployment.md).

## Repository layout

| Path | Contents |
| --- | --- |
| `app/` | Pages, layouts, and API routes |
| `components/` | Shared UI, landing page, browse, and dashboard components |
| `contexts/`, `hooks/`, `lib/` | Session state, shared hooks, API client, and server utilities |
| `prisma/` | Database schema, department seed, and Supabase access SQL |
| `public/`, `styles/` | Static assets and styles |
| `docs/` | Deployment instructions |

Keep local environment files, database backups, and export archives out of Git.
