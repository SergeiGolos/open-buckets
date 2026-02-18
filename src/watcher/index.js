const fs = require('fs');
const path = require('path');
const processor = require('../processor');

let watchers = [];

function start(directories) {
  console.log('Starting directory watchers...');

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
        console.error(`Watcher error for ${dir}:`, err.message);
      });

      watchers.push({ watcher, dir });
      console.log(`Watching: ${dir}`);
    } catch (err) {
      console.error(`Failed to watch ${dir}:`, err.message);
    }
  }

  console.log('');
  console.log('Waiting for file drops... Press Ctrl+C to stop.\n');
}

function stop() {
  console.log('\nStopping watchers...');
  for (const { watcher, dir } of watchers) {
    try {
      watcher.close();
      console.log(`Stopped watching: ${dir}`);
    } catch (err) {
      console.error(`Error stopping watcher for ${dir}:`, err.message);
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
