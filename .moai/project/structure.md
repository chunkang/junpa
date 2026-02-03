# Junpa - Project Structure

## Directory Overview

This document describes the directory organization and architectural layout of the Junpa video streaming platform.

---

## Current Directory Tree

```
junpa/
+-- .claude/                    # Claude Code configuration
|   +-- agents/                 # AI agent definitions
|   |   +-- moai/              # MoAI-ADK agents (22 agents)
|   +-- commands/              # Slash commands
|   |   +-- moai/              # MoAI workflow commands
|   +-- hooks/                 # Event-driven automation
|   |   +-- moai/              # Quality hooks and utilities
|   |   +-- lib/               # Hook support libraries
|   +-- output-styles/         # Response formatting styles
|   +-- skills/                # AI skill definitions
|       +-- moai-*/            # Domain and workflow skills
|
+-- .moai/                      # MoAI-ADK framework
|   +-- announcements/         # Multi-language announcements
|   +-- config/                # Project configuration
|   |   +-- sections/          # Modular config files
|   +-- docs/                  # Generated documentation
|   +-- llm-configs/           # LLM provider configurations
|   +-- logs/                  # Runtime logs (30-day retention)
|   +-- memory/                # Context persistence
|   +-- project/               # Project documentation (this directory)
|   +-- reports/               # Generated reports
|   +-- specs/                 # SPEC documents
|
+-- .github/                    # GitHub workflows (prepared)
|
+-- CLAUDE.md                   # AI assistant instructions
+-- README.md                   # Project overview
+-- .gitignore                  # Git ignore rules
+-- .mcp.json                   # MCP server configuration
```

---

## Directory Purposes

### Development Configuration (`.claude/`)

| Directory | Purpose |
|-----------|---------|
| `agents/moai/` | 22 specialized AI agents for development workflows |
| `commands/moai/` | 9 slash commands for MoAI workflow execution |
| `hooks/moai/` | Quality enforcement hooks (TDD, linting, security) |
| `hooks/moai/lib/` | Shared utilities for hook implementations |
| `output-styles/moai/` | Response formatting (alfred, r2d2, yoda styles) |
| `skills/` | Domain expertise modules (30+ skills available) |

### MoAI Framework (`.moai/`)

| Directory | Purpose |
|-----------|---------|
| `announcements/` | Multi-language system messages (en, ko, ja, zh) |
| `config/` | Unified configuration management |
| `config/sections/` | Modular config (user, language, quality, git, etc.) |
| `docs/` | Generated documentation output |
| `llm-configs/` | Provider-specific LLM configurations |
| `logs/` | Runtime execution logs (auto-cleanup after 30 days) |
| `memory/` | Session context and knowledge persistence |
| `project/` | Project-level documentation |
| `reports/` | Quality and analysis reports |
| `specs/` | SPEC requirement documents |

---

## Planned Service Structure

When implementation begins, the following structure will be created:

```
junpa/
+-- services/
|   +-- admin-web/             # Content management interface
|   |   +-- src/
|   |   +-- tests/
|   |   +-- package.json
|   |
|   +-- streamer/              # Streaming service backend
|   |   +-- src/
|   |   +-- tests/
|   |   +-- pyproject.toml
|   |
|   +-- frontend-web/          # Public viewer interface
|       +-- src/
|       +-- tests/
|       +-- package.json
|
+-- shared/                     # Shared utilities and types
|   +-- types/
|   +-- utils/
|
+-- infrastructure/             # Deployment configurations
    +-- docker/
    +-- terraform/
```

### Service Module Organization

**Admin Web (TypeScript/React)**
```
admin-web/
+-- src/
|   +-- components/            # React components
|   +-- pages/                 # Page components
|   +-- hooks/                 # Custom React hooks
|   +-- services/              # API service layer
|   +-- utils/                 # Utility functions
|   +-- types/                 # TypeScript types
+-- tests/
    +-- unit/
    +-- integration/
```

**Streamer (Python)**
```
streamer/
+-- src/
|   +-- api/                   # API endpoints
|   +-- core/                  # Core streaming logic
|   +-- services/              # Business logic services
|   +-- models/                # Data models
|   +-- utils/                 # Utility functions
+-- tests/
    +-- unit/
    +-- integration/
```

**Frontend Web (TypeScript/React)**
```
frontend-web/
+-- src/
|   +-- components/            # React components
|   +-- pages/                 # Page components
|   +-- hooks/                 # Custom React hooks
|   +-- services/              # API service layer
|   +-- utils/                 # Utility functions
|   +-- types/                 # TypeScript types
+-- tests/
    +-- unit/
    +-- integration/
```

---

## Key File Locations

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| Project Config | `.moai/config/sections/project.yaml` | Project metadata |
| Quality Config | `.moai/config/sections/quality.yaml` | TDD and quality settings |
| Git Strategy | `.moai/config/sections/git-strategy.yaml` | Version control workflow |
| Language Config | `.moai/config/sections/language.yaml` | i18n settings |
| User Config | `.moai/config/sections/user.yaml` | User preferences |

### Documentation Files

| File | Location | Purpose |
|------|----------|---------|
| Product Overview | `.moai/project/product.md` | Product description and features |
| Project Structure | `.moai/project/structure.md` | This document |
| Technology Stack | `.moai/project/tech.md` | Technical implementation details |
| Main README | `README.md` | Project entry point |

### AI Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| Claude Instructions | `CLAUDE.md` | AI assistant behavior rules |
| MCP Config | `.mcp.json` | MCP server integrations |
| Agent Definitions | `.claude/agents/moai/*.md` | AI agent specifications |
| Skill Definitions | `.claude/skills/*/SKILL.md` | Domain expertise modules |

---

## Data Flow Architecture

```
                    +------------------+
                    |   Admin Web      |
                    | (Content Mgmt)   |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |  Google Drive    |
                    | /.junpa/         |
                    | - library.json   |
                    | - profiles       |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
              v                             v
     +------------------+         +------------------+
     |    Streamer      |         |  Frontend Web    |
     | (Video Delivery) |<------->| (Viewer UI)      |
     +------------------+         +------------------+
```

---

## Related Documentation

- [Product Overview](./product.md) - Features and use cases
- [Technology Stack](./tech.md) - Technical implementation details
