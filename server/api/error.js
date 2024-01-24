var _ = require('underscore'),
    
    log = require('../log'),
    common = require('./common');

/*
 * 请求处理前的操作
 */
function handle(req, res, next) {
    req._options.logtype = req._options.debug === '1' ?
                    'debug' : 'error';

    for (var i = req._logs.length - 1; i >=0 ; i--) {
        var lg = req._logs[i];
        //过滤掉缺少必要参数的日志
        if(typeof lg.message === 'undefined') {
            req._logs.splice(i, 1);
        }
        // TODO 本地标记无效的log
    }

    next();
}

exports.handle = handle;