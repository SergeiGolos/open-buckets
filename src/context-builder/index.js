const FileCollector = require('./collector');
const DirectoryGrep = require('./grep');
const fs = require('fs');
const path = require('path');

class ContextBuilder {
  constructor(config, baseDir = process.cwd()) {
    this.config = config;
    this.baseDir = baseDir;
    this.collector = new FileCollector(config, baseDir);
    this.grepper = new DirectoryGrep(config, baseDir);
  }

  async buildForFile(droppedFilePath) {
    const context = {
      droppedFile: this.getDroppedFileInfo(droppedFilePath),
      relatedFiles: [],
      grepResults: [],
      metadata: {
        timestamp: new Date().toISOString(),
        configName: this.config.context?.name || 'Unnamed Context',
        baseDir: this.baseDir
      }
    };

    // Collect related files from include patterns
    const collectionResult = await this.collector.collect();
    context.relatedFiles = collectionResult.files;
    context.collectionStats = collectionResult.stats;

    // Grep directories for patterns
    const grepResults = await this.grepper.search();
    context.grepResults = grepResults;

    return context;
  }

  getDroppedFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const content = this.isTextFile(filePath) ? fs.readFileSync(filePath, 'utf8') : null;

      return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        isText: this.isTextFile(filePath),
        content: content
      };
    } catch (err) {
      console.error(`Error reading dropped file ${filePath}:`, err.message);
      return {
        path: filePath,
        name: path.basename(filePath),
        error: err.message
      };
    }
  }

  isTextFile(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const size = buffer.length;
      const sampleSize = Math.min(size, 8192);
      const sample = buffer.toString('utf8', 0, sampleSize);

      // Check for null bytes
      for (let i = 0; i < sampleSize; i++) {
        if (sample.charCodeAt(i) === 0) {
          return false;
        }
      }

      // Binary signatures
      if (sample.startsWith('%PDF')) return false;
      if (sample.startsWith('PK')) return false;
      if (sample.startsWith('\x89PNG')) return false;
      if (sample.startsWith('\xFF\xD8')) return false;
      if (sample.startsWith('\x7FELF')) return false;

      return true;
    } catch (err) {
      return false;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatContext(context) {
    const lines = [];
    const sep = '='.repeat(80);

    // Header
    lines.push(sep);
    lines.push(`CONTEXT BUILDER - ${context.metadata.configName}`);
    lines.push(`Built: ${context.metadata.timestamp}`);
    lines.push(`Base Directory: ${context.metadata.baseDir}`);
    lines.push(sep);
    lines.push('');

    // Dropped File
    lines.push(sep);
    lines.push('DROPPED FILE');
    lines.push(sep);
    lines.push(`File: ${context.droppedFile.name}`);
    lines.push(`Path: ${context.droppedFile.path}`);
    lines.push(`Size: ${context.droppedFile.sizeFormatted}`);
    lines.push(`Type: ${context.droppedFile.isText ? 'TEXT' : 'BINARY'}`);
    lines.push('');

    if (context.droppedFile.isText && context.droppedFile.content) {
      lines.push('Content:');
      lines.push('-'.repeat(40));
      lines.push(context.droppedFile.content);
      lines.push('-'.repeat(40));
      lines.push('[END OF FILE]');
    } else {
      lines.push('[BINARY FILE - Content not displayed]');
    }
    lines.push('');

    // Related Files Summary
    if (context.relatedFiles.length > 0) {
      lines.push(sep);
      lines.push('RELATED FILES (from include patterns)');
      lines.push(sep);
      lines.push(`Total files collected: ${context.collectionStats.count}`);
      lines.push(`Total size: ${this.formatFileSize(context.collectionStats.totalSize)}`);
      lines.push('');

      // Show first few files
      const previewFiles = context.relatedFiles.slice(0, 20);
      for (const file of previewFiles) {
        const relPath = path.relative(this.baseDir, file);
        lines.push(`  - ${relPath}`);
      }

      if (context.relatedFiles.length > 20) {
        lines.push(`  ... and ${context.relatedFiles.length - 20} more files`);
      }
      lines.push('');
    }

    // Grep Results
    if (context.grepResults.length > 0) {
      lines.push(sep);
      lines.push('DIRECTORY GREP RESULTS');
      lines.push(sep);
      lines.push(`Total matches: ${context.grepResults.length}`);
      lines.push('');

      // Group by file
      const byFile = {};
      for (const result of context.grepResults) {
        if (!byFile[result.file]) {
          byFile[result.file] = [];
        }
        byFile[result.file].push(result);
      }

      for (const [file, matches] of Object.entries(byFile)) {
        const relPath = path.relative(this.baseDir, file);
        lines.push(`${relPath}:`);
        for (const match of matches.slice(0, 5)) { // Limit to 5 matches per file
          if (match.line !== null) {
            lines.push(`  Line ${match.line}: ${match.content}`);
          } else {
            lines.push(`  ${match.content}`);
          }
        }
        if (matches.length > 5) {
          lines.push(`  ... and ${matches.length - 5} more matches`);
        }
        lines.push('');
      }
    }

    // Footer
    lines.push(sep);
    lines.push('END OF CONTEXT');
    lines.push(sep);

    return lines.join('\n');
  }
}

module.exports = ContextBuilder;
