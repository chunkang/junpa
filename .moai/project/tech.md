# Junpa - Technology Stack

## Overview

Junpa is a multi-language video streaming platform built with modern technologies optimized for cost-effective content delivery using Google Drive as the storage backend.

---

## Language Stack

| Component | Primary Language | Secondary | Rationale |
|-----------|-----------------|-----------|-----------|
| Admin Web | TypeScript | JavaScript | Type safety, React ecosystem |
| Streamer | Python | - | Streaming libraries, async support |
| Frontend Web | TypeScript | JavaScript | Type safety, React ecosystem |
| Infrastructure | YAML/HCL | - | Declarative configuration |

---

## Framework Selection

### Frontend Services

**React with Next.js**
- Server-side rendering for SEO and performance
- File-based routing for simplified navigation
- API routes for BFF (Backend for Frontend) patterns
- Excellent TypeScript integration

**Styling**
- Tailwind CSS for utility-first styling
- Component libraries: Radix UI, Shadcn/ui

### Backend Service (Streamer)

**FastAPI (Python)**
- High performance async web framework
- Automatic OpenAPI documentation
- Native async/await support for streaming
- Excellent typing support with Pydantic

**Google Drive Integration**
- Google Drive API v3 for file access
- OAuth 2.0 for authentication flow
- Streaming support for large files

---

## Development Environment

### Package Managers

| Tool | Purpose | Usage |
|------|---------|-------|
| uv | Python package management | Fast, modern pip replacement |
| npm | Node.js package management | Frontend dependencies |
| pnpm | Alternative Node.js manager | Monorepo support (optional) |

### Development Tools

| Tool | Purpose |
|------|---------|
| MoAI-ADK v1.1.0 | AI-assisted development framework |
| Claude Code | AI pair programming assistant |
| Docker | Containerization and local services |
| Git | Version control |

### IDE and Editor Support

- VS Code with recommended extensions
- Claude Code integration via `.claude/` configuration
- MoAI framework integration via `.moai/` configuration

---

## Quality Assurance Tools

### Python (Streamer)

| Tool | Purpose | Configuration |
|------|---------|---------------|
| pytest | Unit and integration testing | `pyproject.toml` |
| mypy | Static type checking | Strict mode enabled |
| ruff | Linting and formatting | Fast, replaces flake8/black |
| coverage | Test coverage measurement | 100% target |

### TypeScript (Admin/Frontend)

| Tool | Purpose | Configuration |
|------|---------|---------------|
| Jest/Vitest | Unit testing | `jest.config.js` or `vitest.config.ts` |
| ESLint | Linting | `.eslintrc.js` |
| Prettier | Code formatting | `.prettierrc` |
| TypeScript | Static type checking | `tsconfig.json` |

### Security Scanning

| Tool | Purpose |
|------|---------|
| ast-grep | Pattern-based code scanning |
| npm audit | Dependency vulnerability scanning |
| pip-audit | Python dependency scanning |
| Trivy | Container image scanning |

---

## Quality Gates Configuration

From `.moai/config/sections/quality.yaml`:

```yaml
TDD Configuration:
  - Mode: warn (notify but don't block)
  - Coverage Target: 100%
  - Supported Languages: Python, TypeScript, JavaScript

Test Quality Standards:
  - Specification-based testing
  - Meaningful assertions required
  - Avoid implementation coupling

Tag Validation:
  - Enabled with warn mode
  - SPEC existence checking
  - Max 100 tags per file
```

---

## Deployment Targets

### Platform Options

| Platform | Use Case | Services |
|----------|----------|----------|
| Vercel | Frontend hosting | Admin Web, Frontend Web |
| Railway | Backend services | Streamer |
| Firebase | Auth, Firestore | User data, metadata |
| Supabase | Alternative backend | PostgreSQL, Auth |
| Neon | Serverless PostgreSQL | Database (optional) |

### Container Strategy

