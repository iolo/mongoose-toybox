'use strict';

var
    mongoose = require('mongoose'),
    debug = require('debug')('mongoose-toybox:short_id'),
    DEBUG = debug.enabled;

/**
 * make short and url safe string from mongodb ObjectId.
 *
 * @param {String} str mongodb ObjectId or long hex string
 * @return {String}
 */
function encodeObjectId(str) {
    return new Buffer(String(str), 'hex').toString('base64').replace('+', '-').replace('/', '_');
}

/**
 * restore long mongodb ObjectId from encoded by encodeObjectId().
 *
 * @param {String} str short id string
 * @return {String} mongodb ObjectId
 */
function decodeObjectId(str) {
    return mongoose.Types.ObjectId.createFromHexString(new Buffer(str.replace('-', '+').replace('_', '/'), 'base64').toString('hex'));
}

/**
 * mongoose plugin to add virutal field 'shortId' to access _id with short id based on base64.
 *
 * @param {mongoose.Schema} schema
 * @param {{real:string, virtual:string}} [options={}]
 */
function mongooseShortId(schema, options) {
    options = options || {};
    var realPath = options.real || '_id';
    var virtualPath = options.virtual || 'shortId';

    schema.virtual(virtualPath)
        .get(function () {
            DEBUG && debug('get shortId for', this[realPath]);
            return encodeObjectId(String(this[realPath]));
        })
        .set(function (shortId) {
            DEBUG && debug('set shortId for', shortId);
            this[realPath] = mongoose.Types.ObjectId.createFromHexString(decodeObjectId(shortId));
        });
}

module.exports = mongooseShortId;
module.exports.encodeObjectId = encodeObjectId;
module.exports.decodeObjectId = decodeObjectId;
