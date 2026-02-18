# arc42-05: Runtime View

## 5.1 Overview

This section describes the dynamic behavior and runtime aspects of Open Buckets, including:
- Component-level interactions (C4 Level 3)
- Sequence diagrams for key workflows
- Concurrency and threading model
- Event-driven architecture

---

## 5.2 C4 Level 3: Component Diagram

### 5.2.1 Component View (Watcher Service)

```mermaid
C4Component
  title Component View - Watcher Service

  Container(watcher_service, "Watcher Service", "Directory monitoring")

  Component(event_listener, "Event Listener", "fs.watch() wrapper", "Receives file system events")
  Component(event_debouncer, "Event Debouncer", "Delay mechanism", "100ms delay for file writes")
  Component(event_router, "Event Router", "Event dispatcher", "Routes events to processors")
  Component(directory_registry, "Directory Registry", "Map of directories", "Maintains watcher instances")

  Rel(event_listener, event_debouncer, "Sends raw events", "eventType, filename")
  Rel(event_debouncer, event_router, "Sends debounced events", "filePath, dir")
  Rel(event_router, directory_registry, "Queries directory info", "directoryId")
  Rel(directory_registry, event_listener, "Manages watchers", "watcher instances")

  UpdateLayoutConfig($c4ShapeInRow="2")
```

### 5.2.2 Component View (Context Builder)

```mermaid
C4Component
  title Component View - Context Builder

  Container(context_builder, "Context Builder", "Configuration and grep")

  Component(config_parser, "Config Parser", "TOML parser", "Parses .bucket-include files")
  Component(pattern_resolver, "Pattern Resolver", "Glob resolver", "Resolves include/exclude patterns")
  Component(dir_grep_engine, "Directory Grep Engine", "Ripgrep/Grep wrapper", "Searches file contents")
  Component(context_aggregator, "Context Aggregator", "Context builder", "Combines matched files")
  Component(skill_loader, "Skill Loader", "File-type skill loader", "Loads .ext.bucket-include")

  Rel(config_parser, pattern_resolver, "Provides patterns", "include, exclude")
  Rel(pattern_resolver, dir_grep_engine, "Provides directory patterns", "dirs")
  Rel(dir_grep_engine, context_aggregator, "Returns matched files", "file paths")
  Rel(skill_loader, config_parser, "Provides per-extension config", "TOML")
  Rel(config_parser, context_aggregator, "Provides merged config", "configuration")

  UpdateLayoutConfig($c4ShapeInRow="3")
```

### 5.2.3 Component View (File Processor)

```mermaid
C4Component
  title Component View - File Processor

  Container(processor, "File Processor", "File processing and type detection")

  Component(binary_detector, "Binary Detector", "Heuristics", "Detects binary files")
  Component(content_reader, "Content Reader", "File reader", "Reads file contents")
  Component(encoder, "Encoder", "UTF-8 decoder", "Detects and decodes encoding")
  Component(output_formatter, "Output Formatter", "Console formatter", "Formats output for display")
  Component(md_generator, "Markdown Generator", "Markdown writer", "Generates Obsidian markdown")

  Rel(binary_detector, content_reader, "Detects before read", "filePath")
  Rel(content_reader, encoder, "Passes raw bytes", "buffer")
  Rel(encoder, output_formatter, "Passes decoded text", "string")
  Rel(output_formatter, md_generator, "Passes formatted text", "formatted")
  Rel(md_generator, content_reader, "Writes to disk", "markdown")

  UpdateLayoutConfig($c4ShapeInRow="2")
```

---

## 5.3 Sequence Diagrams

### 5.3.1 File Drop Processing

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant CLI as CLI Interface
  participant WS as Watcher Service
  participant PE as Pattern Engine
  participant CB as Context Builder
  participant FP as File Processor
  participant OG as Output Generator
  participant FS as File System

  User->>FS: Drop file into directory
  FS->>WS: fs.watch() event (rename)
  WS->>WS: Event Debouncer (100ms)
  WS->>FS: Check if file exists
  FS-->>WS: File exists
  WS->>PE: Filter file by patterns
  PE->>FS: Load .bucket-include
  FS-->>PE: TOML config
  PE-->>WS: File matches patterns
  WS->>CB: Build context for file
  CB->>FS: Load config and run grep
  FS-->>CB: Matched files
  CB->>PE: Process matched files
  FP->>FS: Read file contents
  FS-->>FP: File data
  FP->>FP: Detect file type (text/binary)
  FP->>OG: Generate markdown
  OG-->>FP: Obsidian markdown
  FP->>FS: Write markdown file
  User->>FS: View markdown in Obsidian
