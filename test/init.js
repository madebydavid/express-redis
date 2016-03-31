var expressRedis = require('../');
var redis = require('redis');
var sinon = require('sinon');
var EventEmitter = require('events').EventEmitter;

module.exports = {
  noOpts: function (test) {
    test.expect(3);
    this.stub = sinon.stub(redis, 'createClient', function () {
      return {connected: true};
    });

    var mWare = expressRedis();
    test.equal(typeof mWare.connect, 'function', 'Connect method not added.');
    test.equal(typeof mWare.disconnect, 'function', 'Disconnect method not added.');

    var req = {};
    mWare(req, {}, function () {
      test.notEqual(typeof req.redis, 'undefined', 'Redis not added to request.');
      test.done();
    });
  },
  delayedReady: function (test) {
    test.expect(1);
    var conn = new EventEmitter();
    this.stub = sinon.stub(redis, 'createClient', function () {
      return conn;
    });

    var mWare = expressRedis();

    var req = {};
    mWare(req, {}, function () {
      test.notEqual(typeof req.redis, 'undefined', 'Redis not added to request.');
      test.done();
    });

    conn.emit('ready');
  },
  customUrl: function (test) {
    test.expect(1);
    var testUrl = 'redis://example.com:1/';

    this.stub = sinon.stub(redis, 'createClient', function (url) {
      test.equal(url, testUrl, 'Custom url not used.');
      test.done();
    });

    expressRedis(testUrl);
  },
  customOptions: function (test) {
    test.expect(1);
    var testOpts = {test:1};

    this.stub = sinon.stub(redis, 'createClient', function (url, options) {
      test.equal(options.test, testOpts.test, 'Custom options not used.');
      test.done();
    });

    expressRedis(undefined, testOpts);
  },
  customName: function (test) {
    test.expect(1);
    this.stub = sinon.stub(redis, 'createClient', function () {
      return {connected: true};
    });

    var mWare = expressRedis(undefined, undefined, 'db');
    var req = {};
    mWare(req, {}, function () {
      test.notEqual(
        typeof req.db,
        'undefined',
        'Custom redis name not added to request.'
      );
      test.done();
    });
  }
};

