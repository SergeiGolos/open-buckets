# ADR-001: Architecture Overview

**Status:** Draft
**Date:** 2026-02-18
**Deciders:** TBD

## Context

Open Buckets is a Node.js application that needs to monitor multiple directories for file drops. When a file is detected, the system should:
1. Identify which directory the file was dropped in
2. Determine if the file is text-based
3. Display the file contents to the screen
4. Support running as a daemon

## Decision

**Architecture Pattern:** Event-Driven with fs.watch()

### Core Components

1. **Watcher Service** - Manages directory watchers
   - Uses Node.js `fs.watch()` API
   - Maintains a map of directory → watcher
   - Handles file detection events

2. **File Processor** - Analyzes and displays files
   - Detects file type (text vs binary)
   - Reads file contents
   - Outputs to console/stdout

3. **Daemon Manager** - Handles daemon mode
   - Forks process for background execution
   - Manages PID file
   - Handles signals (SIGTERM, SIGINT)

### Technology Choices

- **Runtime:** Node.js (v22+ available)
- **File Watching:** Native `fs.watch()` (no external dependencies initially)
- **Daemon:** `daemonize2` or custom implementation

## Alternatives Considered

### Alternative 1: chokidar
- **Pros:** More robust cross-platform file watching
- **Cons:** External dependency, heavier
- **Decision:** Start with native `fs.watch()`, migrate to chokidar if needed

### Alternative 2: Polling
- **Pros:** Works everywhere
- **Cons:** Inefficient, higher latency
- **Decision:** Rejected - event-based is more efficient

## Open Questions

1. [ ] **File Type Detection:** How to reliably detect text files?
   - Use `file-type` package?
   - Magic number detection?
   - Extension-based?
   - Attempt UTF-8 decode and fallback?

2. [ ] **Concurrent File Drops:** How to handle rapid file drops?
   - Queue processing?
   - Debounce events?
   - Process immediately?

3. [ ] **Configuration:** How to specify watched directories?
   - Command-line arguments?
   - Config file (JSON/YAML)?
   - Environment variables?
   - Interactive setup?

4. [ ] **Error Handling:** What happens on file read errors?
   - Skip silently?
   - Log error?
   - Retry?

5. [ ] **File Size Limits:** Should there be a max file size for display?
   - What limit (1MB, 10MB, 100MB)?
   - Truncate large files?
   - Show error instead?

6. [ ] **Output Format:** How should text files be displayed?
   - Raw content?
   - With file metadata (name, size, path)?
   - With delimiters?
   - Color-coded by directory?

7. [ ] **Daemon Logging:** Where do daemon logs go?
   - System log (syslog)?
   - Log file in project?
   - Configurable location?
   - Discard (console only)?

8. [ **Directory Structure:** Can watched directories be nested?
   - Prevent nested watching?
   - Allow but dedupe events?
   - Configurable behavior?

9. [ ] **File Modification:** Should we react to file modifications or only new files?
   - Only new files (created event)?
   - Include modifications (changed event)?
   - Both?

10. [ ] **Daemon PID Management:**
    - PID file location?
    - Auto-start on boot?
    - Status command?

## Next Steps

1. [ ] Implement basic watcher with single directory
2. [ ] Add multi-directory support
3. [ ] Implement file type detection
4. [ ] Add daemon mode
5. [ ] Add configuration layer
6. [ ] Add tests

## References

- Node.js fs.watch() documentation
- Daemon patterns in Node.js
