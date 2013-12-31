'use strict';

var
  Q = require('q'),
  mongoose = require('mongoose'),
  sequencePlugin = require('../libs/sequence'),
  debug = require('debug')('mongoose-toybox:test');

var TestSchema = new mongoose.Schema({
  _id: Number,//use sequence here!
  name: String
});

TestSchema.plugin(sequencePlugin, {name: 'testSeq'});

var TestModel = mongoose.model('SequenceTest', TestSchema);

module.exports = {
  setUp: function (callback) {
    mongoose.connect('mongodb://localhost/test');
    TestModel.collection.drop();
    sequencePlugin.getOrCreateSequence('testSeq').reset(callback);
  },
  tearDown: function (callback) {
    mongoose.disconnect(callback);
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
      test.equal(foo._id, 1);
      test.equal(foo.name, 'foo');

      var bar = new TestModel({name: 'bar'});
      bar.save(function (err) {
        if (err) {
          debug('*** save bar err', err);
          test.ifError(err);
          return test.done();
        }
        debug('*** save bar ok', bar);
        test.equal(bar._id, 2);
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
      debug('*** create foo ok', foo);
      test.equal(foo._id, 1);
      test.equal(foo.name, 'foo');

      TestModel.create({name: 'bar'}, function (err, bar) {
        if (err) {
          debug('*** create bar err', err);
          test.ifError(err);
          return test.done();
        }
        debug('*** create bar ok', bar);
        test.equal(bar._id, 2);
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
      test.equal(foo._id, 1);
      test.equal(foo.name, 'foo');
      test.equal(bar._id, 2);
      test.equal(bar.name, 'bar');
      test.done();
    });
  }
};
