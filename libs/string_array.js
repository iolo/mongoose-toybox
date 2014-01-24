'use strict';

var
    utils = require('node-toybox').utils;

/**
 * mongoose plugin to add virtual field to set/get string array field at once.
 *
 * @param {mongoose.Schema} schema
 * @param {{real:string,virtual:string,separator:string}} [options={}]
 */
function mongooseStringArray(schema, options) {
    options = _.merge(options, {
        real: 'tags',
        virtual: 'tagsAll',
        separator: ','
    });

    schema.virtual(options.virtual)
        .get(function () {
            return utils.join(this[options.real], options.separator);
        })
        .set(function (virtualValue) {
            this[options.real] = utils.split(virtualValue, options.separator);
            this.markModified(options.real);
        });
}

module.exports = mongooseStringArray;
