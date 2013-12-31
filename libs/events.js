'use strict';

/**
 * mongoose plugin to emit events for before/after of save/insert/update/remove.
 *
 * @param {mongoose.Schema} schema
 * @param {{noBeforeEvents:boolean,noAfterEvents:boolean}} [options={}]
 */
function mongooseEvents(schema, options) {
  options = options || {};
  var beforeSave = options.beforeSave || 'beforeSave';
  var afterSave = options.afterSave || 'afterSave';
  var beforeInsert = options.beforeInsert || 'beforeInsert';
  var afterInsert = options.afterInsert || 'afterInsert';
  var beforeUpdate = options.beforeUpdate || 'beforeUpdate';
  var afterUpdate = options.afterUpdate || 'afterUpdate';
  var beforeRemove = options.beforeRemove || 'beforeRemove';
  var afterRemove = options.afterRemove || 'afterSave';
  var emitter = options.emitter;

  schema.pre('save', function (next) {
    if (!emitter) {
      emitter = this.model(this.constructor.modelName);
    }
    emitter.emit(beforeSave, this);
    this.__saveNew = this.isNew;
    emitter.emit(this.__saveNew ? beforeInsert : beforeUpdate, this);
    next();
  });
  schema.pre('remove', function (next) {
    if (!emitter) {
      emitter = this.model(this.constructor.modelName);
    }
    emitter.emit('beforeRemove', this);
    next();
  });
  schema.post('save', function () {
    if (!emitter) {
      emitter = this.model(this.constructor.modelName);
    }
    emitter.emit('afterSave', this);
    emitter.emit(this.__saveNew ? afterInsert : afterUpdate, this);
    delete this.__saveNew;
  });
  schema.post('remove', function () {
    if (!emitter) {
      emitter = this.model(this.constructor.modelName);
    }
    emitter.emit(afterRemove, this);
  });
}

module.exports = mongooseEvents;
