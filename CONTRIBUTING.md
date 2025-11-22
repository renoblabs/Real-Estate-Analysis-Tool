# Contributing to REI OPS™

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to REI OPS™. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)

---

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. By participating, you are expected to uphold this code.

**TL;DR:** Be respectful, professional, and constructive.

---

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. v2.3.3]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case:** Why is this enhancement useful?
- **Alternatives considered:** What other solutions did you consider?
- **Mockups/Examples:** If applicable

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Small, well-defined tasks
- `help wanted` - Issues needing assistance
- `documentation` - Documentation improvements

---

## 🛠 Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **Supabase** account (free tier works)
- **Git**

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Real-Estate-Analysis-Tool.git
cd Real-Estate-Analysis-Tool

# 2. Add upstream remote
git remote add upstream https://github.com/renoblabs/Real-Estate-Analysis-Tool.git

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 5. Set up the database
# Go to your Supabase project → SQL Editor
# Run the SQL from supabase/schema.sql

# 6. Run development server
npm run dev
```

### Keeping Your Fork Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream main into your main
git checkout main
git merge upstream/main
```

---

## 🎨 Coding Standards

### TypeScript

- **Strict mode enabled** - No implicit `any`, proper null checks
- **Type everything** - Avoid `any`, use proper types or `unknown`
- **Interfaces over types** for object shapes (except unions)

```typescript
// ✅ GOOD
interface UserData {
  id: string;
  email: string;
  name: string | null;
}

// ❌ BAD
const userData: any = { ... };
```

### React Components

- **Functional components** with hooks (no class components)
- **Named exports** for components (easier to search/refactor)
- **Props interfaces** for all components

```typescript
// ✅ GOOD
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ BAD
export default function Button(props: any) { ... }
```

### File Organization

```
/app                    # Next.js pages (App Router)
/components
  /ui                   # Reusable UI components
  /forms                # Form components
  /analysis             # Analysis-specific components
  /layout               # Layout components
/lib                    # Business logic & utilities
  /constants            # Constants and configuration
  /utils.ts             # Shared utilities
/types                  # TypeScript type definitions
/__tests__              # Test files (mirrors /lib structure)
```

### Naming Conventions

- **Files:** `kebab-case.ts` or `PascalCase.tsx` for components
- **Components:** `PascalCase`
- **Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE` or `camelCase` for config objects
- **Types/Interfaces:** `PascalCase`

```typescript
// File: components/forms/PropertyDetailsForm.tsx
interface PropertyDetailsFormProps { ... }
export function PropertyDetailsForm({ ... }: PropertyDetailsFormProps) { ... }

// File: lib/utils.ts
export const API_TIMEOUT = 30000;
export function formatCurrency(value: number): string { ... }
```

### Code Style

We use **Prettier** and **ESLint**. Run before committing:

```bash
npm run format        # Format code
npm run lint         # Check for issues
npm run lint:fix     # Auto-fix issues
```

**Key rules:**
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in objects/arrays
- **Max line length:** 100 characters

---

## 📝 Commit Guidelines

We follow **Conventional Commits** for clear history and automated changelogs.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(analyze): add Airbnb/STR analysis module

# Bug fix
fix(dashboard): resolve timeout on data fetch

# Refactoring
refactor(risk-analyzer): break down 462-line function into 8 focused functions

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: change Deal interface to include required year_built

BREAKING CHANGE: year_built is now required in PropertyInputs
```

### Scope Examples

- `analyze` - Analysis page/logic
- `dashboard` - Dashboard features
- `deals` - Deal management
- `components` - UI components
- `lib` - Business logic
- `database` - Database operations
- `api` - API changes

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update from main** - Ensure your branch is up to date
2. **Run tests** - `npm test` (all tests must pass)
3. **Run linter** - `npm run lint` (no warnings allowed)
4. **Type check** - `npm run type-check` (no errors)
5. **Test manually** - Verify your changes work

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console.log() or debugger statements
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** - Tests, linting, type checking must pass
2. **Code review** - At least one approval required
3. **Testing** - Reviewer tests changes locally
4. **Merge** - Squash and merge (clean history)

---

## 🧪 Testing Requirements

### Test Coverage

- **Minimum:** 70% overall coverage
- **New features:** 80%+ coverage required
- **Critical paths:** 100% coverage (payments, calculations)

### Writing Tests

```typescript
// __tests__/lib/utils.test.ts
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,235');
  });

  it('respects decimal parameter', () => {
    expect(formatCurrency(1234.56, 2)).toBe('$1,234.56');
  });
});
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

---

## 🚀 Release Process

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with changes
3. **Create release branch** - `release/vX.X.X`
4. **Final testing** - Full regression test
5. **Merge to main** - After approval
6. **Tag release** - `git tag vX.X.X`
7. **Deploy** - Automated via CI/CD

---

## 📚 Additional Resources

- [Project Architecture](ARCHITECTURE.md)
- [API Documentation](API.md)
- [User Guide](USER_GUIDE.md)
- [Setup Guide](SETUP.md)

---

## 💡 Questions?

- **Documentation:** Check existing docs first
- **Slack/Discord:** [Coming soon]
- **GitHub Discussions:** Ask questions, share ideas
- **Issues:** Report bugs, request features

---

**Thank you for contributing to REI OPS™!** 🙏

Every contribution, no matter how small, makes this tool better for Canadian real estate investors.
