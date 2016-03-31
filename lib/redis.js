/**
 * Express - Redis
 * Copyright(c) 2014 Elliott Foster <elliottf@codebrews.com>
 * MIT Licensed.
 */

var redis = require('redis');
var debug = require('debug')('express:redis');

var client;

module.exports = function (url, options, name) {
  url = url || 'redis://localhost:6379/';
  options = options || {};
  name = name || 'redis';

  client = redis.createClient(url, options);

  var f = function (req, res, next) {
    if (client.connected) {
      req[name] = client;
      next();
    }
    else {
      client.on('ready', function () {
        debug('Redis connection ready.');
        req[name] = client;
        next();
      });
    }
  };

  // Expose the client in the return object.
  f.client = client;

  f.connect = function (next) {
    if (client && client.connected) {
      client.once('end', function () {
        client = redis.createClient(url, options);
        next();
      });
      client.quit();
    }
    else {
      client = redis.createClient(url, options);
      next();
    }
  };

  f.disconnect = function (next) {
    if (client) {
      client.once('end', function () {
        client = null;
        next();
      });
      client.quit();
    }
    else {
      next();
    }
  };

  return f;
};

