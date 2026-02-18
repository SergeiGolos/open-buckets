const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const fs = require('fs');
const path = require('path');

class DirectoryGrep {
  constructor(config, baseDir = process.cwd()) {
    this.config = config;
    this.baseDir = baseDir;
  }

  async search() {
    const { directories } = this.config;

    if (!directories?.paths || directories.paths.length === 0) {
      return [];
    }

    const results = [];

    for (const dir of directories.paths) {
      const patterns = directories.patterns?.[dir] || [];

      if (patterns.length === 0) {
        console.log(`Warning: No patterns defined for directory: ${dir}`);
        continue;
      }

      const dirPath = path.resolve(this.baseDir, dir);

      if (!fs.existsSync(dirPath)) {
        console.log(`Warning: Directory not found: ${dirPath}`);
        continue;
      }

      const matches = await this.grepDirectory(dirPath, patterns);
      results.push(...matches);
    }

    return results;
  }

  async grepDirectory(dirPath, patterns) {
    const results = [];

    for (const pattern of patterns) {
      try {
        const matches = await this.runGrep(dirPath, pattern);
        results.push(...matches);
      } catch (err) {
        console.error(`Error grepping ${dirPath} for '${pattern}':`, err.message);
      }
    }

    return results;
  }

  async runGrep(dirPath, pattern) {
    const grepCommand = this.getGrepCommand(dirPath, pattern);

    try {
      const { stdout, stderr } = await execAsync(grepCommand, {
        cwd: this.baseDir,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      if (stderr && !stderr.includes('binary')) {
        console.error(`Grep stderr:`, stderr);
      }

      return this.parseGrepOutput(stdout, pattern);
    } catch (err) {
      // grep returns non-zero if no matches found, that's okay
      if (err.code === 1) {
        return [];
      }
      throw err;
    }
  }

  getGrepCommand(dirPath, pattern) {
    // Try ripgrep first, fallback to grep
    const hasRipgrep = this.checkCommand('rg');

    if (hasRipgrep) {
      // Use ripgrep (rg) - updated for compatibility
      // Remove -t text flag, use -I instead for binary files
      return `rg --color=never --no-heading --line-number -n -C 2 -I "${this.escapePattern(pattern)}" "${dirPath}"`;
    } else {
      // Use grep
      return `grep -r -n -C 2 -I --exclude-dir={.git,node_modules,dist,build} --binary-files=without-match "${this.escapePattern(pattern)}" "${dirPath}" 2>/dev/null || true`;
    }
  }

  checkCommand(cmd) {
    try {
      require('child_process').execSync(`which ${cmd}`, { stdio: 'ignore' });
      return true;
    } catch (err) {
      return false;
    }
  }

  escapePattern(pattern) {
    return pattern.replace(/"/g, '\\"');
  }

  parseGrepOutput(output, pattern) {
    const results = [];
    const lines = output.trim().split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      const match = line.match(/^([^:]+):(\d+):(.+)$/);
      if (match) {
        const [, filePath, lineNum, content] = match;
        results.push({
          file: filePath,
          line: parseInt(lineNum, 10),
          content: content.trim(),
          pattern: pattern
        });
      } else {
        // Context line (no line number prefix)
        results.push({
          file: 'context',
          line: null,
          content: line.trim(),
          pattern: pattern
        });
      }
    }

    return results;
  }
}

module.exports = DirectoryGrep;
