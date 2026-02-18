# arc42-01: Introduction and Goals

## 1.1 About This Document

**Project:** Open Buckets
**Version:** 1.0
**Date:** 2026-02-18
**Authors:** Sergei Golos
**Status:** Draft

### Purpose

This document serves as the comprehensive architecture documentation for Open Buckets, a Node.js-based directory monitoring system. It follows the [arc42](https://arc42.org) architecture documentation template and uses the [C4 Model](https://c4model.com) for architectural visualizations.

### Intended Audience

- **Developers:** Core maintainers and contributors
- **System Architects:** Those evaluating or extending the system
- **DevOps Engineers:** Those deploying and operating the system
- **Product Owners:** Those planning future features

### How to Read This Document

1. **If you're new to Open Buckets:** Start with sections 1-3 for an overview
2. **If you're implementing features:** Focus on sections 4-7 for technical details
3. **If you're deploying:** Review section 6 for deployment constraints
4. **If you're making architectural decisions:** Consult ADRs in `/docs/adr/`

---

## 1.2 System Overview

Open Buckets is a directory monitoring tool that watches multiple directories for file drops and reacts based on configurable rules. The system provides:

- **File Detection:** Real-time monitoring of multiple directories
- **Context Building:** Intelligent file collection and processing based on patterns
- **Flexible Configuration:** Gitignore-style patterns and TOML-based configuration
- **Output Generation:** Obsidian-style markdown with error tracking
- **Daemon Mode:** Background operation with PID management

### Key Capabilities

| Feature | Description |
|---------|-------------|
| Multi-Directory Watch | Simultaneously monitor multiple directories |
| Pattern-Based Filtering | Gitignore-style include/exclude patterns |
| File-Type Skills | Per-extension configuration (e.g., `.js.bucket-include`) |
| Directory Grep | Content-based file selection with `[dirs:path]` sections |
| Markdown Output | Obsidian-flavored markdown with wikilinks |
| Error Tracking | `.error` file creation for failed operations |
| Daemon Mode | Background execution with PID management |

---

## 1.3 Quality Goals

### 1.3.1 Primary Quality Goals

| Goal | Priority | Rationale |
|------|----------|-----------|
| **Reliability** | High | System must not miss file events or crash on bad input |
| **Performance** | High | File detection latency < 1 second; handle 50+ concurrent directories |
| **Extensibility** | High | Easy to add new file-type skills and output formats |
| **Usability** | Medium | Clear CLI and configuration; helpful error messages |

### 1.3.2 Secondary Quality Goals

| Goal | Priority | Rationale |
|------|----------|-----------|
| **Maintainability** | Medium | Clean separation of concerns; modular code |
| **Security** | Medium | Safe file handling; no arbitrary code execution |
| **Portability** | Low | Primary focus on Linux/macOS; Windows support secondary |

---

## 1.4 Stakeholders

| Stakeholder | Role | Interests |
|-------------|------|-----------|
| **Developers** | Core users | Debug file-based workflows; monitor log directories |
| **System Administrators** | Operators | Background monitoring; daemon mode |
| **QA Teams** | Testers | File upload workflow testing |
| **Data Pipeline Engineers** | Integrators | Automated file processing pipelines |

---

## 1.5 Scope

### 1.5.1 In Scope

- Directory watching with `fs.watch()` (future: chokidar)
- File drop detection and source directory identification
- Pattern-based file filtering (Gitignore-style)
- Context building with directory grep
- Markdown output generation (Obsidian-flavored)
- Error tracking with `.error` files
- Daemon mode with PID management
- File-type skills system (`.ext.bucket-include`)

### 1.5.2 Out of Scope

- Real-time synchronization (not a file sync tool)
- Content transformation/parsing (beyond basic file detection)
- Remote monitoring (watching network paths)
- Web UI (planned for future release)
- Notification systems (Slack, email, etc.)

---

## 1.6 Constraints

### 1.6.1 Technical Constraints

- **Runtime:** Node.js v18+ (currently running v22)
- **File Watching:** Native `fs.watch()` (may migrate to chokidar)
- **Configuration Format:** TOML for `.bucket-include` files
- **Output Format:** Obsidian Flavored Markdown

### 1.6.2 Operational Constraints

- **Daemon Mode:** POSIX-compliant daemon behavior
- **Logging:** Console output; file logging in daemon mode
- **File Size:** No hard limits (practical limits apply for display)
- **Concurrent Files:** Queue-based processing for rapid drops

### 1.6.3 Organizational Constraints

- **Open Source:** MIT License
- **Repository:** GitHub (https://github.com/SergeiGolos/open-buckets)
- **Documentation:** Markdown in `/docs` directory
- **Architecture:** Arc42 template with C4 model diagrams

---

## 1.7 Glossary

| Term | Definition |
|------|------------|
| **Bucket** | A monitored directory with its own configuration |
| **File Drop** | Creation of a new file in a monitored directory |
| **Bucket Include** | `.bucket-include` file defining patterns and rules |
| **Context Building** | Process of collecting files based on patterns and content |
| **Directory Grep** | Selecting files based on content matching |
| **File-Type Skill** | Configuration file for specific file extensions (e.g., `.js.bucket-include`) |
| **Obsidian Flavored Markdown** | Markdown with wikilinks, callouts, and frontmatter |
| **Daemon** | Background process with PID management |

---

## 1.8 References

### External Documentation

- [Node.js fs.watch() Documentation](https://nodejs.org/api/fs.html#fswatchfilename-options-listener)
- [Arc42 Template](https://arc42.org/overview)
- [C4 Model](https://c4model.com)
- [TOML Specification](https://toml.io)
- [Obsidian Markdown Reference](https://help.obsidian.md/How+to/Format+your+notes)

### Internal Documentation

- [ADR-001: Architecture Overview](../adr/001-architecture-overview.md)
- [PRD-001: Product Requirements](../prd/001-product-requirements.md)
- [README.md](../../README.md)

---

## 1.9 Development Context

### 1.9.1 Current Status

**MVP Phase:** Complete
- Basic directory watching ✅
- File drop detection ✅
- Text file display ✅
- Daemon mode ✅

**Context Builder Phase:** Complete
- `.bucket-include` TOML configuration ✅
- Gitignore-style patterns ✅
- Directory grep ✅
- File-type skills ✅
- Obsidian markdown output ✅
- Error tracking ✅

**Next Phase:** TBD
- See [PRD-001](../prd/001-product-requirements.md) for roadmap

### 1.9.2 Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `master` | Stable releases | Active |
| `feature/context-builder` | Context building features | Merged |

### 1.9.3 Key Issues

- Issue #1: Context builder implementation (completed)

---

## 1.10 Release History

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2026-02-18 | Initial MVP release |
| 0.2.0 | 2026-02-18 | Context builder features (ADR-002, ADR-003) |

---

**Next:** [arc42-02: Architecture Constraints](./arc42-02-architecture-constraints.md)
