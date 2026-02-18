const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');

// Default config paths
const LOCAL_CONFIG = '.bucket-include';
const GLOBAL_CONFIG_DIR = path.join(require('os').homedir(), '.config', 'open-buckets');
const GLOBAL_CONFIG = path.join(GLOBAL_CONFIG_DIR, '.bucket-include');

// Default configuration
const DEFAULT_CONFIG = {
  context: {
    name: 'Default Context'
  },
  include: {
    patterns: []
  },
  exclude: {
    patterns: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      '*.log'
    ]
  },
  directories: {
    paths: [],
    patterns: {}
  },
  limits: {
    maxFiles: 100,
    maxSizeMB: 10
  }
};

function parseConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return toml.parse(content);
  } catch (err) {
    console.error(`Error parsing config file ${filePath}:`, err.message);
    return null;
  }
}

function mergeConfigs(local, global) {
  // If no configs, use default
  if (!local && !global) {
    return DEFAULT_CONFIG;
  }

  // If only one config, use it (merged with defaults)
  if (local && !global) {
    return deepMerge(DEFAULT_CONFIG, local);
  }
  if (!local && global) {
    return deepMerge(DEFAULT_CONFIG, global);
  }

  // Both configs: merge global -> local
  return deepMerge(deepMerge(DEFAULT_CONFIG, global), local);
}

function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

function loadConfig() {
  const localConfig = parseConfig(path.join(process.cwd(), LOCAL_CONFIG));
  const globalConfig = parseConfig(GLOBAL_CONFIG);

  return mergeConfigs(localConfig, globalConfig);
}

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

function writeGlobalConfig(content) {
  ensureGlobalConfigDir();
  try {
    fs.writeFileSync(GLOBAL_CONFIG, content, 'utf8');
    console.log(`Global config written to: ${GLOBAL_CONFIG}`);
    return true;
  } catch (err) {
    console.error(`Failed to write global config: ${err.message}`);
    return false;
  }
}

module.exports = {
  loadConfig,
  parseConfig,
  mergeConfigs,
  ensureGlobalConfigDir,
  writeGlobalConfig,
  LOCAL_CONFIG,
  GLOBAL_CONFIG,
  DEFAULT_CONFIG
};
