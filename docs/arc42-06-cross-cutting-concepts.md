# arc42-06: Cross-Cutting Concepts

## 6.1 Overview

This section describes overarching, architectural principles and concepts that apply across the entire Open Buckets system.

---

## 6.2 Architecture Principles

### 6.2.1 Core Principles

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Event-Driven** | React to file system events asynchronously | `fs.watch()` callbacks, event debouncing |
| **Separation of Concerns** | Clear boundaries between containers | Modular architecture, single responsibility |
| **Configuration as Code** | Patterns and rules in TOML files | `.bucket-include` as versionable config |
| **Fail-Safe** | Never crash on bad input | Graceful error handling, `.error` files |
| **Extensibility** | Easy to add new patterns and outputs | Plugin-like skill system |

---

## 6.3 Access Control and Security

### 6.3.1 File System Security

| Aspect | Policy | Implementation |
|--------|--------|----------------|
| **Read-Only Access** | Never write to watched directories | No write operations in watcher paths |
| **Path Traversal Prevention** | Resolve paths, block `../` | `path.resolve()` with validation |
| **Symbolic Links** | Do not follow symlinks | `fs.lstat()` instead of `fs.stat()` |
| **Permission Checks** | Validate access before operations | `fs.access()` or catch errors |
| **Arbitrary Code** | No code execution from files | Text detection only, no `eval()` |

### 6.3.2 Configuration Security

| Aspect | Policy | Implementation |
|--------|--------|----------------|
| **Safe TOML Parsing** | No `eval`, use strict parser | `toml` library with validation |
| **Pattern Validation** | Basic regex validation | Block dangerous patterns (e.g., `.*`) |
| **No Remote Config** | Only local files | No network calls for config |
| **Privilege Separation** | Daemon runs as user | No sudo or elevated privileges |

---

## 6.4 Logging and Monitoring

### 6.4.1 Logging Strategy

| Level | When to Use | Examples |
|-------|-------------|----------|
| **ERROR** | Failures requiring attention | File read errors, invalid config |
| **WARN** | Recoverable issues | Pattern failed, ripgrep not found |
| **INFO** | Normal operation | Directory watched, file processed |
| **DEBUG** | Detailed diagnostics (future) | Event details, pattern matching |

### 6.4.2 Log Destinations

| Mode | Destination | Details |
|------|-------------|---------|
| **Foreground** | Console (stdout/stderr) | User sees output in real-time |
| **Daemon** | Log file (future) | `open-buckets.log` |
| **Errors** | `.error` files | Persistent error tracking |

### 6.4.3 Error File Format

```json
{
  "errorId": "ERR-2026-02-18-042345-001",
  "timestamp": "2026-02-18T04:23:45.123Z",
  "severity": "ERROR",
  "component": "Context Builder",
  "error": "Invalid TOML configuration",
  "file": "/path/to/.bucket-include",
  "line": 5,
  "column": 3,
  "details": "Expected string, got integer",
  "stack": "Error: ...\n    at ..."
}
```

---

## 6.5 Configuration Management

### 6.5.1 Configuration Hierarchy

```
1. Global config: ~/.open-buckets/config.toml (future)
2. Project config: .open-buckets/config.toml (future)
3. Directory config: .bucket-include
4. File-type skill: .ext.bucket-include
```

### 6.5.2 Configuration Format (TOML)

**Basic Structure:**

```toml
# Include patterns
[include]
patterns = ["*.js", "*.json", "docs/*.md"]

# Exclude patterns
[exclude]
patterns = ["*.min.js", "node_modules/**", "**/*.test.js"]

# Directory grep - include files matching content
[[dirs.include]]
path = "./src"
content_match = "TODO|FIXME|HACK"

[[dirs.include]]
path = "./docs"
content_match = "API|REST|GraphQL"

# Directory grep - exclude files matching content
[[dirs.exclude]]
path = "./tests"
content_match = "skip|ignore|wip"
```

**File-Type Skill Example (`.js.bucket-include`):**

```toml
[include]
patterns = ["*.js", "*.mjs", "*.cjs"]

[exclude]
patterns = ["*.test.js", "*.spec.js", "*.mock.js", "dist/**"]

[[dirs.include]]
path = "./src"
content_match = "export|import"

[[dirs.exclude]]
path = "./node_modules"
content_match = "skip"
```

### 6.5.3 Pattern Syntax

| Pattern | Matches | Example |
|---------|---------|---------|
| `*` | Any characters except `/` | `*.js` → `file.js`, `test.js` |
| `**` | Any characters including `/` | `**/*.js` → `src/file.js`, `src/lib/test.js` |
| `?` | Single character | `file?.js` → `file1.js`, `fileA.js` |
| `!` | Exclusion (negation) | `!*.min.js` → Excludes `test.min.js` |
| `dir/` | Directory | `logs/` → Matches `logs/file.log` |
| `**/*` | All files in tree | `src/**/*` → All files in `src/` |

---

## 6.6 Error Handling Framework

### 6.6.1 Error Types

| Type | Category | Recovery |
|------|----------|----------|
| `ConfigError` | Configuration | Use default config |
| `FileAccessError` | File system | Skip file, log error |
| `PatternError` | Pattern matching | Skip pattern, log warning |
| `BinaryFileError` | File content | Skip file (expected) |
| `ExternalToolError` | External tools | Fallback or error |

### 6.6.2 Error Handling Pattern

