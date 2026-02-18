# Open Buckets

A Node.js application for watching multiple directories and reacting to file drops.

## Features

### Core Features

- **Multi-Directory Watching** - Watch multiple directories simultaneously
- **File Drop Detection** - Detect file drops and identify the source directory
- **Text File Display** - Display text-based file contents to the screen
- **Daemon Mode** - Run in background with PID management
- **Binary Detection** - Gracefully skip binary files

### Context Builder Features

- **Gitignore-Style Patterns** - Use familiar `*`, `**`, `!` syntax for file filtering
- **File-Type Skills** - Per-extension configuration (`.js.bucket-include`, `.json.bucket-include`)
- **Directory Grep** - Select files based on content matching with `[[dirs.include]]`
- **TOML Configuration** - Human-readable `.bucket-include` configuration files
- **Obsidian Markdown Output** - Generate Obsidian-flavored markdown with wikilinks and callouts
- **Error Tracking** - Create `.error` files for failed operations

### Runner Features

- **Success Tracking** - Detailed records of successfully processed files
- **Error Tracking** - Categorized error records with context and recovery info
- **Metrics Collection** - Real-time metrics (rates, performance, quality)
- **Progress Placeholders** - Auto-generated run summaries, context trees, metrics snapshots

## Installation

```bash
npm install
```

## Usage

### Basic Usage - Watch a Single Directory

```bash
node src/index.js --watch ./incoming
```

### Watch Multiple Directories

```bash
node src/index.js --watch ./incoming --watch ./processed --watch ./uploads
```

### Daemon Mode

Run in the background as a daemon:

```bash
node src/index.js --daemon --watch ./uploads
```

The daemon will write its PID to `open-buckets.pid` in the current directory.

### Stopping the Daemon

```bash
# Using the PID file
kill $(cat open-buckets.pid)

# Or find and kill manually
ps aux | grep "open-buckets" | grep -v grep
```

## Output Format

When a file is detected, Open Buckets displays:

```
================================================================================
File dropped: test.txt
Watch directory: /path/to/incoming
Full path: /path/to/incoming/test.txt
Size: 45 B
Detected at: 2026-02-18T04:23:45.123Z

Content (text file):
----------------------------------------
Hello, World! This is a test file.
----------------------------------------
[END OF FILE]
================================================================================
```

Binary files are detected and skipped with a `[BINARY FILE - Skipped]` message.

## Configuration

### Bucket Include Files

Create a `.bucket-include` file in any watched directory to configure behavior:

```toml
# Include patterns
[include]
patterns = ["*.js", "*.json", "docs/*.md"]

# Exclude patterns (negation with !)
[exclude]
patterns = ["*.min.js", "node_modules/**", "**/*.test.js"]

# Directory grep - include files matching content
[[dirs.include]]
path = "./src"
content_match = "TODO|FIXME|HACK"

# Directory grep - exclude files matching content
[[dirs.exclude]]
path = "./tests"
content_match = "skip|ignore"
```

### File-Type Skills

Create per-extension configuration files:

**`.js.bucket-include`** (JavaScript files):
```toml
[include]
patterns = ["*.js", "*.mjs", "*.cjs"]

[exclude]
patterns = ["*.test.js", "*.spec.js", "dist/**"]

[[dirs.include]]
path = "./src"
content_match = "export|import"
```

### Pattern Syntax

| Pattern | Matches | Example |
|---------|---------|---------|
| `*` | Any characters except `/` | `*.js` → `file.js` |
| `**` | Any characters including `/` | `**/*.js` → `src/lib/file.js` |
| `?` | Single character | `file?.js` → `file1.js` |
| `!` | Exclusion (negation) | `!*.min.js` → Excludes minified files |
| `dir/` | Directory | `logs/` → Files in logs directory |

## Text File Detection

Open Buckets uses heuristics to detect text files:

- Checks for null bytes in the first 8KB
- Looks for common binary file signatures (PDF, ZIP, PNG, JPEG, ELF)
- Falls back to UTF-8 decode attempt

## Project Structure

```
open-buckets/
├── src/
│   ├── index.js           # Main CLI entry point
│   ├── watcher/          # Directory watching logic
│   ├── processor/        # File processing and display
│   └── daemon/           # Daemon mode management
├── docs/
│   ├── INDEX.md          # Documentation index
│   ├── adr/             # Architecture Decision Records
│   ├── prd/            # Product Requirements Documents
│   ├── arc42-*         # Architecture documentation (arc42 template)
│   ├── diagrams.md     # C4 model diagrams
│   ├── runner-implementation.md  # Runner architecture and tracking
│   └── placeholders/    # Output placeholder templates
└── test-buckets/        # Test directories
```

## Documentation

Comprehensive architecture documentation is available in the `docs/` directory:

### Quick Links

- **[Documentation Index](docs/INDEX.md)** - Start here for all documentation
- **[Architecture Overview](docs/adr/001-architecture-overview.md)** - High-level architecture
- **[C4 Model Diagrams](docs/diagrams.md)** - All architectural diagrams
- **[Runner Implementation](docs/runner-implementation.md)** - Runner, error tracking, metrics

### Architecture Documents (arc42)

The arc42 template provides structured architecture documentation:

1. **[Introduction and Goals](docs/arc42-01-introduction-and-goals.md)** - System overview, quality goals
2. **[Architecture Constraints](docs/arc42-02-architecture-constraints.md)** - Technical constraints
3. **[System Context](docs/arc42-03-system-context.md)** - Business context, C4 Level 1
4. **[Building Block View](docs/arc42-04-building-block-view.md)** - Container architecture, C4 Level 2
5. **[Runtime View](docs/arc42-05-runtime-view.md)** - Component architecture, C4 Level 3
6. **[Cross-Cutting Concepts](docs/arc42-06-cross-cutting-concepts.md)** - Security, logging, configuration
7. **[Architecture Decisions](docs/arc42-07-architecture-decisions.md)** - Technical decisions

### Architecture Decision Records (ADRs)

- **[ADR-001: Architecture Overview](docs/adr/001-architecture-overview.md)** - Initial architecture decisions
- **[ADR-002: Context Builder](docs/adr/002-context-builder.md)** - Context building implementation
- **[ADR-003: Gitignore-Style Config](docs/adr/003-gitignore-style-config.md)** - Configuration format

### Product Requirements

- **[PRD-001: Product Requirements](docs/prd/001-product-requirements.md)** - Features, user stories, roadmap

## Development

```bash
# Start with test directories
node src/index.js --watch ./test-buckets/incoming --watch ./test-buckets/processed

# Test with a file drop
echo "Test content" > ./test-buckets/incoming/test.txt
```

## Notes

- File detection has a small delay (100ms) to ensure files are fully written
- Symbolic links are not followed
- Only file creation events trigger processing (not modifications)
- Daemon mode detaches completely (no stdout/stderr after startup)

## Roadmap

See `docs/prd/001-product-requirements.md` for planned features.

## License

MIT
