var _ = require('underscore'),

    log = require('../log'),
    common = require('./common');

function handle(req, res, next) {
    req._options.logtype = req._options.debug === '1' ?
                    'debug' : 'pv';

    _.each(req._logs, function (lg) {
        for (var key in lg) {
            if (typeof lg[key] === 'undefined') {
                lg[key] = '';
            }
        }
    });

    next();
}

exports.handle = handle;
