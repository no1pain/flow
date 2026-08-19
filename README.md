# Flow

A modern development platform that streamlines your team's workflow — from project planning and task management to documentation, analytics, and time tracking.

**Live demo:** [https://flow-blond-sigma.vercel.app/](https://flow-blond-sigma.vercel.app/)

## ✨ Features

### 🏢 Workspaces
- Create and manage multiple workspaces for different teams or organizations
- Invite members via email with role-based access (`OWNER`, `ADMIN`, `MEMBER`, `GUEST`)
- Track invitation statuses (`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`)
- Manage workspace members and their roles

### 📁 Projects
- Organize work into projects within your workspace
- Add members to projects with granular role control
- Track project status (`ACTIVE` / `ARCHIVED`)
- View project progress and member counts at a glance

### ✅ Tasks
- **Kanban board** with drag-and-drop (powered by dnd-kit) across `TODO`, `IN_PROGRESS`, and `DONE` columns
- Task priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- Assign tasks to team members
- Filter by status, priority, and assignee
- **Comments** with real-time updates and **@mentions**
- **Activity feed** tracking every task change
- Reorder tasks with custom positioning logic
- Keyboard-accessible drag-and-drop

### 📝 Documents
- Rich text editor powered by **TipTap** (headings, lists, links, formatting)
- Organize documents into nested folders
- Share documents with team members or make them public
- Full-text search across documents

### 📊 Analytics
- Task distribution by status and priority
- Task creation/completion trends over time
- Project progress tracking
- Team workload and performance metrics
- Interactive charts powered by **Recharts**

### ⏱️ Time Tracking
- Start/stop timers on tasks with live elapsed time
- Track time entries with descriptions
- View daily, weekly, and monthly summaries
- Per-task and per-project time breakdowns

### 🔔 Notifications
- Real-time notifications for comments, mentions, task assignments, status changes, document shares, and workspace invitations
- Unread badge indicator
- Filter by read/unread status
- Mark individual or all notifications as read

### ⚡ Productivity
- **Command palette** (`⌘K`) for instant navigation
- **Dark/light theme** toggle
- Fully responsive design for mobile and desktop
- Keyboard shortcuts throughout

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Backend** | [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime) |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Rich Text** | [TipTap](https://tiptap.dev/) |
| **Drag & Drop** | [dnd-kit](https://dndkit.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Testing** | [Playwright](https://playwright.dev/) (E2E) + [Vitest](https://vitest.dev/) (Unit) |
| **Code Quality** | ESLint, Prettier, Husky, lint-staged |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm (or your preferred package manager)
- A [Supabase](https://supabase.com/) project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/no1pain/flow.git
   cd flow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run database migrations**

   ```bash
   supabase db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run supabase:gen` | Generate Supabase types |

## 🧪 Testing

```bash
# Run unit tests
npx vitest

# Run E2E tests
npx playwright test
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login & registration
│   ├── dashboard/           # Dashboard pages (workspaces, projects, tasks, documents, analytics, time)
│   └── page.tsx            # Landing page
├── components/
│   ├── dashboard/          # Dashboard layout components
│   ├── landing/            # Landing page sections
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── features/               # Feature-based modules
│   ├── analytics/          # Analytics dashboard & team workload
│   ├── auth/               # Authentication actions & hooks
│   ├── documents/          # Documents, folders, sharing, search
│   ├── notifications/      # Real-time notifications
│   ├── projects/           # Projects & project members
│   ├── tasks/              # Tasks, Kanban, comments, activity
│   ├── time-tracking/      # Time tracking & entries
│   └── workspace/          # Workspaces, members, invitations
├── lib/
│   ├── hooks/              # Shared hooks (keyboard shortcuts)
│   ├── supabase/           # Supabase client, server, middleware
│   ├── utils/              # Utility functions (mentions, time)
│   └── validations/        # Zod schemas
└── types/                  # TypeScript types
supabase/
├── migrations/             # Database migrations
└── config.toml             # Supabase configuration
tests/
├── e2e/                    # Playwright E2E tests
└── unit/                   # Vitest unit tests
```

## 🗄️ Database Schema

The database is managed through Supabase migrations in `supabase/migrations/`:

- **profiles** — User profiles linked to auth users
- **workspaces** — Team workspaces
- **workspace_members** — Workspace membership with roles
- **workspace_invitations** — Pending member invitations
- **projects** — Projects within workspaces
- **project_members** — Project membership with roles
- **tasks** — Tasks with status, priority, assignee, and position
- **comments** — Task comments with mentions
- **task_activity** — Task change history
- **documents** — Rich text documents
- **document_folders** — Nested document folders
- **notifications** — User notifications
- **time_entries** — Time tracking entries

All tables are protected with **Row Level Security (RLS)** policies.

## 🔒 Security

- **Authentication** via Supabase Auth (email/password)
- **Row Level Security** on all database tables
- **Role-based access control** at the workspace and project level
- **Server-side validation** with Zod schemas
- **Server Actions** for mutations with revalidation

## 🌐 Deployment

The app is deployed on [Vercel](https://vercel.com). To deploy your own instance:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Add your Supabase environment variables
4. Deploy

## 📄 License

This project is licensed under the MIT License.