const fs = require('fs-plus');

/**
 * Return the store file paths.
 *
 * @param {String} rootPath The path to the store root.
 * @return {Promise<Array<String>>} The store file paths.
 */
async function walk(rootPath) {
  return new Promise((resolve) => {
    const files = [];

    const onFile = file => files.push(file);
    const onDirectory = () => true;
    const onDone = () => resolve(files);

    fs.traverseTree(rootPath, onFile, onDirectory, onDone);
  });
}

module.exports = walk;
