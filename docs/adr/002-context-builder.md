# ADR-002: Context Builder Feature

**Status:** Draft
**Date:** 2026-02-18

## Context

Open Buckets needs to evolve from a simple file watcher to a **context builder**. When a file is dropped, the system should:

1. Read `.bucket-include` configuration files (local and global)
2. Collect related files based on include/exclude patterns
3. Search directories for relevant content using grep
4. Build a comprehensive context bundle for the dropped file

## Decision

**Configuration Layer:** `.bucket-include` file with TOML or JSON format

### File Format (TOML preferred for readability)

```toml
# .bucket-include
[context]
name = "Project Context"

[include]
# Glob patterns for files to include in context
patterns = [
    "src/**/*.js",
    "docs/**/*.md",
    "package.json",
    "tsconfig.json"
]

[exclude]
# Glob patterns to exclude
patterns = [
    "node_modules/**",
    "dist/**",
    "*.test.js",
    "*.spec.ts"
]

[directories]
# Directories to grep through for relevant content
paths = [
    "./configs",
    "./templates"
]

[directories.patterns]
# grep patterns for each directory
"./configs" = ["error", "debug", "warning"]
"./templates" = ["TODO", "FIXME", "HACK"]
```

### Configuration Priority

1. **Local** `.bucket-include` in working directory (highest priority)
2. **Global** `~/.config/open-buckets/.bucket-include` (fallback)
3. **Default** minimal context if no config exists

### Context Building Process

When a file is dropped:

1. **Parse Configuration**
   - Load local `.bucket-include` (if exists)
   - Load global `.bucket-include` (if local doesn't exist or to merge)
   - Merge with local taking precedence

2. **Collect Files**
   - Scan filesystem for files matching `include.patterns`
   - Exclude files matching `exclude.patterns`
   - Limit results (e.g., 100 files max, 10MB total)

3. **Grep Directories**
   - For each directory in `directories.paths`
   - Search for patterns in `directories.patterns.[dir]`
   - Collect matching lines with file context

4. **Build Context**
   - Main dropped file (with metadata)
   - Related files (from include patterns)
   - Grep results (from directory searches)
   - Summary of sources

## Technology Choices

- **Config Format:** TOML (via `@iarna/toml`) - human-readable, supports comments
- **Glob Matching:** `fast-glob` - faster than glob, supports exclusion
- **Grep:** `ripgrep` (rg) via child_process if available, fallback to `grep`
- **File Limiting:** `glob-gitignore` style patterns

## Alternatives Considered

### Alternative 1: JSON Config
- **Pros:** Native Node.js support
- **Cons:** No comments, verbose
- **Decision:** Use TOML for better readability

### Alternative 2: YAML Config
- **Pros:** Popular, readable
- **Cons:** Requires parser, ambiguity issues
- **Decision:** TOML is simpler and more explicit

### Alternative 3: No Configuration, Auto-Discovery
- **Pros:** Zero config
- **Cons:** Unpredictable results, heavy scanning
- **Decision:** Explicit configuration is better for context building

## Open Questions

1. **Context Size Limits:**
   - Maximum number of files to include? (100, 500, unlimited?)
   - Maximum total size? (10MB, 50MB, 100MB?)
   - How to prioritize when limits hit?

2. **Grep Behavior:**
   - Case-sensitive or insensitive search?
   - Show N lines before/after matches? (2, 5, 10?)
   - Limit results per pattern? (10, 50, 100?)

3. **Directory Grep Strategy:**
   - Recursive or single-level?
   - File type filtering (text files only)?
   - How to handle binary files in grep results?

4. **Merge Strategy:**
   - How to merge local + global configs?
   - Append patterns? Replace? Intersection?
   - Warn on conflicts?

5. **Cache:**
   - Should file listings be cached between drops?
   - Cache duration? (1min, 5min, until config changes?)
   - Invalidate on config change?

6. **Context Presentation:**
   - Order of sections in output?
   - Delimiters between sections?
   - Include file paths/line numbers?

7. **File Type Handling:**
   - Skip binary files automatically?
   - Detect and warn about large files?
   - Handle symlinks?

8. **Profile Directory Location:**
   - `~/.config/open-buckets/` (XDG spec)?
   - `~/.open-buckets/` (legacy)?
   - Support both?

9. **Error Handling:**
   - Invalid config syntax - error or warning?
   - Missing directories - skip or fail?
   - Permission denied - log error or ignore?

10. **Performance:**
    - Large codebases (10K+ files) - how to handle?
    - Config reload on each drop or watch config file?
    - Parallel file reading?

## Implementation Plan

1. **Phase 1:** Config Parser
   - Parse `.bucket-include` (TOML)
   - Merge local + global configs
   - Validate patterns

2. **Phase 2:** File Collector
   - Glob-based file discovery
   - Include/exclude filtering
   - Size/limit enforcement

3. **Phase 3:** Directory Grep
   - Implement ripgrep wrapper
   - Fallback to grep
   - Pattern matching with context

4. **Phase 4:** Context Builder
   - Assemble all components
   - Format output
   - Add metadata

5. **Phase 5:** Integration
   - Connect to watcher
   - Test with various configs
   - Performance optimization

## Next Steps

1. [ ] Implement config parser (TOML)
2. [ ] Add file collector with glob patterns
3. [ ] Implement directory grep functionality
4. [ ] Build context assembler
5. [ ] Update CLI to show context summary
6. [ ] Add tests
