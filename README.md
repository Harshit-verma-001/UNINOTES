# 🎓 UNINOTES

> A modern, role-based academic notes-sharing and peer-learning platform built for university students and faculty.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)

---

## 📖 Overview

**UNINOTES** streamlines academic material exchange across university departments. Students can upload, discover, download, and rate lecture notes organized by department, academic year, section, and subject. A faculty-led review pipeline ensures academic integrity by verifying all uploaded materials before they become publicly accessible.

---

## ✨ Features

### 🧑‍🎓 For Students
- **Smart Filtering & Discovery**: Filter notes by department (BCA, BBA, BTech, BA), year (1–4), section (A–D), and subject.
- **Preview & Download**: In-browser preview and one-click note downloads.
- **Engagement & Feedback**: Rate notes on a 1–5 scale and post feedback comments.
- **Upload Pipeline**: Upload documents with subject metadata, course tags, and file attachments.
- **Contributor Dashboard**: Track uploaded notes, approval statuses (Pending, Approved, Rejected), download counts, and average ratings.
- **Leaderboard**: Campus-wide leaderboard celebrating top note contributors.

### 👨‍🏫 For Hosts & Department Heads
- **Host Review Panel (`/host`)**: Dedicated moderation interface for faculty.
- **Department Scoping**: Hosts can only review and moderate notes submitted within their assigned department.
- **One-Click Approval / Rejection**: Approve verified notes or reject low-quality submissions with explanatory feedback.

### 🛡️ Core & System
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for `student`, `host`, and `admin` roles.
- **Secure Authentication**: Stateless JWT session tokens stored in secure `httpOnly` cookies (`jose` + `bcryptjs`).
- **Cloud Storage**: File upload pipeline powered by Supabase Storage.
- **Modern UI/UX**: Built with Tailwind CSS v4, Radix UI components, dark/light mode toggle (`next-themes`), and toast notifications (`sonner`).

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, API Routes) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Frontend** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM 7](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| **Storage** | [Supabase Storage](https://supabase.com/storage) |
| **Auth** | Stateless JWT (`jose`) in `httpOnly` Cookies + `bcryptjs` password hashing |
| **Analytics & Charts** | [Recharts](https://recharts.org/) |

---

## 🗄️ Database Schema Summary

- **`User`**: Accounts with credentials, role (`student` | `host` | `admin`), and department assignment.
- **`Department`**: Academic branches (`bca`, `bba`, `btech`, `ba`).
- **`Note`**: Material records linked to contributor, department, year, section, subject, status (`pending`, `approved`, `rejected`), download metrics, and ratings.
- **`Rating`**: 1–5 star ratings per user per note.
- **`Comment`**: Community feedback on notes.
- **`Download`**: Audit trail of note downloads.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm** or **pnpm**
- A running **PostgreSQL** instance (e.g. Supabase, Neon, or local PostgreSQL)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshit-verma-001/UNINOTES-1.git
   cd UNINOTES-1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # PostgreSQL Connection (Pooled for runtime queries)
   DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true"

   # Direct PostgreSQL Connection (Used by Prisma for migrations and schema push)
   DIRECT_URL="postgresql://user:password@host:5432/dbname"

   # Supabase Storage Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # JWT Secret (Use a secure random 32+ character string)
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   ```

4. **Initialize Database Schema:**
   Push the schema to your database:
   ```bash
   npm run db:push
   ```

5. **Seed Initial Data:**
   Populate departments and demo accounts:
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Default Demo Credentials

After running `npm run db:seed`, the following accounts are available for testing:

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@uninotes.edu` | `password123` | Full system access |
| **Host (Faculty)** | `host@uninotes.edu` | `password123` | BCA Department review & approvals |
| **Student** | `student@uninotes.edu` | `password123` | Student note browsing, uploads & ratings |

---

## 📡 API Reference

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & set JWT cookie |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current session profile |
| `/api/auth/logout` | `POST` | Authenticated | Clear session cookie |
| `/api/departments` | `GET` | Public | List all departments with note metrics |
| `/api/notes` | `GET` | Public | Filter notes by department, year, subject |
| `/api/notes` | `POST` | Student+ | Submit note for approval |
| `/api/upload` | `POST` | Student+ | Upload file attachment |
| `/api/notes/[id]` | `GET` | Public | Get note details and download link |
| `/api/notes/[id]/download` | `POST` | Authenticated | Record note download |
| `/api/notes/[id]/rate` | `POST` | Authenticated | Submit or update 1–5 star rating |
| `/api/notes/[id]/comments` | `GET/POST` | Authenticated | Fetch or submit note comments |
| `/api/notes/[id]/approve` | `POST` | Host / Admin | Approve pending note |
| `/api/notes/[id]/reject` | `POST` | Host / Admin | Reject note with feedback |
| `/api/host/pending-notes` | `GET` | Host / Admin | List department notes awaiting review |
| `/api/dashboard/stats` | `GET` | Authenticated | User submission metrics & ratings |
| `/api/leaderboard` | `GET` | Public | Top contributors list |

---

## 📁 Project Structure

```text
├── app/
│   ├── api/                 # Next.js API route handlers (Auth, Notes, Host, Reviews)
│   ├── browse/              # Filterable note catalog page
│   ├── dashboard/           # User statistics & submission management
│   ├── host/                # Faculty/Host approval dashboard
│   ├── leaderboard/         # Contributor leaderboard
│   ├── login/ & signup/     # Authentication flows
│   ├── notes/               # Note viewing & upload interfaces
│   ├── globals.css          # Tailwind CSS v4 design tokens & theme setup
│   └── layout.tsx           # Global root layout and navigation wrapper
├── components/              # Reusable UI primitives and complex domain widgets
├── contexts/                # Client-side state contexts (AuthContext, ThemeContext)
├── hooks/                   # Custom React hooks
├── lib/
│   ├── auth.ts              # JWT signing, verification & RBAC middleware guards
│   └── db.ts                # Prisma client singleton with pg pool adapter
├── prisma/
│   ├── schema.prisma        # Database schema definitions
│   └── seed.ts              # Database seeding script
├── public/                  # Static assets & illustrations
└── BACKEND.md               # Backend API and configuration notes
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js local development server.
- `npm run build`: Generates Prisma client types and compiles the production Next.js build.
- `npm run start`: Runs the built Next.js application in production mode.
- `npm run lint`: Runs ESLint code style and syntax checks.
- `npm run db:generate`: Regenerates the Prisma Client.
- `npm run db:push`: Pushes schema changes directly to PostgreSQL.
- `npm run db:seed`: Seeds the database with departments and test users.
- `npm run db:studio`: Opens Prisma Studio web GUI to browse and inspect database tables.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
