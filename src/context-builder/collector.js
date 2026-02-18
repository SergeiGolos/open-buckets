const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');

class FileCollector {
  constructor(config, baseDir = process.cwd()) {
    this.config = config;
    this.baseDir = baseDir;
  }

  async collect() {
    const { include, exclude } = this.config;

    // If no include patterns, return empty
    if (!include || include.length === 0) {
      return { files: [], stats: { totalSize: 0, count: 0 } };
    }

    // Collect files matching include patterns
    const files = await fg(include, {
      cwd: this.baseDir,
      absolute: true,
      ignore: this.getIgnorePatterns(exclude),
      onlyFiles: true,
      followSymbolicLinks: false
    });

    // Filter by limits (soft limits - no truncation)
    const filtered = this.filterByLimits(files);

    return {
      files: filtered,
      stats: {
        totalSize: this.calculateTotalSize(filtered),
        count: filtered.length
      }
    };
  }

  getIgnorePatterns(exclude) {
    const patterns = [
      // Default excludes
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '*.log'
    ];

    if (exclude && exclude.length > 0) {
      patterns.push(...exclude);
    }

    return patterns;
  }

  filterByLimits(files) {
    // Soft limits - just collect what we can, don't truncate
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB default

    // Filter by file size only
    return files.filter(file => {
      try {
        const stats = fs.statSync(file);
        return stats.size <= maxSizeBytes;
      } catch (err) {
        console.error(`Error stat-ing file ${file}:`, err.message);
        return false;
      }
    });
  }

  calculateTotalSize(files) {
    let total = 0;
    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        total += stats.size;
      } catch (err) {
        // Skip files that can't be read
      }
    }
    return total;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = FileCollector;
