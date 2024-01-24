
var _ = require('underscore'),
    fs = require('fs'),
    express = require('express'),
    path = require('path'),
    LRU = require("lru-cache"),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    errorHandler = require('errorhandler'),

    conf = require('./conf'),
    compiler = require('./compiler'),
    modules = require('./modules'),
    commonApi = require('./api/common'),
    collectApi = require('./api/collect'),
    clickApi = require('./api/click'),
    visibleApi = require('./api/visible'),
    browseApi = require('./api/browse'),
    eventApi = require('./api/event'),
    pvApi = require('./api/pv'),
    errorApi = require('./api/error'),

    app = express(),

    cache;

var root = __dirname;

var rstatic = /^\/.*\.(html|css|js|json|png|jpg|gif|bmp)$/i,
    rdir = /\/$/i,
    rhtml = /.*\.html$/i;

var vars = {},
    routes = {};

// 切换到开发模式
function dev() {
    console.info('switch to dev mode');
    conf.mode = 'dev';
    resetCache({max: 0, maxAge: 1});
}

// 切换到测试模式
function test() {
    console.info('switch to test mode');
    conf.mode = 'test';
    resetCache({max: 1000});
}

// 切换到生产模式
function prod() {
    console.info('switch to prod mode');
    conf.mode = 'prod';
    resetCache({max: 1000});
}

function resetCache(options) {
    cache = LRU(_.extend({
        max: 5000,
        maxAge: 1000 * 60 * 60 * 12
    }, options));
    console.info('reset cache', options);
}

// 采集脚本
function getJs(req, res) {
    var params = req.params,
        filename = params.filename,
        beginIndex = filename.indexOf('c.'),
        endIndex = filename.lastIndexOf('.js'),
        isAbbr = false,
        optionString,
        options,
        isMinify = true,
        abbr,
        js;
        
    if (beginIndex < 0) {
        beginIndex = 0;
        isAbbr = true;
    } else {
        beginIndex = 2;
    }

    optionString = filename.substring(beginIndex, endIndex);

    if (isAbbr) {
        abbr = optionString;
        options = modules.expand(abbr);
    } else {
        options = optionString.split('.');
        abbr = modules.abbr(options);
    }

    js = cache.get(abbr);
    if (!js) {
        if (conf.mode !== 'prod' && options.indexOf('src') > -1) {
            isMinify = false;
        }

        options.unshift(isMinify);
        try {
            js = compiler.compile.apply(compiler, options);
            if (js) {
                cache.set(abbr, js);
            }
        } catch(e) {
            res.send(404);
            console.log('compile error', e);
            return;
        }
    }

    res.set('Content-Type', 'text/javascript');
    res.set('Cache-Control', conf.cacheControl);
    // res.set('Expires', new Date(Date.now() + conf.expires * 1000));
    res.send(js);
}

function errMiddleware () {
    if (conf.mode === 'prod') {
        return function(err, req, res, next) {
            var msg = err.stack;
            if (err.mod) {
                msg = '[' + err.mod + '] ' + msg;
            }
            console.error(msg);

            if (err.status) {
                res.statusCode = err.status;
            } else {
                res.statusCode = 500;
            }

            // Todo  这里可以配置一些错误的处理
            res.end();
        };
    } else {
        return errorHandler();
    }
}

// 测试文件
function getTest(req, res) {
    if (conf.mode === 'prod') {
        res.send(404, 'no test available');
        return;
    }

    var parsedUrl = req._parsedUrl,
        pathname = parsedUrl.pathname,
        filename = path.resolve(root + '/../' + req.params.file);

    res.sendFile(filename);
}

// 初始化
/**
 * 初始化服务（启用中间件）
 * @return {[type]} [description]
 */
function init(port, host) {
    var name = conf.name,
        version = conf.version;


    // 配置常用变量
    app.set('name', name);
    app.set('version', version);
    app.set('mode', conf.mode);

    /**
     * current date
     */

    // logger.token('date', function getDateToken(req, res, format) {
    //     var date = new Date();

    //     switch (format || 'web') {
    //         case 'clf':
    //             return clfdate(date);
    //         case 'iso':
    //             return date.toISOString();
    //         case 'web':
    //             return date.toUTCString();
    //         case 'default':
    //             return date.toString();
    //     }
    // });
    // app.use(logger(':remote-addr - :remote-user [:date[default]] ":method :url HTTP/:http-version" ":referrer" ":user-agent" :status :res[content-length] - :response-time ms'));


    // for parsing application/json
    app.use(bodyParser.json({
        limit: '10mb',
    }));

    // for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb',
    }));

    // 日志统计API路由
    app.all('/collect',
            commonApi.allow,
            commonApi.before,
            collectApi.handle,
            commonApi.done
        );

    app.all('/pv',
            commonApi.allow,
            commonApi.before,
            pvApi.handle,
            commonApi.done
        );

    // 兼容微信小程序pv打印路由
    app.all('/log/pv',
            commonApi.allow,
            commonApi.before,
            pvApi.handle,
            commonApi.done
        );

    app.all('/event',
            commonApi.allow,
            commonApi.before,
            eventApi.handle,
            commonApi.done
        );

    app.all('/click',
            commonApi.allow,
            commonApi.before,
            clickApi.handle,
            commonApi.done
        );

    app.all('/visible',
            commonApi.allow,
            commonApi.before,
            visibleApi.handle,
            commonApi.done
        );
    app.all('/browse',
            commonApi.allow,
            commonApi.before,
            browseApi.handle,
            commonApi.done
        );

    app.all('/error',
            commonApi.allow,
            commonApi.before,
            errorApi.handle,
            commonApi.done
        );

    // 统计脚本请求
    app.get('/js/:filename', function (req, res, next) {
        getJs(req, res);
    });

    // 获取缩写
    // app.get('/abbr/:filename', function (req, res, next) {
    //     var params = req.params,
    //         filename = params.filename,
    //         endIndex = filename.lastIndexOf('.js'),
    //         optionString = filename.substring(2, endIndex),
    //         options = optionString.split('.');
    //     res.send(modules.abbr(options));  
    // });


    // 原始文件
    app.get('/collect/:file', function (req, res) {
        getTest(req, res);  
    });

    // 找不到页面
    app.use(function (req, res, next) {
        res.status(404).send('404 Not Found');
    });

    // 错误处理
    app.use(errMiddleware());

    // 配置监听端口
    var serverOptions = [
        port,
    ];

    // 配置监听host
    if (host) {
        serverOptions.push(host);
    }

    // 监听回调
    serverOptions.push(function () {
        console.log('[mode:', conf.mode, '] listening on port ', port);
    });

    return app.listen.apply(app, serverOptions);
}

exports.app = app;
exports.dev = dev;
exports.test = test;
exports.prod = prod;
exports.resetCache = resetCache;
exports.init = init;