```
Docker Images:
+-- junpa-admin-web      # Node.js based
+-- junpa-streamer       # Python based
+-- junpa-frontend-web   # Node.js based
```

### Environment Configuration

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| Development | Local development | Docker Compose |
| Staging | Pre-production testing | Cloud deployment |
| Production | Live service | Cloud with CDN |

---

## External Service Integrations

### Google Services

| Service | Purpose |
|---------|---------|
| Google Drive API | Video storage and retrieval |
| Google OAuth 2.0 | User authentication |
| Google Photos API | Optional content import |

### Potential Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| Cloudflare | CDN and DDoS protection | Planned |
| Sentry | Error tracking | Planned |
| PostHog | Analytics | Planned |

---

## Build and CI/CD Configuration

### GitHub Actions Workflows

```yaml
Planned Workflows:
  - ci.yml: Lint, type-check, test on PR
  - deploy-staging.yml: Deploy to staging on merge
  - deploy-production.yml: Deploy to production on release
  - security-scan.yml: Weekly security scanning
```

### Build Commands

**Python (Streamer)**
```bash
# Install dependencies
uv sync

# Run tests
uv run pytest --cov=src --cov-report=term-missing

# Type checking
uv run mypy src

# Linting
uv run ruff check src
```

**TypeScript (Admin/Frontend)**
```bash
# Install dependencies
npm install

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

---

## Git Strategy

From `.moai/config/sections/git-strategy.yaml`:

| Setting | Value |
|---------|-------|
| Mode | Personal |
| Workflow | GitHub Flow |
| Branch Prefix | `feature/SPEC-` |
| Main Branch | `main` |
| Commit Style | Conventional commits |
| Auto Branch | Enabled |
| Auto Commit | Enabled |
| Auto Push | Enabled |
| Pre-commit Hooks | Enforced |

---

## MoAI-ADK Framework

### Version and Configuration

| Setting | Value |
|---------|-------|
| Version | 1.1.0 |
| Update Check | Daily |
| TRUST 5 | Enabled |
| Spec Git Workflow | main_direct |

### Available Agents (22 total)

**Manager Agents (8)**
- manager-spec, manager-tdd, manager-docs, manager-quality
- manager-project, manager-strategy, manager-git, manager-claude-code

**Expert Agents (8)**
- expert-backend, expert-frontend, expert-security, expert-devops
- expert-performance, expert-debug, expert-testing, expert-refactoring

**Builder Agents (4)**
- builder-agent, builder-command, builder-skill, builder-plugin

### Available Commands

| Command | Purpose |
|---------|---------|
| `/moai:0-project` | Project initialization |
| `/moai:1-plan` | SPEC creation |
| `/moai:2-run` | TDD implementation |
| `/moai:3-sync` | Documentation sync |
| `/moai:9-feedback` | Issue reporting |
| `/moai:alfred` | General assistance |
| `/moai:fix` | Quick fixes |
| `/moai:loop` | Iterative development |

---

## Security Considerations

### Authentication Flow

1. User initiates Google OAuth 2.0 login
2. Application receives access token
3. Token used for Google Drive API access
4. User session maintained securely

### Data Security

- All video content stored in user's own Google Drive
- No video data stored on application servers
- Streaming URLs use secure tokens
- HTTPS enforced for all communications

### Compliance

- OWASP security guidelines followed
- Regular dependency vulnerability scanning
- AST-grep pattern scanning for code quality

---

## Performance Optimization

### Streaming Performance

- HTTP-based adaptive streaming
- Chunk-based delivery for large files
- CDN integration for global distribution

### Frontend Performance

- Server-side rendering for initial load
- Code splitting and lazy loading
- Image optimization and caching

### Backend Performance

- Async request handling
- Connection pooling
- Response caching where appropriate

---

## Related Documentation

- [Product Overview](./product.md) - Features and use cases
- [Project Structure](./structure.md) - Directory organization
