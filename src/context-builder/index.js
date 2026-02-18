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
        baseDir: this.baseDir
      }
    };

    // Collect related files from include patterns
    try {
      const collectionResult = await this.collector.collect();
      context.relatedFiles = collectionResult.files;
      context.collectionStats = collectionResult.stats;
    } catch (err) {
      console.error('Error collecting related files:', err.message);
    }

    // Grep directories for patterns
    try {
      const grepResults = await this.grepper.search();
      context.grepResults = grepResults;
    } catch (err) {
      console.error('Error searching directories:', err.message);
    }

    return context;
  }

  getDroppedFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const isText = this.isTextFile(filePath);
      let content = null;

      if (isText) {
        try {
          content = fs.readFileSync(filePath, 'utf8');
        } catch (err) {
          console.error(`Error reading file ${filePath}:`, err.message);
        }
      }

      return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        isText,
        content
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

  /**
   * Format context as Obsidian-style markdown
   */
  formatContext(context) {
    const lines = [];

    // Header with file info
    lines.push(`# File: ${context.droppedFile.name}`);
    lines.push(`# Directory: ${context.droppedFile.path}`);
    lines.push(`# Size: ${context.droppedFile.sizeFormatted}`);
    lines.push(`# Timestamp: ${context.metadata.timestamp}`);
    lines.push('');

    // Content section
    if (context.droppedFile.isText && context.droppedFile.content) {
      lines.push('## Content');
      const ext = this.getFileExtension(context.droppedFile.name);
      lines.push(`\`\`\`${ext || ''}`);
      lines.push(context.droppedFile.content);
      lines.push('```');
      lines.push('');
    } else {
      lines.push('## Content');
      lines.push('> [Binary file - content not displayed]');
      lines.push('');
    }

    // Related files section
    if (context.relatedFiles.length > 0) {
      lines.push('## Related Context');
      lines.push(`*Total files: ${context.collectionStats.count}*`);
      lines.push(`*Total size: ${this.formatFileSize(context.collectionStats.totalSize)}*`);
      lines.push('');

      // List files
      const maxFiles = 20;
      for (const file of context.relatedFiles.slice(0, maxFiles)) {
        const relPath = path.relative(this.baseDir, file);
        lines.push(`- \`${relPath}\``);
      }

      if (context.relatedFiles.length > maxFiles) {
        lines.push(`- ... and ${context.relatedFiles.length - maxFiles} more files`);
      }
      lines.push('');
    }

    // Grep results section
    if (context.grepResults.length > 0) {
      lines.push('## Grep Results');
      lines.push(`*Total matches: ${context.grepResults.length}*`);
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
        lines.push(`### \`${relPath}\``);

        const maxMatches = 10;
        for (const match of matches.slice(0, maxMatches)) {
          if (match.line !== null) {
            // Context line
            lines.push(match.content);
          } else {
            // Match with line number
            lines.push(`Line ${match.line}: \`${match.content}\``);
          }
        }

        if (matches.length > maxMatches) {
          lines.push(`... and ${matches.length - maxMatches} more matches`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  getFileExtension(filename) {
    const extMatch = filename.match(/\.([^./]+)$/);
    return extMatch ? extMatch[1] : '';
  }
}

module.exports = ContextBuilder;
