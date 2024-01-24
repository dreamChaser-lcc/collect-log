var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    conf = require('../conf/config.json');

exports.mode = 'dev';
exports.debug = true;

exports.clusterCount = 0;

exports.logBuffer = 500;

exports.cacheControl = 'no-cache';
exports.expires = 0;

exports.whiteSites = [];

exports.requestTimeout = 10000;

exports.logApiSecret = '846d2cb0c7f09c3ae802c42169a6302b';
exports.logApi = 'http://118.178.20.138:8282/h5/system/upload-log';
exports.logDir = path.resolve(__dirname + '/../private/log1');

for (var key in conf) {
    var value = conf[key];
    if (typeof value !== 'undefined') {
        exports[key] = value;
    }
}

for (var key in exports) {
    console.log('read conf: ', key + '=' + util.inspect(exports[key]));
}
