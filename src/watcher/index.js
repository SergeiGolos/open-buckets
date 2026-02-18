const fs = require('fs');
const path = require('path');
const { getProcessor } = require('../processor');

let watchers = [];

function start(directories) {
  console.log('# Open Buckets - Context Builder');
  console.log('');

  // Preserve original working directory for all operations
  const originalCwd = process.cwd();

  console.log(`**Working directory:** \`${originalCwd}\``);
  console.log('');

  // Initialize processor with original CWD
  const processor = getProcessor(originalCwd);

  for (const dir of directories) {
    try {
      const watcher = fs.watch(dir, { recursive: false }, (eventType, filename) => {
        if (eventType === 'rename' && filename) {
          const filePath = path.join(dir, filename);

          // Small delay to ensure file is fully written
          setTimeout(() => {
            if (fs.existsSync(filePath)) {
              try {
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                  // Pass original CWD for all operations
                  processor.processFile(filePath, dir);
                }
              } catch (err) {
                console.error(`Error stat-ing file ${filePath}:`, err.message);
              }
            }
          }, 100);
        }
      });

      watcher.on('error', (err) => {
        console.error(`\n# Watcher Error`);
        console.error(`Directory: \`${dir}\``);
        console.error(`\`\`\``);
        console.error(err.message);
        console.error('```');
      });

      watchers.push({ watcher, dir });
      console.log(`✓ Watching: \`${dir}\``);
    } catch (err) {
      console.error(`# Failed to watch`);
      console.error(`Directory: \`${dir}\``);
      console.error(`\`\`\``);
      console.error(err.message);
      console.error('```');
    }
  }

  console.log('');
  console.log('> Waiting for file drops...');
  console.log('> Press `Ctrl+C` to stop');
  console.log('');
}

function stop() {
  console.log('\n# Stopping watchers');
  console.log('');

  for (const { watcher, dir } of watchers) {
    try {
      watcher.close();
      console.log(`✓ Stopped: \`${dir}\``);
    } catch (err) {
      console.error(`# Error stopping watcher`);
      console.error(`Directory: \`${dir}\``);
      console.error(`\`\`\``);
      console.error(err.message);
      console.error('```');
    }
  }
  watchers = [];
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stop();
  process.exit(0);
});

module.exports = {
  start,
  stop
};
