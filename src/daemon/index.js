const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(process.cwd(), 'open-buckets.pid');

function writePid(pid) {
  fs.writeFileSync(PID_FILE, pid.toString());
  console.log(`Daemon started with PID: ${pid}`);
  console.log(`PID file written to: ${PID_FILE}`);
}

function removePidFile() {
  if (fs.existsSync(PID_FILE)) {
    try {
      fs.unlinkSync(PID_FILE);
    } catch (err) {
      console.error(`Error removing PID file: ${err.message}`);
    }
  }
}

function isRunning() {
  if (!fs.existsSync(PID_FILE)) {
    return false;
  }

  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    // Try to send signal 0 to check if process exists
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // Process doesn't exist, clean up stale PID file
    removePidFile();
    return false;
  }
}

function start(callback) {
  if (isRunning()) {
    console.error('Error: Daemon is already running');
    console.error(`Check PID file: ${PID_FILE}`);
    process.exit(1);
  }

  // Fork and detach
  const { spawn } = require('child_process');

  const child = spawn(process.argv[0], process.argv.slice(1), {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    env: { ...process.env, OPEN_BUCKETS_DAEMON: '1' }
  });

  // Detach the child process
  child.unref();

  // Wait a moment and write the child's PID
  setTimeout(() => {
    writePid(child.pid);
    console.log('Daemon running in background');
    console.log('To stop: kill the process or use: kill $(cat open-buckets.pid)');
    process.exit(0);
  }, 500);

  // If we're the child process, run the callback
  if (process.env.OPEN_BUCKETS_DAEMON === '1') {
    // Setup signal handlers
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down...');
      removePidFile();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down...');
      removePidFile();
      process.exit(0);
    });

    // Run the watcher
    callback();
  }
}

function stop() {
  if (!fs.existsSync(PID_FILE)) {
    console.error('No PID file found. Daemon may not be running.');
    process.exit(1);
  }

  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    process.kill(pid, 'SIGTERM');
    console.log(`Sent SIGTERM to process ${pid}`);

    // Wait and verify
    setTimeout(() => {
      try {
        process.kill(pid, 0);
        console.error('Process still running. You may need to force kill it.');
      } catch (err) {
        console.log('Daemon stopped successfully');
        removePidFile();
      }
    }, 1000);
  } catch (err) {
    console.error('Error stopping daemon:', err.message);
    process.exit(1);
  }
}

function status() {
  if (!isRunning()) {
    console.log('Daemon is not running');
    return;
  }

  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
  console.log(`Daemon is running with PID: ${pid}`);
  console.log(`PID file: ${PID_FILE}`);
}

module.exports = {
  start,
  stop,
  status,
  isRunning
};
