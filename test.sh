#!/bin/bash

cd ~/Projects/open-buckets

# Start the watcher in the background
node src/index.js --watch ./test-buckets/incoming > /tmp/watcher.log 2>&1 &
WATCHER_PID=$!

echo "Watcher started with PID: $WATCHER_PID"

# Wait for it to initialize
sleep 2

# Drop a test file
echo "Hello from Open Buckets!
This is a multi-line test file.
Created at: $(date)" > ./test-buckets/incoming/test.txt

echo "Test file created"

# Wait for processing
sleep 2

# Stop the watcher
kill $WATCHER_PID 2>/dev/null
wait $WATCHER_PID 2>/dev/null

echo ""
echo "=== Watcher Output ==="
cat /tmp/watcher.log
echo "======================"
