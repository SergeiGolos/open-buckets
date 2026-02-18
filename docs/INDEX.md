# Open Buckets - Documentation Index

This directory contains comprehensive architecture documentation for Open Buckets, following the [arc42](https://arc42.org) template and using the [C4 Model](https://c4model.com) for architectural visualizations.

---

## Quick Start

- **New to Open Buckets?** Start with the [README](../README.md)
- **Want to understand the architecture?** Read the [Architecture Overview](adr/001-architecture-overview.md)
- **Need to know what's planned?** Check the [Product Requirements](prd/001-product-requirements.md)
- **Looking for detailed architecture docs?** See the [arc42 sections](#arc42-architecture-documents)

---

## Document Structure

### Architecture Documents (arc42)

The arc42 template provides a structured approach to architecture documentation:

| Section | Title | Description |
|---------|-------|-------------|
| [arc42-01](arc42-01-introduction-and-goals.md) | Introduction and Goals | System overview, quality goals, stakeholders |
| [arc42-02](arc42-02-architecture-constraints.md) | Architecture Constraints | Technical, operational, and organizational constraints |
| [arc42-03](arc42-03-system-context.md) | System Context | Business context, technical context, C4 Level 1 diagram |
| [arc42-04](arc42-04-building-block-view.md) | Building Block View | Container architecture, C4 Level 2 diagram |
| [arc42-05](arc42-05-runtime-view.md) | Runtime View | Component architecture, C4 Level 3 diagrams, sequence diagrams |
| [arc42-06](arc42-06-cross-cutting-concepts.md) | Cross-Cutting Concepts | Architecture principles, security, logging, configuration |
| [arc42-07](arc42-07-architecture-decisions.md) | Architecture Decisions | Important technical decisions with rationale |

### Architecture Decision Records (ADRs)

ADRs capture significant architectural decisions:

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](adr/001-architecture-overview.md) | Architecture Overview | Draft | 2026-02-18 |
| [ADR-002](adr/002-context-builder.md) | Context Builder Implementation | Complete | 2026-02-18 |
| [ADR-003](adr/003-gitignore-style-config.md) | Gitignore-Style Configuration | Complete | 2026-02-18 |

### Product Requirements

| PRD | Title | Version | Date |
|-----|-------|---------|------|
| [PRD-001](prd/001-product-requirements.md) | Product Requirements | 0.1 | 2026-02-18 |

### Implementation Guides

| Document | Description |
|----------|-------------|
| [Runner Implementation](runner-implementation.md) | Runner architecture, error tracking, success tracking, metrics |

### Diagrams

| Document | Description |
|----------|-------------|
| [Diagrams](diagrams.md) | All C4 model diagrams (Context, Container, Component, Sequence) |

### Placeholders

| Document | Description |
|----------|-------------|
| [placeholders/CONTEXT_TREE.md](placeholders/CONTEXT_TREE.md) | Template for context tree output |
| [placeholders/RUN_SUMMARY.md](placeholders/RUN_SUMMARY.md) | Template for run summary output |
| [placeholders/METRICS_SNAPSHOT.md](placeholders/METRICS_SNAPSHOT.md) | Template for metrics snapshot output |
| [placeholders/CONFIG_DUMP.md](placeholders/CONFIG_DUMP.md) | Template for configuration dump output |

---

## How to Use This Documentation

### For New Contributors

1. Read [arc42-01](arc42-01-introduction-and-goals.md) for an overview
2. Review [arc42-03](arc42-03-system-context.md) to understand the system context
3. Check [arc42-04](arc42-04-building-block-view.md) for container architecture
4. Read [arc42-05](arc42-05-runtime-view.md) for component details

### For Architecture Decisions

1. Check [ADR-001](adr/001-architecture-overview.md) for existing decisions
2. Create new ADRs for significant decisions (use ADR template)
3. Update [arc42-07](arc42-07-architecture-decisions.md) to summarize decisions

### For Implementation

1. Review [arc42-04](arc42-04-building-block-view.md) for container responsibilities
2. Read [arc42-05](arc42-05-runtime-view.md) for component interactions
3. Check [Runner Implementation](runner-implementation.md) for runner details
4. Use [Diagrams](diagrams.md) as visual reference

### For Deployment

1. Review [arc42-02](arc42-02-architecture-constraints.md) for deployment constraints
2. Check [arc42-06](arc42-06-cross-cutting-concepts.md) for deployment considerations
3. Review [ADR-003](adr/003-gitignore-style-config.md) for configuration format

---

## Diagram Viewing

### Mermaid Live Editor
Open any diagram in https://mermaid.live for interactive viewing

### GitHub/GitLab
Mermaid diagrams render natively in markdown files

### VS Code
Install the "Mermaid Preview" extension for VS Code

### Command Line
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.mmd -o diagram.png
```

---

## Document Conventions

### Terminology

| Term | Definition |
|------|------------|
| **Bucket** | A monitored directory with its own configuration |
| **File Drop** | Creation of a new file in a monitored directory |
| **Bucket Include** | `.bucket-include` file defining patterns and rules |
| **Context Building** | Process of collecting files based on patterns and content |
| **Directory Grep** | Selecting files based on content matching |
| **File-Type Skill** | Configuration file for specific file extensions |
| **Obsidian Flavored Markdown** | Markdown with wikilinks, callouts, frontmatter |

### C4 Model Levels

| Level | Scope | Diagrams |
|-------|-------|----------|
| **Level 1** | System Context | System context diagram |
| **Level 2** | Containers | Container diagram |
| **Level 3** | Components | Component diagrams |
| **Level 4** | Code | Not documented (use auto-generation) |

### Status Tags

- **Draft** - Work in progress, not reviewed
- **Review** - Under review, seeking feedback
- **Approved** - Approved and stable
- **Deprecated** - No longer applicable

---

## Contributing to Documentation

### Adding New ADRs

1. Copy the ADR template from `/templates/adr-template.md`
2. Update the table of contents in this index
3. Reference in [arc42-07](arc42-07-architecture-decisions.md)

### Updating Diagrams

1. Edit the Mermaid code in [diagrams.md](diagrams.md)
2. Verify in https://mermaid.live
3. Update sequence diagrams if workflows change
4. Update state diagrams if lifecycle changes

### Updating Placeholders

1. Edit placeholder templates in `/placeholders/`
2. Update template variables in implementation
3. Test generation with sample data

---

## Related Resources

### External

- [Arc42 Template](https://arc42.org) - Architecture documentation template
- [C4 Model](https://c4model.com) - Architecture diagram methodology
- [Mermaid Documentation](https://mermaid.js.org) - Diagram syntax reference
- [TOML Specification](https://toml.io) - Configuration file format
- [Obsidian Markdown Reference](https://help.obsidian.md/How+to/Format+your+notes) - Output format

### Internal

- [GitHub Repository](https://github.com/SergeiGolos/open-buckets)
- [README](../README.md) - Project overview and usage
- [CHANGELOG](../CHANGELOG.md) - Release notes (when available)

---

**Last Updated:** 2026-02-18
**Documentation Version:** 1.0