```javascript
// Standard error handling pattern
async function safeOperation(input) {
  try {
    // Validate input
    if (!isValid(input)) {
      throw new Error(`Invalid input: ${input}`);
    }

    // Execute operation
    const result = await execute(input);

    // Return result
    return result;

  } catch (error) {
    // Log error
    logger.error('Operation failed', error);

    // Track error
    errorTracker.trackError(error, { input });

    // Return fallback or rethrow
    if (isRecoverable(error)) {
      return fallbackValue;
    } else {
      throw error;
    }
  }
}
```

### 6.6.3 Error Tracking

**Metrics to Track:**
- Error count by component
- Error frequency over time
- Error types distribution
- Failed operations (with context)

**Output:**
- `.error` files in relevant directories
- Summary report (future)
- Dashboard (future)

---

## 6.7 Performance Optimization

### 6.7.1 Caching Strategy

| Cache | Content | TTL | Invalidated By |
|-------|---------|-----|---------------|
| **Pattern Regex** | Compiled glob patterns | Process lifetime | None |
| **Config Files** | Parsed TOML | Process lifetime | File modification |
| **Directory Listing** | File paths in directory | 5 seconds | File events |
| **Grep Results** | Content-matched files | 30 seconds | File changes |

### 6.7.2 Debouncing

**File Drop Debouncing:**
- Delay: 100ms
- Purpose: Ensure file is fully written
- Implementation: `setTimeout()` with cancellation

**Config Reload Debouncing:**
- Delay: 1 second
- Purpose: Avoid reloading on rapid edits
- Implementation: Debounce on file change events

### 6.7.3 Streaming

**Large File Handling:**
- Don't load entire file into memory
- Use `fs.createReadStream()`
- Process in chunks (e.g., 8KB)

**Example:**
```javascript
const stream = fs.createReadStream(filePath);
stream.on('data', (chunk) => {
  // Process chunk
});
stream.on('end', () => {
  // File complete
});
```

---

## 6.8 Extension Points

### 6.8.1 File-Type Skills

**Purpose:** Extend behavior for specific file types

**Location:** `.ext.bucket-include` (e.g., `.js.bucket-include`)

**Configuration Options:**
- Include/exclude patterns
- Directory grep rules
- Custom processing (future)

**Example:**
```toml
[include]
patterns = ["*.ts", "*.tsx"]

[exclude]
patterns = ["*.d.ts", "*.test.ts"]

[[dirs.include]]
path = "./src"
content_match = "interface|type|enum"

[[dirs.exclude]]
path = "./dist"
content_match = "skip"
```

### 6.8.2 Output Formatters (Future)

**Current:** Obsidian Flavored Markdown

**Future Formatters:**
- Plain text
- JSON
- HTML
- Custom templates

**Interface:**
```javascript
interface OutputFormatter {
  format(file, context): string;
  extension(): string;
}
```

### 6.6.3 Pattern Matchers (Future)

**Current:** Gitignore-style globs

**Future Matchers:**
- Regular expressions
- Custom functions
- External tools (e.g., `find`)

---

## 6.9 Testing Strategy

### 6.9.1 Unit Tests (Future)

**Coverage:**
- Pattern matching logic
- Configuration parsing
- File type detection
- Markdown generation

**Framework:** Jest or Mocha

### 6.9.2 Integration Tests (Future)

**Scenarios:**
- File drop in watched directory
- Pattern filtering
- Directory grep
- Daemon lifecycle

**Tools:** Supertest, tmp directory fixtures

### 6.9.3 End-to-End Tests (Future)

**Workflows:**
- Complete file processing pipeline
- Error recovery
- Performance benchmarks

---

## 6.10 Deployment Considerations

### 6.10.1 Installation

**Methods:**
```bash
# npm install
npm install open-buckets

# Global install
npm install -g open-buckets

# Local install (development)
git clone https://github.com/SergeiGolos/open-buckets
cd open-buckets
npm install
```

### 6.10.2 Systemd Service (Future)

**Service File (`/etc/systemd/system/open-buckets.service`):**

```ini
[Unit]
Description=Open Buckets Directory Monitor
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/open-buckets
ExecStart=/usr/bin/node /opt/open-buckets/src/index.js --daemon --watch /var/buckets
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Commands:**
```bash
sudo systemctl enable open-buckets
sudo systemctl start open-buckets
sudo systemctl status open-buckets
sudo journalctl -u open-buckets
```

### 6.10.3 Docker (Future)

**Dockerfile:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
ENTRYPOINT ["node", "src/index.js"]
```

**Usage:**
```bash
docker build -t open-buckets .
docker run -v /path/to/watch:/watch open-buckets --watch /watch
```

---

## 6.11 Migration Paths

### 6.11.1 Migration from MVP to Context Builder

**Breaking Changes:** None (additive)

**New Features:**
- `.bucket-include` configuration
- Gitignore-style patterns
- Directory grep
- File-type skills
- Obsidian markdown output

**Migration Steps:**
1. Add `.bucket-include` file to directories
2. Update CLI commands (optional)
3. Enjoy new features (backward compatible)

### 6.11.2 Future Migration: fs.watch() → chokidar

**Rationale:**
- Better cross-platform consistency
- More reliable event detection
- Advanced features (debouncing, throttling)

**Migration Steps:**
1. Install `chokidar`
2. Replace `fs.watch()` with `chokidar.watch()`
3. Test on all platforms
4. Update documentation

---

**Previous:** [arc42-05: Runtime View](./arc42-05-runtime-view.md)
**Next:** [arc42-07: Architecture Decisions](./arc42-07-architecture-decisions.md)
