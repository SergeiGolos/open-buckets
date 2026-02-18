# ADR-003: Gitignore-Style Configuration & File Skills

**Status:** Accepted
**Date:** 2026-02-18

## Context

Based on feedback for ADR-002, the configuration system needs to be revised:

1. **Gitignore-style patterns** - Users prefer `.gitignore` style for inclusion/exclusion
2. **File-type specific skills** - Different file types need different processing rules
3. **Error handling** - Create `.error` files when processing fails
4. **Clean output** - Obsidian-style formatting

## Decision

### Configuration Format

**Gitignore-style patterns** in `.bucket-include`:

```
# Include patterns (no prefix = include)
src/**/*.js
docs/**/*.md
*.json

# Exclude patterns (prefix with !)
!node_modules/**
!dist/**
!*.test.js
!*.spec.ts
!*.log

# Directories to grep
[dirs:./configs]
error
debug
TODO

[dirs:./templates]
FIXME
HACK
```

### File-Type Skills

**Per-extension skill files:** `{extension}.bucket-include`

Files can have their own context rules:

- `.js.bucket-include` - Rules for JavaScript files
- `.py.bucket-include` - Rules for Python files
- `.md.bucket-include` - Rules for Markdown files

**Skill file lookup order:**
1. `{extension}.bucket-include` in working directory
2. `{extension}.bucket-include` in global profile
3. Fallback to default `.bucket-include`

### Configuration Merging

**Local overrides global** with same-name merging:

- Global: `~/.config/open-buckets/.bucket-include`
- Local: `{cwd}/.bucket-include`
- Extension skill: `{cwd}/.js.bucket-include`

**Merge rules:**
1. Start with global base config
2. Override/append with local config
3. Apply extension-specific skill on top
4. Skill patterns take precedence over base config

### Error Handling

**Create `.error` files** on failure:

When processing fails, create `{original-filename}.error`:

```
# Error Processing File
File: test.js
Timestamp: 2026-02-18T05:00:00Z

Error Message: [error details]
Stack Trace: [stack if available]

# Original File Content (if available)
[...file content...]
```

### Output Format

**Obsidian-style clean output:**

```
# File: test.js
# Directory: /path/to/watch
# Size: 1.2 KB

## Content
```javascript
const x = 1;
console.log(x);
```

## Related Context
- src/main.js (2.1 KB)
- src/utils.js (1.5 KB)

## Grep Results
### ./configs/config.js:15
```
error("Something went wrong");
```
```

## Implementation Plan

1. **Phase 1:** Rewrite config parser
   - Parse gitignore-style patterns
   - Handle `!` exclusion prefix
   - Support directory grepping sections

2. **Phase 2:** File-type skills
   - Look up `{extension}.bucket-include`
   - Merge base config + skill config
   - Cache skill lookups per file type

3. **Phase 3:** Error handling
   - Create `.error` files on failure
   - Capture error details and context
   - Preserve original content when possible

4. **Phase 4:** Obsidian output
   - Markdown-style headers
   - Code blocks with syntax highlighting
   - Clean, minimal formatting

5. **Phase 5:** Testing
   - Test gitignore pattern matching
   - Test skill file lookup
   - Test error file creation
   - Test Obsidian-style output

## Resolved Questions

- **Cache:** No caching between drops
- **Performance:** Not a concern for current use case
- **File Type Handling:** Skill files per extension
- **Error Handling:** `.error` files with context
- **Output Format:** Obsidian-style markdown

## Open Questions

None at this time. This ADR resolves all outstanding questions from ADR-002.

## Next Steps

1. [ ] Implement gitignore-style parser
2. [ ] Add skill file lookup system
3. [ ] Create error file generator
4. [ ] Update output to Obsidian markdown
5. [ ] Update examples and documentation
6. [ ] Test with various file types
