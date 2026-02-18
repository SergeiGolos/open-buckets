# Open Buckets

**Context Builder and Directory Watcher** - Watch directories and automatically build comprehensive context when files are dropped.

## Features

- 📁 **Watch Multiple Directories** - Monitor any number of directories for file drops
- 🎯 **Gitignore-Style Configuration** - Simple, familiar pattern matching
- 📦 **File-Type Skills** - Per-extension rules via `{ext}.bucket-include` files
- 🔍 **Directory Grep** - Search directories for specific patterns
- 📝 **Obsidian-Style Output** - Clean, markdown-formatted context
- 🛡️ **Error Handling** - Automatic `.error` file creation on failures
- 👥 **Global & Local Configs** - Profile system with overrides
- 🤖 **Daemon Mode** - Run in background with PID management

## Installation

```bash
git clone https://github.com/SergeiGolos/open-buckets.git
cd open-buckets
npm install
```

## Usage

### Basic Usage

```bash
node src/index.js --watch ./incoming
```

### Watch Multiple Directories

```bash
node src/index.js --watch ./incoming --watch ./processed --watch ./uploads
```

### Daemon Mode

```bash
node src/index.js --daemon --watch ./uploads
```

## Configuration

### Gitignore-Style Patterns

Create `.bucket-include` in your project:

```gitignore
# Include patterns (no prefix = include)
src/**/*.js
docs/**/*.md

# Exclude patterns (prefix with !)
!node_modules/**
!dist/**
!*.test.js
```

### Directory Grep

Search directories for specific patterns:

```gitignore
# [dirs:path] sections define grep patterns
[dirs:./configs]
error
debug
TODO

[dirs:./templates]
FIXME
HACK
```

### File-Type Skills

Create per-extension skill files:

- `.js.bucket-include` - Rules for JavaScript files
- `.py.bucket-include` - Rules for Python files
- `.md.bucket-include` - Rules for Markdown files

Skills override base config for their file type.

### Global Config

Place global config in `~/.config/open-buckets/.bucket-include`:

```bash
mkdir -p ~/.config/open-buckets
cat > ~/.config/open-buckets/.bucket-include << 'EOF'
# Global rules for all projects
!node_modules/**
!dist/**
EOF
```

Local configs override global rules.

## Output Format

When a file is dropped, Open Buckets builds context:

```markdown
# File: test.js
# Directory: /path/to/watch
# Size: 1.2 KB
# Timestamp: 2026-02-18T05:00:00Z

## Content
```javascript
const x = 1;
console.log(x);
```

## Related Context
*Total files: 15*
*Total size: 45.2 KB*

- `src/main.js` (2.1 KB)
- `src/utils.js` (1.5 KB)
- ...

## Grep Results
*Total matches: 7*

### `src/config.js`
Line 15: `console.error("Error")`

...
```

## Error Handling

On processing failure, a `.error` file is created:

```markdown
# Error Processing File
File: test.js
Path: /path/to/test.js
Timestamp: 2026-02-18T05:00:00Z

## Error

```
Cannot parse file: Invalid syntax
```

## Original File Content
```javascript
const x = 1;
```
```

## Project Structure

```
open-buckets/
├── src/
│   ├── index.js           # Main CLI entry point
│   ├── watcher/          # Directory watching logic
│   ├── processor/        # File processing and context building
│   ├── context-builder/   # Context collection and formatting
│   └── config/          # Configuration parser and manager
├── docs/
│   ├── adr/             # Architecture Decision Records
│   └── prd/            # Product Requirements Documents
├── .bucket-include      # Project configuration
├── .bucket-include.example  # Example configuration
└── .{ext}.bucket-include  # File-type specific skills
```

## Examples

### Example 1: Node.js Project

```gitignore
# .bucket-include
src/**/*.js
lib/**/*.js
!node_modules/**
!dist/**
!*.test.js

[dirs:./src]
TODO
FIXME

[dirs:./test]
describe
it
```

### Example 2: Python Project

```gitignore
# .bucket-include
src/**/*.py
tests/**/*.py
requirements.txt
!__pycache__/**
!*.pyc

[dirs:./src]
import
class
def

[dirs:./tests]
assert
mock
```

### Example 3: Documentation Project

```gitignore
# .bucket-include
docs/**/*.md
README.md
!docs/draft/**

[dirs:./docs]
TODO
FIXME
WIP
```

## Architecture Decisions

- [ADR-001](docs/adr/001-architecture-overview.md) - Initial Architecture
- [ADR-002](docs/adr/002-context-builder.md) - Context Builder (superseded)
- [ADR-003](docs/adr/003-gitignore-config.md) - Gitignore-Style Configuration

## License

MIT
