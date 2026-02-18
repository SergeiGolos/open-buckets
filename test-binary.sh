#!/bin/bash

cd ~/Projects/open-buckets

# Clean up any previous test files
rm -f ./test-buckets/incoming/binary.bin

# Start the watcher in the background
node src/index.js --watch ./test-buckets/incoming > /tmp/watcher-binary.log 2>&1 &
WATCHER_PID=$!

echo "Watcher started with PID: $WATCHER_PID"

# Wait for it to initialize
sleep 2

# Create a fake binary file (ZIP signature)
printf "PK\x03\x04" > ./test-buckets/incoming/binary.bin
dd if=/dev/urandom bs=1024 count=1 >> ./test-buckets/incoming/binary.bin 2>/dev/null

echo "Binary test file created"

# Wait for processing
sleep 2

# Stop the watcher
kill $WATCHER_PID 2>/dev/null
wait $WATCHER_PID 2>/dev/null

echo ""
echo "=== Watcher Output (Binary Test) ==="
cat /tmp/watcher-binary.log
echo "=================================="
