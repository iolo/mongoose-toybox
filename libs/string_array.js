'use strict';

/**
 *
 * @param {Array.<string>} tags
 * @param {string} [separator=',']
 * @returns {string}
 */
function joinTags(tags, separator) {
  return tags ? tags.join(separator || ',') : '';
}

/**
 *
 * @param {string} tags
 * @param {string} [separator=',']
 * @returns {Array.<string>}
 */
function splitTags(tags, separator) {
  if (!tags) {
    return [];
  }
  return tags.split(separator || ',').map(function (tag) {
    return tag.trim();
  });
}

/**
 * mongoose plugin to add virtual field to set/get string array field at once.
 *
 * @param {mongoose.Schema} schema
 * @param {{real:string,virtual:string,separator:string}} [options={}]
 */
function mongooseStringArray(schema, options) {
  options = options || {};
  var realPath = options.real || 'tags';
  var virtualPath = options.virtual || 'tagsAll';
  var separator = options.separator || ',';

  schema.virtual(virtualPath)
    .get(function () {
      return joinTags(this[realPath], separator);
    })
    .set(function (virtualValue) {
      this[realPath] = splitTags(virtualValue);
      this.markModified(realPath);
    });
}

module.exports = mongooseStringArray;
module.exports.joinTags = joinTags;
module.exports.splitTags = splitTags;
