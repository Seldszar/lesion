const fs = require('fs-plus');

/**
 * Check if the given path exists.
 *
 * @param {String} path The path to check.
 * @return {Promise<Boolean>} The result.
 */
async function exists(path) {
  return new Promise((resolve) => {
    fs.access(path, (error) => {
      if (error) {
        return resolve(false);
      }

      return resolve(true);
    });
  });
}

/**
 * Check if the given path is a directory.
 *
 * @param {String} path The path to check.
 * @return {Promise<Boolean>} The result.
 */
async function isDirectory(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      if (error) {
        return reject(error);
      }

      return resolve(stats.isDirectory());
    });
  });
}

/**
 * Read a file and return its contents.
 *
 * @param {String} file The path to the file.
 * @return {Buffer} The file contents.
 */
async function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, contents) => {
      if (error) {
        return reject(error);
      }

      return resolve(contents);
    });
  });
}


/**
 * Return the file paths contained the given directory.
 *
 * @param {String} rootPath The path to the store root.
 * @return {Promise<Array<String>>} The store file paths.
 */
async function traverseTree(rootPath) {
  return new Promise(async (resolve) => {
    const files = [];

    const onFile = file => files.push(file);
    const onDirectory = () => true;
    const onDone = () => resolve(files);

    if (await exists(rootPath)) {
      if (await isDirectory(rootPath)) {
        return fs.traverseTree(rootPath, onFile, onDirectory, onDone);
      }

      onFile(rootPath);
    }

    return onDone();
  });
}

exports.exists = exists;
exports.isDirectory = isDirectory;
exports.readFile = readFile;
exports.traverseTree = traverseTree;
