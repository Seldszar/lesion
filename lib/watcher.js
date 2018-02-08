const lodash = require('lodash');
const nsfw = require('nsfw');
const path = require('path');

/**
 * Indicate if the change should be filtered.
 *
 * @param {Array<Object>} accumulator The accumulator.
 * @param {Object} change The change to filter.
 * @param {Array<Object>} changes The collection of changes.
 * @return {Boolean} Returns `true` if the change should be filtered, else `false`.
 */
function shouldFilterChange(accumulator, change, changes) {
  if (lodash.some(accumulator, change)) {
    return false;
  }

  if (change.action === 'created') {
    if (lodash.some(changes, { action: 'renamed', oldFile: change.newFile })) {
      return false;
    }
  }

  if (change.action === 'deleted') {
    if (lodash.some(changes, { action: 'renamed', newFile: change.oldFile })) {
      return false;
    }
  }

  if (change.action === 'modified') {
    if (lodash.some(changes, { action: 'created', newFile: change.newFile })) {
      return false;
    }

    if (lodash.some(changes, { action: 'renamed', newFile: change.newFile })) {
      return false;
    }

    if (lodash.some(changes, { action: 'deleted', oldFile: change.newFile })) {
      return false;
    }
  }

  return true;
}

/**
 * Filter the given changes by rejecting useless ones.
 *
 * @param {Array<Object>} changes The changes to filter.
 * @return {Array<Object>} The filtered changes.
 */
function filterChanges(changes) {
  const accumulator = [];

  for (const change of changes) {
    if (shouldFilterChange(accumulator, change, changes)) {
      accumulator.push(change);
    }
  }

  return accumulator;
}

/**
 * Create a new watcher.
 *
 * @param {String} rootPath The path to the store root.
 * @param {Function} onChange Function called after each change.
 * @return {Promise<Watcher>} The watcher instance.
 */
async function createWatcher(rootPath, onChange) {
  return nsfw(rootPath, (events) => {
    const changes = [];

    for (const event of events) {
      if (event.action === nsfw.actions.CREATED) {
        changes.push({
          action: 'created',
          oldFile: null,
          newFile: path.join(event.directory, event.file),
        });
      }

      if (event.action === nsfw.actions.DELETED) {
        changes.push({
          action: 'deleted',
          oldFile: path.join(event.directory, event.file),
          newFile: null,
        });
      }

      if (event.action === nsfw.actions.MODIFIED) {
        changes.push({
          action: 'modified',
          oldFile: path.join(event.directory, event.file),
          newFile: path.join(event.directory, event.file),
        });
      }

      if (event.action === nsfw.actions.RENAMED) {
        changes.push({
          action: 'renamed',
          oldFile: path.join(event.directory, event.oldFile),
          newFile: path.join(event.directory, event.newFile),
        });
      }
    }

    onChange(filterChanges(changes));
  });
}

exports.shouldFilterChange = shouldFilterChange;
exports.filterChanges = filterChanges;
exports.createWatcher = createWatcher;
