#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const watcher = require('./watcher');
const daemon = require('./daemon');

function parseArgs(args) {
  const parsed = {
    watchDirs: [],
    daemon: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--watch') {
      if (i + 1 < args.length) {
        parsed.watchDirs.push(args[i + 1]);
        i++;
      }
    } else if (args[i] === '--daemon') {
      parsed.daemon = true;
    }
  }

  return parsed;
}

function validateWatchDirs(dirs) {
  const missing = [];
  const existing = [];

  for (const dir of dirs) {
    const resolvedPath = path.resolve(dir);
    if (!fs.existsSync(resolvedPath)) {
      missing.push(dir);
    } else if (!fs.statSync(resolvedPath).isDirectory()) {
      missing.push(`${dir} (not a directory)`);
    } else {
      existing.push(resolvedPath);
    }
  }

  return { missing, existing };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.watchDirs.length === 0) {
    console.error('Error: No watch directories specified. Use --watch <path>');
    console.error('Usage: node src/index.js --watch <path> [--watch <path>...] [--daemon]');
    process.exit(1);
  }

  const { missing, existing } = validateWatchDirs(args.watchDirs);

  if (missing.length > 0) {
    console.error('Error: The following directories do not exist or are not directories:');
    missing.forEach(dir => console.error(`  - ${dir}`));
    process.exit(1);
  }

  console.log(`Open Buckets - Directory Watcher`);
  console.log(`Watching ${existing.length} director${existing.length === 1 ? 'y' : 'ies'}:`);
  existing.forEach(dir => console.log(`  - ${dir}`));
  console.log('');

  if (args.daemon) {
    await daemon.start(async () => {
      watcher.start(existing);
    });
  } else {
    watcher.start(existing);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
