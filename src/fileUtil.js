import path from 'path';
import fs from 'fs';
import Promise from 'bluebird';

const stat = Promise.promisify(fs.stat);

const cleanModuleName = (moduleName = '') => {
  const match = moduleName.match(/^@[^\/]+\/[^\/]+|^[^\/]+/);
  if (match) {
    return match[0];
  }
  throw new Error(`Could not get clean module name from "${moduleName}"`);
};

const resolveNodeModulePath = (filePath) => {
};

export const readUtf8File = Promise.promisify(fs.readFile, fs, 'file', 'utf8');

export const resolveModulePath = (importPath, relativeTo) => {
  const moduleName = cleanModuleName(importPath);
  let testPath;
  let nextTestPath = relativeTo;
  let testNMPath;
  let testPathStat;

  while (true) {
    testPath = nextTestPath;
    nextTestPath = path.resolve(testPath, '../');
    if (testPath === nextTestPath) {
      break;
    }

    testNMPath = path.resolve(testPath, 'node_modules', moduleName);
    try {
      testPathStat = fs.statSync(testNMPath);
    } catch (e) {
      continue;
    }

    if (testPathStat.isDirectory()) {
      return testNMPath;
    }
  }
};

export const dirStat = (filePath) => {
  return stat(filePath)
    .then((stats) => ({
      exists: true,
      isDirectory: stats.isDirectory()
    }))
    .catch(() => ({
      exists: false
    }));
};

export const exists = (path) => {
  return stat(path)
    .then(() => true)
    .catch(() => false);
};