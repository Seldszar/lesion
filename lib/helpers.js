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
 * List the items in the given directory.
 *
 * @param {String} path The path.
 * @return {Promise<Array<String>>} The paths.
 */
async function list(path) {
  return new Promise((resolve, reject) => {
    fs.list(path, (error, paths) => {
      if (error) {
        return reject(error);
      }

      return resolve(paths);
    });
  });
}

/**
 * Return the informations about the given path.
 *
 * @param {String} path The path to check.
 * @return {Promise<Boolean>} The result.
 */
async function stat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      if (error) {
        return reject(error);
      }

      return resolve(stats);
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
 * Traverse the given directory.
 *
 * @param {String} path The path.
 * @param {Function} callback Function called when an item is found.
 * @return {Promise<Array<String>>} The file nodes.
 */
async function walk(path, callback) {
  let stats = await stat(path);

  callback(path, stats);

  if (stats.isDirectory()) {
    for (const childPath of await list(path)) {
      stats = await stat(childPath);

      callback(childPath, stats);

      if (stats.isDirectory()) {
        await walk(childPath, callback);
      }
    }
  }
}

/**
 * List the files in the given directory.
 *
 * @param {String} path The path.
 * @return {Promise<Array<String>>} The file paths.
 */
async function listFiles(path) {
  const paths = [];

  await walk(path, (childPath, stats) => {
    if (stats.isFile()) {
      paths.push(childPath);
    }
  });

  return paths;
}

exports.exists = exists;
exports.stat = stat;
exports.list = list;
exports.readFile = readFile;
exports.walk = walk;
exports.listFiles = listFiles;
