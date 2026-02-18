const fs = require('fs');
const path = require('path');
const ContextBuilder = require('../context-builder');
const config = require('../config');

class FileProcessor {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  async processFile(filePath, watchDir) {
    console.log(`\n# Processing File`);
    console.log(`File: \`${path.basename(filePath)}\``);
    console.log(`Directory: \`${watchDir}\``);
    console.log(`Path: \`${filePath}\``);
    console.log('');

    try {
      // Load config for this specific file type
      const fileConfig = config.loadConfigForFile(filePath, this.baseDir);

      // Display config source info
      this.displayConfigInfo(fileConfig);
      console.log('');

      console.log('> Building context...');
      console.log('');

      // Build full context
      const builder = new ContextBuilder(fileConfig, this.baseDir);
      const context = await builder.buildForFile(filePath);

      // Display formatted context
      const formatted = builder.formatContext(context);
      console.log(formatted);
      console.log('');

      console.log('✓ Context complete');
      console.log('');

    } catch (err) {
      console.error(`\n# Error Processing File`);
      console.error(`File: \`${path.basename(filePath)}\``);
      console.error(`\`\`\``);
      console.error(err.message);
      console.error('```');
      console.error('');

      // Create error file
      try {
        const errorPath = config.createErrorFile(filePath, err, path.dirname(filePath));
        console.error(`Error file created: \`${path.basename(errorPath)}\``);
      } catch (createErr) {
        console.error(`Failed to create error file: ${createErr.message}`);
      }

      console.error('');
    }
  }

  displayConfigInfo(fileConfig) {
    console.log(`## Configuration`);
    console.log(`**Base config source:** ${fileConfig._baseSource}`);

    if (fileConfig._skillSource !== 'none') {
      console.log(`**Skill file:** ${fileConfig._skillSource}`);
      console.log(`**Skill for extension:** \`.${fileConfig._fileExtension}\``);
    }

    console.log('');
    console.log(`**Include patterns:** ${fileConfig.include?.length || 0}`);
    console.log(`**Exclude patterns:** ${fileConfig.exclude?.length || 0}`);
    console.log(`**Grep directories:** ${Object.keys(fileConfig.directories || {}).length}`);
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
