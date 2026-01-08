# 🎯 SkillFind.pro - Professional Service Marketplace

> **Connect clients with verified professionals** across tutoring, coaching, wellness, tech, and home services.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-green)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-brightgreen)](https://supabase.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Database](#-database)
- [Scripts](#-scripts)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

SkillFind is a **two-sided marketplace** connecting clients who need services with verified professionals who provide them. The platform features separate dashboards for clients and professionals, real-time messaging, secure payments, and a comprehensive review system.

### Key Highlights

- 🏠 **Marketing landing page** with hero search, categories, and featured professionals
- 👥 **Client dashboard** with request management, bookings, and wallet
- 💼 **Professional dashboard** with offer system, earnings tracking, and profile management
- 🎨 **Reusable UI component library** for consistent design
- 🗄️ **Fully migrated database** with Prisma + Supabase
- 📱 **Responsive design** optimized for all devices

---

## ✨ Features

### For Clients
- 📝 Post service requests with detailed requirements
- 💰 Transparent pricing with click-fee system
- ⭐ Review and rate professionals
- 💬 Real-time messaging with professionals
- 📊 Track bookings and transactions
- 🔔 Smart notifications

### For Professionals
- 🎯 Browse and bid on relevant requests
- 💳 Built-in wallet and earnings tracking
- 📸 Portfolio showcase
- 📅 Availability management
- ✅ Verification system
- 📈 Performance analytics

### Platform Features
- 🔐 Secure authentication (Clerk)
- 💾 PostgreSQL database (Supabase)
- 📁 File storage for documents and images
- 🔍 Advanced search and filtering
- 📱 Mobile-responsive UI
- 🌐 SEO optimized

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS
- **[Turbopack](https://turbo.build/)** - Fast bundler

### Backend & Database
- **[Prisma 7](https://www.prisma.io/)** - Type-safe ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Supabase](https://supabase.com/)** - Database hosting + storage

### Authentication & Storage
- **[Clerk](https://clerk.com/)** - Authentication & user management
- **[Supabase Storage](https://supabase.com/storage)** - File uploads

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Git** - Version control

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/skillfind.git
   cd skillfind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials (see .env.example for details)
   ```

4. **Run database migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

🎉 **You're all set!** The app should be running with a seeded database.

---

## 📁 Project Structure

```
skillfind/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── client/            # Client dashboard & routes
│   │   ├── pro/               # Professional dashboard & routes
│   │   ├── login/             # Authentication pages
│   │   └── api/               # API routes (future)
│   ├── components/
│   │   ├── landing/           # Landing page components (10)
│   │   ├── layout/            # Navbar, Footer
│   │   └── ui/                # Reusable UI components (10)
│   └── lib/
│       ├── prisma.ts          # Database client
│       └── supabase.ts        # Storage client
├── prisma/
│   ├── schema.prisma          # Database schema (17 models)
│   ├── seed.ts                # Seed data
│   └── migrations/            # Migration history
├── public/                     # Static assets
├── docs/                       # Documentation
│   ├── plan/                  # Project planning docs
│   └── *.md                   # Various guides
└── *.config.*                  # Configuration files
```

---

## 🗄️ Database

### Schema Overview

**17 Models:**
- User, Client, Professional, ProfessionalProfile
- Category (5), Subcategory (15), ProfessionalService
- Request, Offer, Job, Review
- Wallet, Transaction, ClickEvent
- Message, Notification
- VerificationDocument, PlatformSettings

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open database GUI
npx prisma studio

# Check migration status
npx prisma migrate status
```

📖 **See [PRISMA_COMMANDS.md](./PRISMA_COMMANDS.md) for comprehensive guide**

### Current Data

✅ **Seeded Categories:**
- 🔧 Home Repair & Maintenance
- 💻 Software & Tech
- 📚 Tutoring & Education
- 🎨 Creative Services
- 🧘 Wellness & Coaching

✅ **Platform Settings:**
- Click fee: €0.10
- Minimum balance: €2.00
- Max offers per request: 10

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build + type-check |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Create & apply migration |
| `npx prisma db seed` | Seed database |

---

## 📚 Documentation

### Getting Started
- **[docs/setup/START_HERE.md](./docs/setup/START_HERE.md)** - Quick overview
- **[docs/setup/QUICK_START.md](./docs/setup/QUICK_START.md)** - 3-step setup guide
- **[docs/guides/CONTRIBUTING.md](./docs/guides/CONTRIBUTING.md)** - Contribution guidelines

### Database & Backend
- **[docs/reference/PRISMA_COMMANDS.md](./docs/reference/PRISMA_COMMANDS.md)** - Complete Prisma reference
- **[docs/database-schema-design.md](./docs/database-schema-design.md)** - Schema documentation
- **[docs/setup/SUPABASE_MIGRATION_GUIDE.md](./docs/setup/SUPABASE_MIGRATION_GUIDE.md)** - Migration guide

### Planning & Workflows
- **[docs/project_workflow.md](./docs/project_workflow.md)** - Development workflow
- **[docs/agent_usage_guide.md](./docs/agent_usage_guide.md)** - AI agent guide
- **[docs/plan/](./docs/plan/)** - Detailed planning documents

### Project Status
- **[docs/guides/PROJECT_STATUS.md](./docs/guides/PROJECT_STATUS.md)** - Current status & roadmap
- **[docs/guides/FINAL_SUMMARY.md](./docs/guides/FINAL_SUMMARY.md)** - Executive summary
- **[docs/setup/READY_TO_COMMIT.md](./docs/setup/READY_TO_COMMIT.md)** - Commit guide

---

## 🧭 Development Workflow

### Adding a New Feature

1. **Create a branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **If adding database changes:**
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name add_my_feature
   ```

3. **Develop your feature:**
   - Add components in `src/components/`
   - Add pages in `src/app/`
   - Use UI components from `src/components/ui/`

4. **Test locally:**
   ```bash
   npm run dev
   npx prisma studio  # View data
   ```

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

6. **Create Pull Request**

---

## 🎨 Design System

### UI Components
- `Button` - Primary, secondary, outline variants
- `Card` - Container with consistent styling
- `Badge` - Status indicators
- `Pill` - Category tags
- `StatCard` - Dashboard statistics
- `ActionCard` - CTA cards
- `SectionHeading` - Consistent headings
- `Container` - Page layout wrapper

### Color Palette
- Primary: Emerald tones
- Accent: Orange/amber tones
- Neutral: Gray scale
- States: Success (green), Warning (yellow), Error (red)

### Typography
- Font: System font stack
- Sizes: Tailwind scale (text-sm to text-5xl)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 🤝 Contributing

We welcome contributions! Please read our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:

- Development setup
- Coding standards
- Git workflow
- Pull request process
- Testing guidelines

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

### Documentation
- 📖 [Full documentation](./docs/)
- 💻 [Prisma commands](./PRISMA_COMMANDS.md)
- 🚀 [Quick start](./QUICK_START.md)

### Useful Commands
```bash
# Development
npm run dev              # Start dev server
npx prisma studio        # View database

# Database
npx prisma generate      # Regenerate client
npx prisma migrate dev   # Create migration
npx prisma db seed       # Seed data

# Debugging
npm run lint             # Check code
npx prisma validate      # Check schema
npx prisma migrate status # Check migrations
```

---

## 🎯 Project Status

- ✅ **Database:** Fully migrated to Supabase
- ✅ **UI Components:** 21 components ready
- ✅ **Authentication:** Clerk configured
- ✅ **Storage:** Supabase configured
- ⏳ **API Routes:** In progress
- ⏳ **Testing:** To be implemented

**Next Steps:**
1. Implement API routes
2. Connect UI to database
3. Add authentication flows
4. Implement file uploads
5. Add testing suite

See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** for detailed status.

---

## 🌟 Features Roadmap

### Phase 1: Core Features (Current)
- [x] Database setup
- [x] UI components
- [x] Landing page
- [x] Dashboards (UI only)
- [ ] API routes
- [ ] Authentication integration

### Phase 2: Functionality
- [ ] Service requests CRUD
- [ ] Offer system
- [ ] Booking flow
- [ ] Wallet & transactions
- [ ] Messaging system

### Phase 3: Advanced
- [ ] Payment integration (Stripe)
- [ ] Real-time notifications
- [ ] Search & filtering
- [ ] Admin dashboard
- [ ] Analytics

### Phase 4: Polish
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] Mobile app (PWA)
- [ ] Internationalization

---

**Built with ❤️ by the SkillFind team**

---

