import path from 'path';
import JSON5 from 'json5';
import {dirStat, exists, readUtf8File, resolveModulePath} from './fileUtil';

const requiresSpecialHandling = (modules, importName) => {
  const moduleName = importName.split('/')[0];
  return modules.indexOf(moduleName) >= 0;
};

const getMainStyleFromPackageData = (packageData) => {
  return packageData['main.css'] || packageData['main.scss'];
};

const directoryModulePathResolver = (modulePath) => {
  const packageJsonPath = path.resolve(modulePath, 'package.json');
  return readUtf8File(packageJsonPath)
    .then(JSON5.parse)
    .then(getMainStyleFromPackageData)
    .catch(() => null)
    .then((relativePath) => {
      if (relativePath) {
        return path.resolve(modulePath, relativePath);
      }
      return path.resolve(modulePath, 'index.scss');
    });
};

export default (options = {}) => {
  const {
    modules: optionModules = []
  } = options;

  return (file, prev, done) => {
    if (requiresSpecialHandling(optionModules, file)) {
      const modulePath = resolveModulePath(file, prev);

      dirStat(modulePath)
        .then(({exists, isDirectory}) => {
          if (isDirectory) {
            return directoryModulePathResolver(modulePath);
          }
          if (exists) {
            return modulePath;
          }
          return `${modulePath}.scss`;
        })
        .then((filePath) => {
          return exists(filePath)
            .then(exists => {
              if (exists) {
                return filePath;
              }
              throw new Error(`File does not exist: ${filePath}`);
            });
        })
        .then((newFile) => {
          done({file: newFile});
        })
        .catch((e) => {
          console.error(`Error loading module "${file}"`, e);
          done({file});
        });
    } else {
      done({file});
    }
  };
}
