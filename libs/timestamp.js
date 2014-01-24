'use strict';

/**
 * mongoose plugin to add createAt/updatedAt fields.
 *
 * @param {mongoose.Schema} schema
 * @param {{createdAt:string,updatedAt:string,noVirtualCreatedAt:boolean}} [options={}]
 */
function mongooseTimestamp(schema, options) {
    options = options || {};
    var createdAtPath = options.createdAt || 'createdAt';
    var updatedAtPath = options.updatedAt || 'updatedAt';
    var noVirtualCreatedAt = !!options.noVirtualCreatedAt;

    if (noVirtualCreatedAt) {
        schema.path(createdAtPath, Date);
        schema.path(updatedAtPath, Date);
        schema.pre('save', function (next) {
            var now = new Date();
            if (this.isNew) {
                this[createdAtPath] = now;
            }
            this[updatedAtPath] = now;
            next();
        });
    } else {
        schema.virtual(createdAtPath).get(function () {
            return this._id.getTimestamp();
        });
        schema.path(updatedAtPath, Date);
        schema.pre('save', function (next) {
            this[updatedAtPath] = new Date();
            next();
        });
    }
}

module.exports = mongooseTimestamp;
