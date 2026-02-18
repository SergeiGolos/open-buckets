const fs = require('fs');
const path = require('path');

function isTextFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const size = buffer.length;

    // Check first 8KB for text content
    const sampleSize = Math.min(size, 8192);
    const sample = buffer.toString('utf8', 0, sampleSize);

    // Check for null bytes (indicates binary)
    for (let i = 0; i < sampleSize; i++) {
      if (sample.charCodeAt(i) === 0) {
        return false;
      }
    }

    // Additional heuristics for common binary patterns
    // PDF: %PDF
    if (sample.startsWith('%PDF')) return false;
    // ZIP: PK
    if (sample.startsWith('PK')) return false;
    // PNG: PNG
    if (sample.startsWith('\x89PNG')) return false;
    // JPEG: \xFF\xD8
    if (sample.startsWith('\xFF\xD8')) return false;
    // ELF: \x7FELF
    if (sample.startsWith('\x7FELF')) return false;

    // If we got here, likely text
    return true;
  } catch (err) {
    console.error(`Error checking file type: ${err.message}`);
    return false;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function printSeparator() {
  console.log('='.repeat(80));
}

function printHeader(filePath, watchDir) {
  const stats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = formatFileSize(stats.size);
  const timestamp = new Date().toISOString();

  console.log('');
  printSeparator();
  console.log(`File dropped: ${fileName}`);
  console.log(`Watch directory: ${watchDir}`);
  console.log(`Full path: ${filePath}`);
  console.log(`Size: ${fileSize}`);
  console.log(`Detected at: ${timestamp}`);
  console.log('');
}

function processFile(filePath, watchDir) {
  try {
    printHeader(filePath, watchDir);

    if (isTextFile(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log('Content (text file):');
      console.log('-'.repeat(40));
      console.log(content);
      console.log('-'.repeat(40));
      console.log('[END OF FILE]');
    } else {
      console.log('Content: [BINARY FILE - Skipped]');
      console.log('Reason: File appears to be binary data');
    }

    printSeparator();
    console.log('');
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err.message);
    printSeparator();
  }
}

module.exports = {
  processFile,
  isTextFile,
  formatFileSize
};
