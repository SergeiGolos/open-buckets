# arc42-02: Architecture Constraints

## 2.1 Technical Constraints

### 2.1.1 Runtime Environment

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Node.js Version** | v18+ (currently v22) | ES2022 features, async/await |
| **Platform** | Linux/macOS (primary), Windows (secondary) | POSIX daemon behavior |
| **File System** | Support for `fs.watch()` | Native file system events |

### 2.1.2 File System Constraints

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Event API** | `fs.watch()` (native) | No external dependencies |
| **Future Migration** | `chokidar` (planned) | Better cross-platform consistency |
| **File Detection** | Creation events only (no modifications) | Focus on "file drops" |
| **Binary Detection** | Heuristics (null bytes, magic numbers) | No external MIME libraries |

### 2.1.3 Configuration Format

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Primary Format** | TOML | Human-readable, simple |
| **Pattern Syntax** | Gitignore-style | Familiar to developers |
| **Per-Extension** | `.ext.bucket-include` files | Modular configuration |
| **Exclusions** | `!` prefix | Standard gitignore convention |

### 2.1.4 Output Format

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Primary Format** | Obsidian Flavored Markdown | Rich features (wikilinks, callouts) |
| **Error Output** | `.error` files | Persistent error tracking |
| **Frontmatter** | YAML | Standard markdown metadata |
| **Wikilinks** | `[[Link]]` syntax | Obsidian native linking |

---

## 2.2 Operational Constraints

### 2.2.1 Deployment Environment

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Installation** | npm/yarn/pnpm | Standard Node.js packaging |
| **Daemon Mode** | POSIX-compliant fork | Background operation |
| **PID Management** | File-based PID storage | Simple, standard |
| **Logging** | Console (foreground), file (daemon) | Standard practice |

### 2.2.2 Performance Constraints

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Detection Latency** | < 1 second | Real-time monitoring |
| **File Display** | < 500ms for files < 1MB | Responsiveness |
| **Concurrent Directories** | 10+ (target 50+) | Scalability |
| **File Size** | No hard limit (practical limits apply) | Flexibility |

### 2.2.3 Reliability Constraints

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Error Handling** | Graceful degradation (no crashes) | Production stability |
| **File Access Errors** | Log and skip | Prevent blocking |
| **Watcher Errors** | Log and continue | Resilience |
| **Memory Leaks** | None over extended runtime | Long-running daemon |

---

## 2.3 Organizational Constraints

### 2.3.1 Project Constraints

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **License** | MIT | Open source, permissive |
| **Repository** | GitHub | Standard collaboration |
| **Documentation** | Arc42 + C4 Model | Professional architecture docs |
| **Branching** | Git flow (feature branches) | Standard practice |

### 2.3.2 Documentation Constraints

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Template** | Arc42 | Structured architecture docs |
| **Diagrams** | C4 Model (Mermaid) | Clear abstraction levels |
| **Format** | Markdown | Version control friendly |
| **Location** | `/docs` directory | Standard practice |

---

## 2.4 Security Constraints

### 2.4.1 File Access

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Permission Checks** | Read only (no writes to watched dirs) | Safety |
| **Path Traversal** | Resolved paths (no `../`) | Security |
| **Symbolic Links** | Not followed | Prevent infinite loops |
| **Arbitrary Code** | No code execution from files | Security |

### 2.4.2 Configuration

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **TOML Parsing** | Safe parsing (no `eval`) | Security |
| **Pattern Validation** | Basic validation (no arbitrary regex) | Safety |
| **No Remote Config** | Local files only | Security |

---

## 2.5 Integration Constraints

### 2.5.1 Future Integrations

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **Web UI** | Planned (not implemented) | Future feature |
| **Notifications** | Slack/email (planned) | Future feature |
| **API** | REST endpoint (planned) | Future feature |
| **Database** | File history (planned) | Future feature |

### 2.5.2 External Dependencies

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **MVP Phase** | Minimal (only standard lib) | Simplicity |
| **Future** | chokidar (file watching), winston (logging) | Enhanced features |
| **Optional** | commander (CLI parsing), express (web UI) | Convenience |

---

## 2.6 Evolution Constraints

### 2.6.1 Backward Compatibility

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **TOML Format** | Stable (breaking changes only for major versions) | Stability |
| **CLI Arguments** | Stable (additive only) | Usability |
| **Output Format** | Markdown is stable | Compatibility |

### 2.6.2 Migration Paths

| Migration | Path | Status |
|-----------|------|--------|
| `fs.watch()` → `chokidar` | Drop-in replacement (future) | Planned |
| Console → File Logging | Configurable log level | Planned |
| Single File → Modular Config | Existing `.bucket-include` remains compatible | Implemented |

---

## 2.7 Compliance and Regulatory Constraints

### 2.7.1 Open Source Compliance

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **License** | MIT (permissive) | Ease of use |
| **Attribution** | Preserve license notices | Legal requirement |
| **Dependencies** | MIT-compatible licenses | Legal clarity |

### 2.7.2 Data Privacy

| Constraint | Details | Rationale |
|------------|---------|-----------|
| **No Data Exfiltration** | Files processed locally | Privacy |
| **No Telemetry** | No analytics collection | Privacy |
| **Local-Only Operation** | No network calls | Security |

---

## 2.8 Summary of Constraints

| Category | Critical Constraints | Impact |
|----------|---------------------|--------|
| **Technical** | Node.js v18+, `fs.watch()`, TOML | Foundation |
| **Operational** | POSIX daemon, performance targets | Usability |
| **Organizational** | MIT license, arc42 documentation | Maintainability |
| **Security** | Read-only access, no code execution | Safety |
| **Evolution** | Backward compatibility, migration paths | Longevity |

---

**Previous:** [arc42-01: Introduction and Goals](./arc42-01-introduction-and-goals.md)
**Next:** [arc42-03: System Context](./arc42-03-system-context.md)
