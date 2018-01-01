const lodash = require('lodash');
const path = require('path');
const walk = require('./walk');

/**
 * Fetch the store value.
 *
 * @param {String} rootPath The path to the store root.
 * @param {Array<Object>} resolvers The resolvers.
 * @return {Promise<Object>} The store value.
 */
async function fetch(rootPath, resolvers) {
  const files = await walk(rootPath);
  const object = {};

  for (const file of files) {
    const resolver = resolvers.find(r => r.test(file));
    const parsed = path.parse(path.relative(rootPath, file));

    if (resolver) {
      const {
        visit, rename = lodash.identity,
      } = resolver;

      const value = await visit(file);
      const key = (parsed.dir ? parsed.dir.split(path.sep) : [])
        .concat(rename(parsed.name, file));

      lodash.set(object, key, value);
    }
  }

  return object;
}

module.exports = fetch;
