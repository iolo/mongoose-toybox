'use strict';

var
    mongoose = require('mongoose'),
    debug = require('debug')('mongoose-toybox:sequence'),
    DEBUG = debug.enabled;

/**
 *
 * @param {String} name
 * @param {Number} [startWith=1]
 * @param {Number} [incrementBy=1]
 * @returns {*}
 * @see http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field
 */
function getOrCreateSequence(name, startWith, incrementBy) {
    startWith = startWith || 1;
    incrementBy = incrementBy || 1;

    var SequenceModel;
    try {
        SequenceModel = mongoose.model('sequences');
    } catch (err) {
        // rethrown unknown error!
        if (err.name !== 'MissingSchemaError') {
            throw err;
        }
        DEBUG && debug('create sequence ', name, 'start with', startWith, 'increment by', incrementBy);
        SequenceModel = mongoose.model('sequences', mongoose.Schema({
            _id: String,
            seq: Number
        }));
        // TODO: at first time, initialize with 'startWith'
        //if (startWith !== 1) {
        //  SequenceModel.collection.insert({_id: name, seq: startWith});
        //}
    }
    var query = {_id: name};
    var sort = [];
    var doc = {$inc: {seq: incrementBy}};
    var opts = {new: true, upsert: true};
    return {
        next: function (callback) {
            return SequenceModel.collection.findAndModify(query, sort, doc, opts, function (err, result) {
                if (err) {
                    DEBUG && debug('findAndModify err', err);
                    return callback(err);
                }
                DEBUG && debug('findAndModify ok:', name + '.nextval=', result.seq);
                return callback(null, result.seq);
            });
        },
        reset: function (callback) {
            return SequenceModel.collection.remove(query, {w: 1}, callback);
        }
    };
}

/**
 *
 * @param {mongoose.Schema} schema
 * @param {{fieldName:String, name:String, startWith:Number, incrementBy:Number}} options
 */
function mongooseSequence(schema, options) {
    options = options || {};
    var fieldName = options.fieldName || '_id';
    var sequence = getOrCreateSequence(options.name, options.startWith, options.incrementBy);

    schema.pre('save', function (next) {
        var self = this;
        sequence.next(function (err, seq) {
            if (err) {
                DEBUG && debug('sequence.next err', err);
                return next(err);
            }
            DEBUG && debug('sequence.next ok', seq);
            self[fieldName] = seq;
            next();
        });
    });
}

module.exports = mongooseSequence;
module.exports.getOrCreateSequence = getOrCreateSequence;
