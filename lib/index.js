const { Emitter } = require('event-kit');
const lodash = require('lodash');
const path = require('path');
const { assembleFragments, fetchFragments, resolveFragment } = require('./fragments');
const { traverseTree } = require('./helpers');
const { createWatcher } = require('./watcher');

/**
 * Create a new store client.
 *
 * @param {String} rootPath The path to the store root.
 * @param {Object} [options={}] The options.
 * @return {Promise<Object>} The store client.
 */
async function lesion(rootPath, options = {}) {
  /**
   * The emitter.
   *
   * @type {Emitter}
   */
  const emitter = new Emitter();

  /**
   * The resolvers.
   *
   * @type {Set<Object>}
   */
  const resolvers = new Set(options.resolvers);

  /**
   * The fragments.
   *
   * @type {Map<String, Object>}
   */
  const fragments = new Map();

  /**
   * The watcher.
   *
   * @type {Watcher}
   */
  const watcher = await createWatcher(rootPath, async (changes) => {
    for (const change of changes) {
      if (change.action === 'created') {
        for (const file of await traverseTree(change.newFile)) {
          const oldFragment = null;
          const newFragment = await resolveFragment(rootPath, resolvers, file);

          if (newFragment) {
            fragments.set(newFragment.file, newFragment);

            emitter.emit('did-change', {
              newFragment, oldFragment,
            });
          }
        }
      }

      if (change.action === 'deleted') {
        for (const [file, fragment] of fragments.entries()) {
          const relativePath = path.relative(change.oldFile, file);

          if (!relativePath.startsWith('..')) {
            const oldFragment = fragment;
            const newFragment = null;

            if (oldFragment) {
              fragments.delete(oldFragment.file);

              emitter.emit('did-change', {
                newFragment, oldFragment,
              });
            }
          }
        }
      }

      if (change.action === 'modified') {
        for (const [file, fragment] of fragments.entries()) {
          const relativePath = path.relative(change.oldFile, file);

          if (!relativePath.startsWith('..')) {
            const oldFragment = fragment;
            const newFragment = await resolveFragment(rootPath, resolvers, change.newFile);

            if (newFragment) {
              fragments.set(newFragment.file, newFragment);

              emitter.emit('did-change', {
                newFragment, oldFragment,
              });
            }
          }
        }
      }

      if (change.action === 'renamed') {
        for (const file of await traverseTree(change.newFile)) {
          const oldFragmentFile = file.replace(change.newFile, change.oldFile);
          const oldFragment = fragments.get(oldFragmentFile);
          const newFragment = await resolveFragment(rootPath, resolvers, file);

          if (oldFragment) {
            fragments.delete(oldFragment.file);
          }

          if (newFragment) {
            fragments.set(newFragment.file, newFragment);
          }

          if (oldFragment || newFragment) {
            emitter.emit('did-change', {
              newFragment, oldFragment,
            });
          }
        }
      }
    }
  });

  /**
   * Fetch the store fragments and cache them.
   */
  for (const fragment of await fetchFragments(rootPath, resolvers)) {
    fragments.set(fragment.file, fragment);
  }

  /**
   * Start the watcher.
   */
  await watcher.start();

  /**
   * Expose the public properties.
   */
  return {
    /**
     * The store fragments.
     *
     * @type {Array<Object>}
     */
    get fragments() {
      return lodash.cloneDeep([
        ...fragments.values(),
      ]);
    },

    /**
     * The store value.
     *
     * @return {Object}
     */
    get value() {
      return assembleFragments(this.fragments);
    },

    /**
     * Attach a callback called after each store change.
     *
     * @param {Function} callback Function invoked after each store change.
     * @return {Disposable} The disposable.
     */
    onChange(callback) {
      return emitter.on('did-change', callback);
    },

    /**
     * Close the store client.
     */
    async close() {
      await watcher.stop();
    },

    /**
     * Return a fragment.
     *
     * @param {String|Array<String>} key The fragment key.
     * @return {?Object} The fragment.
     */
    get(key) {
      return lodash.find(this.fragments, { key: lodash.toPath(key) });
    },

    /**
     * Check if a fragment exists.
     *
     * @param {String|Array<String>} key The fragment key.
     * @return {Boolean} Return `true` if the fragment exists, otherwise `false`.
     */
    has(key) {
      return lodash.some(this.fragments, { key: lodash.toPath(key) });
    },
  };
}

module.exports = lesion;
