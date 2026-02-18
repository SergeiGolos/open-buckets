# PRD-001: Product Requirements - Open Buckets

**Status:** Draft
**Version:** 0.1
**Date:** 2026-02-18

## Overview

Open Buckets is a directory monitoring tool that watches for file drops and displays text-based file contents to the screen. It supports running as a daemon for background monitoring.

## Problem Statement

Users need a way to monitor multiple directories for new files and automatically inspect text-based file contents without manual intervention. This is useful for:
- Debugging file-based workflows
- Monitoring log directories
- Watching for document uploads
- Automated file processing pipelines

## Target Users

- Developers debugging file-based systems
- System administrators monitoring log directories
- QA teams testing file upload workflows
- Data pipeline engineers

## User Stories

### MVP

**US-1: Watch Single Directory**
> As a developer, I want to watch a single directory so that I can see when files are dropped into it.

**US-2: Identify Source Directory**
> As a developer, I want to know which directory a file came from so that I can differentiate between multiple watch points.

**US-3: Display Text Files**
> As a developer, I want to see the contents of text files when they are dropped so that I can immediately inspect them.

**US-4: Run as Daemon**
> As a system administrator, I want to run the watcher as a daemon so that it can continue monitoring in the background.

### Post-MVP

**US-5: Watch Multiple Directories**
> As a developer, I want to watch multiple directories simultaneously so that I can monitor several locations at once.

**US-6: Configuration File**
> As a user, I want to specify watched directories in a config file so that I don't have to type them every time.

**US-7: File Filtering**
> As a developer, I want to filter files by extension or pattern so that I only see relevant files.

**US-8: Logging**
> As a system administrator, I want logs written to a file so that I can debug issues in daemon mode.

**US-9: Web Dashboard**
> As a user, I want a web UI to see recent file drops so that I don't have to watch the console.

**US-10: Notifications**
> As a user, I want to receive notifications when specific types of files are dropped.

## Functional Requirements

### FR-1: Directory Watching
- The system shall watch one or more directories for file system events
- The system shall detect file creation events
- The system shall identify the source directory for each file event
- The system shall handle nested directory structure appropriately

### FR-2: File Processing
- The system shall determine if a file is text-based
- The system shall read the contents of text-based files
- The system shall display file contents to the console
- The system shall handle binary files gracefully (skip or indicate not text)

### FR-3: Daemon Mode
- The system shall support running as a background daemon
- The system shall manage a PID file
- The system shall respond to SIGTERM and SIGINT signals
- The system shall provide status checking capability

### FR-4: Configuration
- The system shall accept directory paths via command-line arguments
- The system shall support reading directories from a config file
- The system shall provide default behavior when no directories specified

## Non-Functional Requirements

### NFR-1: Performance
- File detection latency < 1 second
- Small files (< 1MB) displayed within 500ms
- Support for at least 10 concurrent directory watchers

### NFR-2: Reliability
- Handle file read errors gracefully without crashing
- Recover from temporary file system issues
- No memory leaks over extended runtime

### NFR-3: Usability
- Clear command-line interface
- Helpful error messages
- Progress indicators for long operations

### NFR-4: Maintainability
- Modular code structure
- Clear separation of concerns
- Automated tests for critical paths

## Technical Constraints

- Must run on Node.js (v18+)
- Cross-platform support (Linux, macOS, Windows)
- Minimal external dependencies for MVP
- Standard POSIX daemon behavior

## Open Questions

### Requirements Clarification

1. **File Size Limits:**
   - What is the maximum file size to display? (1MB, 10MB, unlimited?)
   - Should large files be truncated or show an error?

2. **File Type Detection:**
   - How do we define "text-based"?
   - Use MIME types? File extensions? Content inspection?
   - What about files with no extension?

3. **Event Granularity:**
   - React to file creation only? Also modifications?
   - Handle file moves/renames?
   - How about temporary files (`.swp`, `~`)?

4. **Concurrent File Handling:**
   - How to handle rapid file drops (10+ files/second)?
   - Queue them up? Process in parallel?
   - Any limits on concurrent processing?

5. **Configuration Preferences:**
   - CLI flags vs config file priority?
   - YAML, JSON, or TOML for config?
   - Should config support hot-reload?

6. **Output Formatting:**
   - Simple text output? Structured (JSON)?
   - Include timestamps? File metadata?
   - Color coding by directory?
   - Separator between files?

7. **Daemon Specifics:**
   - Where should PID file live? (`/var/run`? `./`?)
   - Log file location?
   - Auto-restart on crash?
   - User/group for daemon process?

8. **Error Handling:**
   - Permission denied on directory read - what to do?
   - Directory deleted while watching - what to do?
   - Disk full - how to handle?

9. **Testing Strategy:**
   - How to test file watching in CI?
   - Need for test fixtures?
   - Integration test scenarios?

10. **Future Roadmap:**
    - Web UI priority?
    - Notification systems (email, Slack, etc.)?
    - File processing pipeline triggers?
    - Database integration for history?

## Success Metrics

- **MVP:**
  - Successfully watch and display files from at least 3 directories
  - Daemon mode runs for 24+ hours without crash
  - < 1 second latency for file detection

- **Post-MVP:**
  - Support for 50+ directories
  - Web dashboard with 100ms refresh
  - 99.9% uptime in daemon mode

## Dependencies

### MVP Dependencies
- Node.js (v18+)
- npm/yarn/pnpm

### Potential Future Dependencies
- `chokidar` - Robust file watching
- `commander` - CLI argument parsing
- `daemonize2` - Daemon process management
- `winston` - Logging
- `express` - Web dashboard
- `socket.io` - Real-time updates

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `fs.watch()` platform inconsistency | High | Test on all platforms, consider chokidar |
| High file load causing slowdown | Medium | Implement queue, rate limiting |
| Daemon mode complexity | Medium | Start simple, add features incrementally |
| Binary file detection false positives | Low | Multiple detection methods, fallback |

## Timeline

**Sprint 1 (Week 1):** MVP - Single directory watcher with display
**Sprint 2 (Week 2):** Multi-directory + daemon mode
**Sprint 3 (Week 3):** Configuration layer + error handling
**Sprint 4 (Week 4):** Testing + documentation + polish

## Appendix

### Example Usage Scenarios

**Scenario 1: Debugging File Upload**
```
$ open-buckets --watch ./uploads
File dropped in ./uploads: report.pdf (binary, skipped)
File dropped in ./uploads: metadata.json
{"name": "report.pdf", "size": 1234567, "uploaded": "2026-02-18T04:23:00Z"}
```

**Scenario 2: Monitoring Logs**
```
$ open-buckets --daemon --watch /var/log/myapp
[INFO] Daemon started (PID: 12345)
[INFO] Watching /var/log/myapp
[2026-02-18 04:23:45] File dropped: /var/log/myapp/error.log
ERROR: Connection timeout
ERROR: Retry attempt 1...
```

**Scenario 3: Multiple Directories**
```
$ open-buckets --watch ./incoming --watch ./processed --watch ./failed
File dropped in ./incoming: order-001.json
File dropped in ./processed: order-001.json
File dropped in ./failed: order-002.json
```
