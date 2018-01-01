const fetch = require('./fetch');
const walk = require('./walk');
const watch = require('./watch');

/**
 * Create a new store client.
 *
 * @param {String} rootPath The path to the store root.
 * @param {Object} [options={}] The options passed to the store client.
 * @return {Promise<Object>} The store client.
 */
async function lesion(rootPath, options = {}) {
  /**
   * The resolvers.
   *
   * @type {Array<Object>}
   */
  const resolvers = options.resolvers || [];

  return {
    /**
     * Return the store file paths.
     *
     * @return {Promise<Array<String>>} The store file paths.
     */
    async walk() {
      return walk(rootPath);
    },

    /**
     * Fetch the store value.
     *
     * @return {Promise<Object>} The store value.
     */
    async fetch() {
      return fetch(rootPath, resolvers);
    },

    /**
     * Watch for store changes.
     *
     * @param {Function} onChange Function called after each change.
     * @return {Promise<PathWatcher>} The watcher instance.
     */
    async watch(onChange) {
      return watch(rootPath, async () => {
        onChange(await this.fetch());
      });
    },
  };
}

module.exports = lesion;