```

### 5.3.2 Daemon Startup and Operation

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant CLI as CLI Interface
  participant DM as Daemon Manager
  participant Child as Daemon Process
  participant WS as Watcher Service
  participant FS as File System

  User->>CLI: open-buckets --daemon --watch ./incoming
  CLI->>DM: start(watchCallback)
  DM->>DM: Check if already running
  DM->>DM: Fork child process
  DM->>Child: Detach and unref
  DM->>FS: Write PID file (open-buckets.pid)
  DM-->>User: Daemon started (PID: 12345)

  Note over Child: Daemon Process Running
  Child->>Child: Setup signal handlers (SIGTERM, SIGINT)
  Child->>WS: start(["/path/to/incoming"])
  WS->>FS: fs.watch() directories
  FS-->>WS: Ready to monitor

  loop File Drop Detection
    FS-->>WS: File event
    WS->>WS: Process file
  end

  User->>Child: SIGTERM (kill command)
  Child->>FS: Remove PID file
  Child->>Child: Stop watchers
  Child->>Child: Exit (0)
```

### 5.3.3 Context Building with Directory Grep

```mermaid
sequenceDiagram
  autonumber
  participant WS as Watcher Service
  participant CB as Context Builder
  participant CP as Config Parser
  participant SL as Skill Loader
  participant PR as Pattern Resolver
  participant DGE as Directory Grep Engine
  participant CA as Context Aggregator
  participant FS as File System

  WS->>CB: buildContext(directory)
  CB->>CP: Load .bucket-include
  CP->>FS: Read config file
  FS-->>CP: TOML content
  CP-->>CB: Parsed config

  alt File-Type Skill Exists
    CB->>SL: Load .ext.bucket-include
    SL->>FS: Read skill file
    FS-->>SL: TOML content
    SL-->>CB: Merged config
  end

  CB->>PR: Resolve include patterns
  PR-->>CB: Include glob patterns
  CB->>PR: Resolve exclude patterns
  PR-->>CB: Exclude glob patterns

  alt Directory Grep Configured
    CB->>DGE: grepDirectory(path, pattern)
    DGE->>DGE: Try ripgrep
    alt ripgrep available
      DGE->>FS: Execute ripgrep
      FS-->>DGE: Matched files
    else ripgrep not available
      DGE->>FS: Execute grep
      FS-->>DGE: Matched files
    end
    DGE-->>CB: Matched file paths
  end

  CB->>CA: Aggregate all matched files
  CA-->>CB: Final context
  CB-->>WS: { files, metadata, errors }
```

