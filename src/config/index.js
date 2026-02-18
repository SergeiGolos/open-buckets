const fs = require('fs');
const path = require('path');

// Config paths
const LOCAL_CONFIG = '.bucket-include';
const GLOBAL_CONFIG_DIR = path.join(require('os').homedir(), '.config', 'open-buckets');
const GLOBAL_CONFIG = path.join(GLOBAL_CONFIG_DIR, '.bucket-include');

/**
 * Parse gitignore-style configuration
 * Lines starting with ! are exclusions
 * [dirs:path] sections define grep patterns for directories
 */
function parseConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const config = {
      include: [],
      exclude: [],
      directories: {}
    };

    let currentDir = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Check for directory section header: [dirs:path]
      const dirMatch = trimmed.match(/^\[dirs:([^\]]+)\]$/);
      if (dirMatch) {
        currentDir = dirMatch[1];
        if (!config.directories[currentDir]) {
          config.directories[currentDir] = [];
        }
        continue;
      }

      // Handle patterns
      if (trimmed.startsWith('!')) {
        // Exclusion pattern
        config.exclude.push(trimmed.slice(1));
      } else if (currentDir) {
        // Directory grep pattern
        config.directories[currentDir].push(trimmed);
      } else {
        // Inclusion pattern
        config.include.push(trimmed);
      }
    }

    return config;
  } catch (err) {
    console.error(`Error parsing config file ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Get skill file for a specific file extension
 * Looks up {extension}.bucket-include files
 */
function getSkillConfig(fileExtension, baseDir) {
  const skillFileName = `.${fileExtension}.bucket-include`;

  // Try local first
  const localSkillPath = path.join(baseDir, skillFileName);
  if (fs.existsSync(localSkillPath)) {
    const skillConfig = parseConfig(localSkillPath);
    if (skillConfig) {
      skillConfig._source = 'local-skill';
      skillConfig._path = localSkillPath;
      return skillConfig;
    }
  }

  // Try global profile
  const globalSkillPath = path.join(GLOBAL_CONFIG_DIR, skillFileName);
  if (fs.existsSync(globalSkillPath)) {
    const skillConfig = parseConfig(globalSkillPath);
    if (skillConfig) {
      skillConfig._source = 'global-skill';
      skillConfig._path = globalSkillPath;
      return skillConfig;
    }
  }

  return null;
}

/**
 * Load configuration with skill file lookup
 */
function loadConfigForFile(filePath, baseDir = process.cwd()) {
  const ext = getFileExtension(filePath);

  // Load base configs (local overrides global)
  const localBaseConfig = parseConfig(path.join(baseDir, LOCAL_CONFIG));
  const globalBaseConfig = parseConfig(GLOBAL_CONFIG);

  // Merge base configs (local takes precedence)
  const baseConfig = mergeConfigs(localBaseConfig, globalBaseConfig);

  // Load skill config for file type
  const skillConfig = getSkillConfig(ext, baseDir);

  // Merge skill config on top of base config
  const finalConfig = mergeConfigs(skillConfig, baseConfig);

  // Add metadata
  finalConfig._fileExtension = ext;
  finalConfig._skillSource = skillConfig?._source || 'none';
  finalConfig._baseSource = localBaseConfig ? 'local' : (globalBaseConfig ? 'global' : 'default');

  return finalConfig;
}

/**
 * Simple file extension extraction
 */
function getFileExtension(filePath) {
  const basename = path.basename(filePath);
  const extMatch = basename.match(/\.([^./]+)$/);
  return extMatch ? extMatch[1] : '';
}

/**
 * Merge two configs (override takes precedence)
 */
function mergeConfigs(override, base) {
  if (!override && !base) {
    // Default config when neither exists
    return {
      include: [],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.git/**',
        '*.log'
      ],
      directories: {}
    };
  }

  if (!override) return base;
  if (!base) return override;

  // Merge arrays by concatenating (override first)
  const result = {
    include: [...override.include, ...base.include],
    exclude: [...override.exclude, ...base.exclude],
    directories: { ...base.directories, ...override.directories }
  };

  // Preserve metadata
  if (override._source) result._source = override._source;
  if (override._path) result._path = override._path;

  return result;
}

/**
 * Ensure global config directory exists
 */
function ensureGlobalConfigDir() {
  if (!fs.existsSync(GLOBAL_CONFIG_DIR)) {
    try {
      fs.mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
      return true;
    } catch (err) {
      console.error(`Failed to create global config directory: ${err.message}`);
      return false;
    }
  }
  return false;
}

/**
 * Write a config file (global or local)
 */
function writeConfig(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Config written to: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Failed to write config to ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Create error file for failed processing
 */
function createErrorFile(originalFile, error, baseDir = process.cwd()) {
  const errorFileName = `${path.basename(originalFile)}.error`;
  const errorPath = path.join(baseDir, errorFileName);

  const timestamp = new Date().toISOString();
  let errorContent = `# Error Processing File\n`;
  errorContent += `File: ${path.basename(originalFile)}\n`;
  errorContent += `Path: ${originalFile}\n`;
  errorContent += `Timestamp: ${timestamp}\n\n`;
  errorContent += `## Error\n`;
  errorContent += `\`\`\`\n${error.message}\n\`\`\`\n\n`;

  if (error.stack) {
    errorContent += `## Stack Trace\n`;
    errorContent += `\`\`\`\n${error.stack}\n\`\`\`\n\n`;
  }

  // Try to read original file content
  try {
    const originalContent = fs.readFileSync(originalFile, 'utf8');
    errorContent += `## Original File Content\n`;
    errorContent += `\`\`\`\`\n${originalContent}\n\`\`\`\n`;
  } catch (err) {
    errorContent += `## Original File Content\n`;
    errorContent += `[Could not read original file: ${err.message}]\n`;
  }

  fs.writeFileSync(errorPath, errorContent, 'utf8');
  console.log(`Error file created: ${errorPath}`);

  return errorPath;
}

module.exports = {
  parseConfig,
  loadConfigForFile,
  getSkillConfig,
  mergeConfigs,
  ensureGlobalConfigDir,
  writeConfig,
  createErrorFile,
  LOCAL_CONFIG,
  GLOBAL_CONFIG_DIR,
  GLOBAL_CONFIG
};
