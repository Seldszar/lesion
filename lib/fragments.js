const lodash = require('lodash');
const path = require('path');
const { readFile, listFiles } = require('./helpers');

/**
 * Assemble the store fragments.
 *
 * @param {Array<Object>} fragments The fragments.
 * @return {Object} The assembled fragments.
 */
function assembleFragments(fragments) {
  return lodash.sortBy(fragments, 'key.length')
    .reduce((result, fragment) => lodash.set(result, fragment.key, fragment.value), {});
}

/**
 * Find the resolver associated with the file.
 *
 * @param {Set<Object>} resolvers The resolvers.
 * @param {String} file The path to the file.
 * @param {Object} parsed The parsed path.
 * @return {?Object} The resolver.
 */
function findResolver(resolvers, file, parsed) {
  const extension = parsed.ext.substring(1);

  for (const resolver of resolvers) {
    if (resolver.extensions.includes(extension)) {
      return resolver;
    }
  }

  return null;
}

/**
 * Resolve the given file and return its fragment key.
 *
 * @param {Object} resolver The resolver.
 * @param {String} file The path to the file.
 * @param {Object} parsed The parsed path.
 * @return {Array<String>} The resolved fragment key.
 */
async function resolveFragmentKey(resolver, file, parsed) {
  return (parsed.dir ? parsed.dir.split(path.sep) : [])
    .concat(parsed.name);
}

/**
 * Resolve the given file and return its fragment value.
 *
 * @param {Object} resolver The resolver.
 * @param {String} file The path to the file.
 * @param {Object} parsed The parsed path.
 * @return {Promise<*>} The resolved fragment value.
 */
async function resolveFragmentValue(resolver, file, parsed) {
  return resolver.deserialize(await readFile(file), file, parsed);
}

/**
 * Resolve the given file and return its fragment.
 *
 * @param {String} rootPath The path to the store root.
 * @param {Set<Object>} resolvers The resolvers.
 * @param {String} file The path to the file.
 * @return {Promise<?Object>} The resolved fragment.
 */
async function resolveFragment(rootPath, resolvers, file) {
  const parsed = path.parse(path.relative(rootPath, file));
  const resolver = findResolver(resolvers, file, parsed);

  if (resolver) {
    const key = await resolveFragmentKey(resolver, file, parsed);
    const value = await resolveFragmentValue(resolver, file, parsed);

    return {
      file, key, resolver, value,
    };
  }

  return undefined;
}

/**
 * Fetch the store fragments.
 *
 * @param {String} rootPath The path to the store root.
 * @param {Set<Object>} resolvers The resolvers.
 * @return {Promise<Object>} The store value.
 */
async function fetchFragments(rootPath, resolvers) {
  const files = await listFiles(rootPath);
  const fragments = [];

  for (const file of files) {
    const fragment = await resolveFragment(rootPath, resolvers, file);

    if (fragment) {
      fragments.push(fragment);
    }
  }

  return fragments;
}

exports.assembleFragments = assembleFragments;
exports.findResolver = findResolver;
exports.resolveFragmentKey = resolveFragmentKey;
exports.resolveFragmentValue = resolveFragmentValue;
exports.resolveFragment = resolveFragment;
exports.fetchFragments = fetchFragments;
