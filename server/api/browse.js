var _ = require('underscore'),

    log = require('../log'),
    common = require('./common');


/*
 * 请求处理前的操作
 */
function handle(req, res, next) {
    req._options.logtype = req._options.debug === '1' ?
                    'debug' : 'browse';

    _.each(req._logs, function (lg) {
        for (var key in lg) {
            if (typeof lg[key] != 'undefined') {
                try {
                    lg[key] = decodeURIComponent(lg[key]);
                } catch (error) {
                    console.error('Error decode log param: ' + key + '=' + lg[key]);
                    lg[key] = lg[key];
                }
            }
        }
    });

    next();
}

exports.handle = handle;
