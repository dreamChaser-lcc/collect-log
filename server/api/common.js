var _ = require('underscore'),
    url = require('url'),
    dateFormat = require('dateformat'),

    log = require('../log-file'),
    mime = require('../mime'),

    conf = require('../conf');

/**
 * 是否允许提交日志请求（通过配置站点域名白名单whiteSites配置）
 * @DateTime 2016-12-21T14:59:25+0800
 * @param    {[type]}                           req  [description]
 * @param    {[type]}                           res  [description]
 * @param    {Function}                         next [description]
 * @return   {[type]}                                [description]
 */
function allow(req, res, next) {
    var referrer = req.get('Referrer'),
        allow = false;

    var urlObj = url.parse(referrer || ''),
        host = urlObj.host || '';

    _.each(conf.whiteSites, function(site) {
        if (host.indexOf(site) > -1 && !/test(\d)*\.m\.qlchat\.com/.test(host)) {
            allow = true;
            return;
        }
    });

    if (allow || conf.mode != 'prod' || req.query.site === 'weapp' ||  req.query.caller === 'weapp') {
        next();
    } else {
        res.status(403).send('403 Forbidden!');
    }
}

/**
 * 对请求进行预处理
 * 辨别请求是 get 还是 post 方式
 * 在 req 中增加字段：
 * _options: {} // 配置，执行过程中需要用到的参数，不写入到日志
 * _params: {} // 参数，存储一些必要的要写入日志中的参数
 * _logs : [{}, {}] // 数组，存储日志内容
 *
 */
function before(req, res, next) {
    // 不缓存
    res.set('Cache-Control', 'no-cache');
    res.set('Expires', 1);

    var query = req.query;

    // 测试模式下直接返回 200 头，不存储日志
    if (query.test === '1') {
        if (query.response === '1') {
            sendResponse(req, res, 200);
        } else {
            res.set('Content-Type', mime.png);
            res.sendStatus(200);
        }
        return;
    }

    // site 为空
    if (!query.site || query.site === 'null') {
        res.status(400).send('no site name');
        // TODO 本地记录 BAD REQUEST
        return;
    }

    // 初始化参数存储字段
    req._options = {};
    req._params = {};
    req._logs = [];

    for (var key in query) {
        // 多进行一次 decode
        try {
            query[key] = decodeURIComponent(query[key]);
        } catch (error) {
            console.error('Error decode: ' + key + '=' + query[key]);
        }
    }

    // POST
    if (req.method === 'POST') {
        var logs = req.body.log || [];

        //单条日志时为字符串
        if ('string' === typeof logs) {
            logs = [logs];
        }
        req._logs = logs.map(function (str) {
            var log = {},
                kvs = str.split('&');
            kvs.forEach(function (s) {
                var kv = s.split('=');
                log[kv[0]] = decodeURIComponent(kv[1]);
            });

            addTM(log);
            return log;
        });

    // GET
    } else {
        var log = req.query;

        if (req.query.logs) {
            var logs = [];

            try {
                logs = JSON.parse(req.query.logs);
            } catch(err) {
                console.error('parse log array error.', err);
                console.log('error logs:', req.query.logs);
            }

            delete req.query.logs;

            _.each(logs, function(lg) {
                addTM(lg);
                _.extend(lg, req.query);
            });

            req._logs = logs;

        } else {
            addTM(log);
            req._logs = [log];
        }
    }

    // ip
    req._params.ip = req.get('X-Real-Ip') || '';

    // site
    req._params.site = req.query.site;

    //options参数收集
    if (query.test) {
        req._options.test = query.test;
    }
    if (query.response) {
        req._options.response = query.response;
    }
    if (query.debug) {
        req._options.debug = query.debug;
    }

    next();
}

/*
 * 请求处理完成后返回状态信息
 */
function done(req, res, next) {
    var options = req._options;

    _.each(req._logs, function (lg) {
        //扩展参数
        _.extend(lg, req._params);

        log.log(req._params.site, req._options.logtype, lg);
    });

    // 只在 response = 1 时返回结果数据
    if (options.response === '1') {
        sendResponse(req, res, 200);

    // 只返回 head
    } else {
        res.set('Content-Type', mime.png);
        res.sendStatus(200);
    }
}

/**
 * 发送返回数据
 */
function sendResponse(req, res, code) {
    if (code === 200) {
        code = 0;
    }

    var query = req.query,
        callbackFn = query.callback,
        json = {
             result: {
                code: code
            }
        };
    if (callbackFn) {
        res.set('Content-Type', mime.js);
        res.send(callbackFn + '(' + JSON.stringify(json) + ')');
    } else {
        res.set('Content-Type', mime.json);
        res.send(json);
    }
}

/*
 * 判断对象为空
 */
function isEmptyObject(obj) {
    for(var key in obj) {
        return false;
    }
    return true;
}

/**
 * 前部补0
 */
function add0(num) {
    return num < 9 ? '0' + num : num;
}

/**
 * 创建时间戳
 */
function addTM(o) {
    var date = new Date();
    o.tm = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l');
    // o.tm = date.getTime();
    // o.tm = date.getFullYear() + '-' + add0(date.getMonth() + 1) + '-' +
    //             add0(date.getDate()) + ' ' + add0(date.getHours()) + ':' +
    //             add0(date.getMinutes()) + ':' + add0(date.getSeconds());
}

exports.isEmptyObject = isEmptyObject;

exports.allow = allow;
exports.before = before;
exports.done = done;
