'use strict';

var
    Q = require('q'),
    mongoose = require('mongoose'),
    shortIdPlugin = require('../libs/short_id'),
    debug = require('debug')('mongoose-toybox:test');

var TestSchema = new mongoose.Schema({
    //_id: mongoose.Schema.Types.ObjectId,
    name: String
});

TestSchema.set('toObject', {virtuals: true}); // for debug dump

TestSchema.plugin(shortIdPlugin);

var TestModel = mongoose.model('ShortIdTest', TestSchema);

module.exports = {
    setUp: function (callback) {
        mongoose.connect('mongodb://localhost/test');
        TestModel.collection.drop();
        setTimeout(callback, 100);
    },
    tearDown: function (callback) {
        mongoose.disconnect(callback);
    },
    test_codec: function (test) {
        var id = new mongoose.Types.ObjectId();
        var shortId = shortIdPlugin.encodeObjectId(id);
        debug('id=', id, '--> shortId=', shortId);
        test.equal(String(shortIdPlugin.decodeObjectId(shortId)), id);
        test.done();
    },
    test_save: function (test) {
        var foo = new TestModel({name: 'foo'});
        foo.save(function (err) {
            if (err) {
                debug('*** save foo err', err);
                test.ifError(err);
                return test.done();
            }
            debug('*** save foo ok', foo);
            test.equal(foo.shortId, shortIdPlugin.encodeObjectId(foo._id));
            test.equal(foo.name, 'foo');

            var bar = new TestModel({name: 'bar'});
            bar.save(function (err) {
                if (err) {
                    debug('*** save bar err', err);
                    test.ifError(err);
                    return test.done();
                }
                debug('*** save bar ok', bar);
                test.equal(bar.shortId, shortIdPlugin.encodeObjectId(bar._id));
                test.equal(bar.name, 'bar');
                test.done();
            });
        });
    },
    test_create: function (test) {
        TestModel.create({name: 'foo'}, function (err, foo) {
            if (err) {
                debug('*** create foo err', err);
                test.ifError(err);
                return test.done();
            }
            debug('*** create foo ok', foo.shortId);
            test.equal(foo.shortId, shortIdPlugin.encodeObjectId(String(foo._id)));
            test.equal(foo.name, 'foo');

            TestModel.create({name: 'bar'}, function (err, bar) {
                if (err) {
                    debug('*** create bar err', err);
                    test.ifError(err);
                    return test.done();
                }
                debug('*** create bar ok', bar);
                test.equal(bar.shortId, shortIdPlugin.encodeObjectId(bar._id));
                test.equal(bar.name, 'bar');
                test.done();
            });
        });
    },
    test_create_array: function (test) {
        TestModel.create({name: 'foo'}, {name: 'bar'}, function (err, foo, bar) {
            if (err) {
                debug('*** create_array err', err);
                test.ifError(err);
                return test.done();
            }
            debug('*** create_array ok', foo);
            test.equal(foo.shortId, shortIdPlugin.encodeObjectId(foo._id));
            test.equal(foo.name, 'foo');
            test.equal(bar.shortId, shortIdPlugin.encodeObjectId(bar._id));
            test.equal(bar.name, 'bar');
            test.done();
        });
    }
};
