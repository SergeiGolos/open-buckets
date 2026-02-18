const fs = require('fs');
const path = require('path');
const ContextBuilder = require('../context-builder');
const config = require('../config');

class FileProcessor {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.config = config.loadConfig();
    this.contextBuilder = new ContextBuilder(this.config, baseDir);
  }

  async processFile(filePath, watchDir) {
    try {
      console.log('\n' + '='.repeat(80));
      console.log('File dropped - Building Context...');
      console.log('='.repeat(80));
      console.log(`Watch directory: ${watchDir}`);
      console.log(`Dropped file: ${path.basename(filePath)}`);
      console.log(`Full path: ${filePath}`);
      console.log('');

      // Load and display config info
      this.displayConfigInfo();

      console.log('');
      console.log('-'.repeat(80));
      console.log('Building context...');
      console.log('-'.repeat(80));

      // Build full context
      const context = await this.contextBuilder.buildForFile(filePath);

      console.log('');
      console.log('-'.repeat(80));
      console.log('Context complete!');
      console.log('-'.repeat(80));
      console.log('');

      // Display the full context
      const formatted = this.contextBuilder.formatContext(context);
      console.log(formatted);
      console.log('');

    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err.message);
      console.error(err.stack);
    }
  }

  displayConfigInfo() {
    console.log(`Context name: ${this.config.context?.name || 'Unnamed'}`);
    console.log(`Include patterns: ${this.config.include?.patterns?.length || 0}`);
    console.log(`Exclude patterns: ${this.config.exclude?.patterns?.length || 0}`);
    console.log(`Watch directories: ${this.config.directories?.paths?.length || 0}`);
    console.log(`File limit: ${this.config.limits?.maxFiles || 100} files, ${this.config.limits?.maxSizeMB || 10}MB`);
  }
}

// Singleton instance
let instance = null;

function getProcessor(baseDir) {
  if (!instance) {
    instance = new FileProcessor(baseDir);
  }
  return instance;
}

module.exports = {
  getProcessor,
  FileProcessor
};
