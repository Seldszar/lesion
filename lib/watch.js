const watcher = require('@atom/watcher');

/**
 * Watch for store changes.
 *
 * @param {String} rootPath The path to the store root.
 * @param {Function} onChange Function called after each change.
 * @return {Promise<PathWatcher>} The watcher instance.
 */
async function watch(rootPath, callback) {
  await watcher.configure({
    pollingInterval: 500,
  });

  return watcher.watchPath(rootPath, { recursive: true }, callback);
}

module.exports = watch;