### 5.3.4 Error Handling Flow

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant Component as Any Component
  participant ET as Error Tracker
  participant FS as File System

  Component->>Component: Operation fails
  Component->>Component: Catch error
  Component->>Component: Build error context

  alt Error is Critical
    Component->>User: Log error to console
    Component->>User: Display error message
    Component->>Component: Continue (don't crash)
  else Error is Recoverable
    Component->>ET: trackError(error, context)
    ET->>ET: Generate error ID
    ET->>FS: Write .error file
    FS-->>ET: File written
    ET-->>Component: Error tracked
    Component->>Component: Continue processing
  end

  Note over User: User inspects .error file later
```

---

## 5.4 Concurrency Model

### 5.4.1 Threading Architecture

Open Buckets uses Node.js's **single-threaded event loop** with **asynchronous I/O**:

| Aspect | Implementation | Details |
|--------|---------------|---------|
| **Event Loop** | Node.js runtime | Single-threaded, non-blocking I/O |
| **File Watching** | `fs.watch()` callbacks | Async event emission |
| **File Reading** | `fs.readFile()` | Async streaming |
| **Pattern Matching** | Glob library (sync) | Fast, synchronous |
| **Directory Grep** | `exec('ripgrep')` | Spawned subprocess, async |
| **Daemon** | `child_process.fork()` | Separate process, async |

### 5.4.2 Concurrency Patterns

#### Pattern 1: Event-Driven File Watching

```javascript
// Single event loop handles multiple directories
watcher.on('change', (event, filename) => {
  // Async processing without blocking
  setTimeout(async () => {
    await processFile(filename);
  }, 100);
});
```

**Benefits:**
- Non-blocking file system events
- Handles multiple directories efficiently
- No thread contention

**Constraints:**
- CPU-bound operations block event loop
- Pattern matching should be fast

#### Pattern 2: Subprocess for Directory Grep

```javascript
// Spawn ripgrep subprocess (non-blocking)
const { exec } = require('child_process');
exec('rg "TODO" ./src', (error, stdout, stderr) => {
  if (error) {
    // Handle error or fallback to grep
    return;
  }
  // Process matched files
});
```

**Benefits:**
- Doesn't block event loop
- Leverages ripgrep's speed
- Parallel grep possible (multiple directories)

**Constraints:**
- Must handle subprocess lifecycle
- Fallback to built-in `grep` if ripgrep not available

#### Pattern 3: Daemon Process Fork

```javascript
// Fork child process (background execution)
const child = spawn('node', process.argv.slice(1), {
  detached: true,
  stdio: ['ignore', 'ignore', 'ignore']
});
child.unref(); // Allow parent to exit
```

**Benefits:**
- True background execution
- Independent lifecycle
- POSIX-compliant daemon behavior

**Constraints:**
- No stdio in child (log to file)
- Must manage PID file manually

---

## 5.5 State Management

### 5.5.1 In-Memory State

| Component | State | Lifetime | Persistence |
|-----------|-------|----------|-------------|
| **Watcher Service** | `watchers: Map<dir, watcher>` | Process lifetime | No |
| **Context Builder** | `configs: Map<dir, config>` | Process lifetime | No |
| **Pattern Engine** | `cache: Map<pattern, regex>` | Process lifetime | No |
| **Daemon Manager** | `pid: number` (in PID file) | Daemon lifetime | Yes (file) |

### 5.5.2 Persistent State

| State | Location | Format | Purpose |
|-------|----------|--------|---------|
| **PID** | `./open-buckets.pid` | Plain text (number) | Daemon process identification |
| **Configuration** | `.bucket-include` | TOML | Directory rules and patterns |
| **Skills** | `.ext.bucket-include` | TOML | File-type specific rules |
| **Errors** | `.error` files | JSON | Failed operation tracking |
| **Output** | `.md` files | Obsidian Markdown | Generated documentation |

### 5.5.3 State Transitions

#### Daemon Lifecycle

```
NOT_RUNNING → STARTING → RUNNING → STOPPING → NOT_RUNNING
     ↑                                        ↓
     └────────────────────────────────────────┘
              (restart on crash)
```

#### File Processing State

```
FILE_DETECTED → PATTERN_MATCH → CONTEXT_BUILD → PROCESS → OUTPUT_GENERATED
      ↓               ↓               ↓           ↓           ↓
   (ignore)     (no match)     (no files)  (binary)    (error file)
```

---

## 5.6 Performance Considerations

### 5.6.1 Bottlenecks and Optimizations

| Operation | Bottleneck | Optimization |
|-----------|------------|--------------|
| **File Detection** | Platform event latency | Use chokidar (future) |
| **Pattern Matching** | Repeated glob compilation | Cache compiled regex |
| **Directory Grep** | Scanning large directories | Limit depth, use ripgrep |
| **File Reading** | Large files (>10MB) | Stream, don't load full file |
| **Markdown Generation** | String concatenation | Use template strings |
| **Daemon Forking** | Process startup time | Keep lightweight |

### 5.6.2 Scaling Considerations

| Scale | Current Limit | Target Limit | Strategy |
|-------|---------------|--------------|----------|
| **Directories** | 10+ | 50+ | Single event loop handles many |
| **Files/Second** | ~10 | ~50 | Debounce, queue processing |
| **File Size** | ~10MB | ~100MB | Streaming, partial read |
| **Context Size** | ~100 files | ~1000 files | Pagination, incremental build |

---

## 5.7 Error Handling Strategies

### 5.7.1 Error Categories

| Category | Example | Handling Strategy |
|----------|---------|-------------------|
| **Configuration** | Invalid TOML | Log error, use empty config |
| **File System** | Permission denied | Log error, skip file |
| **File Content** | Binary file detected | Skip, log message |
| **External Tool** | ripgrep not found | Fallback to `grep` |
| **Runtime** | Uncaught exception | Log, continue if possible |

### 5.7.2 Error Recovery

**Pattern: Graceful Degradation**

```javascript
try {
  // Attempt operation
  const result = await riskyOperation();
  return result;
} catch (error) {
  // Log error
  logger.error('Operation failed', error);
  // Create .error file
  errorTracker.trackError(error, context);
  // Return fallback or continue
  return fallbackValue;
}
```

**Benefits:**
- System continues running
- User can diagnose issues later
- No data loss

---

**Previous:** [arc42-04: Building Block View](./arc42-04-building-block-view.md)
**Next:** [arc42-06: Cross-Cutting Concepts](./arc42-06-cross-cutting-concepts.md)
