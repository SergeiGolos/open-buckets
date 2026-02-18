# Open Buckets

A Node.js application for watching multiple directories and reacting to file drops.

## Features

- Watch multiple directories simultaneously
- Detect file drops and identify the source directory
- Display text-based file contents to the screen
- Daemon mode support
- Binary file detection and graceful skipping

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
│   ├── adr/             # Architecture Decision Records
│   └── prd/            # Product Requirements Documents
└── test-buckets/        # Test directories
```

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
