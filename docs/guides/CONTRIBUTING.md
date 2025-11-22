# Contributing to SkillFind

Thank you for your interest in contributing to SkillFind! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Database Changes](#database-changes)
6. [Git Workflow](#git-workflow)
7. [Testing](#testing)
8. [Pull Request Process](#pull-request-process)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git**
- **PostgreSQL** (via Supabase)

### First-Time Setup

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
   # Edit .env with your credentials
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

---

## 💻 Development Setup

### Required Tools

- **Code Editor:** VS Code (recommended)
- **Browser:** Chrome or Firefox with React DevTools
- **Database Client:** Prisma Studio (`npx prisma studio`)

### Recommended VS Code Extensions

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens

---

## 📁 Project Structure

```
skillfind/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── client/         # Client dashboard
│   │   ├── pro/            # Professional dashboard
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── landing/        # Landing page components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Reusable UI components
│   └── lib/                # Utility functions
│       ├── prisma.ts       # Database client
│       └── supabase.ts     # Storage client
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed data
│   └── migrations/         # Migration history
├── public/                 # Static assets
└── docs/                   # Documentation
```

---

## 🎨 Coding Standards

### TypeScript

- **Use TypeScript for all files**
- **Enable strict mode**
- **Avoid `any` types** - use proper typing
- **Use interfaces for props and types**

```typescript
// ✅ Good
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

- **Use functional components with hooks**
- **Follow naming conventions:**
  - Components: PascalCase (`UserProfile.tsx`)
  - Files: PascalCase for components, camelCase for utilities
  - Props: Descriptive names (`isLoading`, `userName`)

```tsx
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {children}
    </button>
  );
}

// ❌ Bad
export default function btn(props: any) {
  return <button {...props} />;
}
```

### Styling

- **Use Tailwind CSS utility classes**
- **Follow mobile-first approach**
- **Keep components responsive**

```tsx
// ✅ Good
<div className="w-full md:w-1/2 lg:w-1/3 p-4">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>

// ❌ Bad
<div style={{ width: '33%', padding: '16px' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Title</h2>
</div>
```

### File Organization

- **One component per file**
- **Group related files together**
- **Use barrel exports (index.ts) for directories**

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
```

---

## 🗄️ Database Changes

### Making Schema Changes

1. **Edit `prisma/schema.prisma`:**
   ```prisma
   model User {
     id        String   @id @default(cuid())
     email     String   @unique
     name      String?
     // Add new field
     avatar    String?
     createdAt DateTime @default(now())
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_user_avatar
   ```

3. **Update seed file if needed:**
   ```bash
   # Edit prisma/seed.ts
   ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Database Best Practices

- **Always create migrations** - don't use `db push` in production
- **Name migrations descriptively** - `add_user_avatar` not `update1`
- **Test migrations locally** before pushing
- **Review generated SQL** in migration files
- **Update seed data** if schema changes affect it

### Prisma Commands Reference

See **[PRISMA_COMMANDS.md](./PRISMA_COMMANDS.md)** for complete reference.

---

## 🌿 Git Workflow

### Branch Naming

```
feature/description      # New features
fix/description         # Bug fixes
docs/description        # Documentation updates
refactor/description    # Code refactoring
test/description        # Test additions/updates
```

**Examples:**
- `feature/add-user-profile`
- `fix/booking-validation-error`
- `docs/update-readme`

### Commit Messages

Follow the **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): add password reset functionality

Implemented password reset flow with email verification.
Closes #123

fix(booking): resolve double-booking issue

Fixed race condition in booking creation that allowed
multiple bookings for the same time slot.

docs(prisma): add database command reference

Created comprehensive guide for all Prisma CLI commands
with examples and use cases.
```

### Workflow Steps

1. **Create a branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

3. **Keep branch updated:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push to remote:**
   ```bash
   git push origin feature/my-new-feature
   ```

5. **Create Pull Request**

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test path/to/test.spec.ts

# Watch mode
npm run test:watch
```

### Writing Tests

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Coverage Requirements

- **Minimum 80% coverage** for new code
- **Test all business logic**
- **Test error cases**
- **Test edge cases**

---

## 📝 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] Commits are clean and descriptive
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
How to test these changes

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
```

### Review Process

1. **Submit PR** with descriptive title and description
2. **Automated checks** must pass (linting, tests)
3. **Code review** by at least one team member
4. **Address feedback** and update PR
5. **Approval** from reviewer
6. **Merge** by maintainer

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome, Safari]
- Node version: [e.g. 18.17.0]

**Additional context**
Any other context about the problem.
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Screenshots, mockups, or examples.
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

### Project Docs
- **[README.md](./README.md)** - Project overview
- **[PRISMA_COMMANDS.md](./PRISMA_COMMANDS.md)** - Database commands
- **[START_HERE.md](./START_HERE.md)** - Quick start guide
- **[docs/](./docs/)** - Detailed documentation

---

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community

**Unacceptable behavior:**
- Trolling, insulting comments, or personal attacks
- Public or private harassment
- Publishing others' private information
- Other conduct which could be considered inappropriate

---

## ❓ Questions?

- **Slack:** #skillfind-dev
- **Email:** dev@skillfind.pro
- **GitHub Discussions:** [Link to discussions]

---

**Thank you for contributing to SkillFind! 🚀**
