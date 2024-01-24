var fs = require('fs'),
    http = require('http'),
    cluster = require('cluster'),
    os = require('os'),
    numCPUs = require('os').cpus().length,
    conf = require('./conf'),
    clusterCount = Number(conf.clusterCount),
    path = require('path'),
    commander = require('commander'),
    server = require('./server'),
    log = require('./log-file'),
    logDir = conf.logDir,
    logBuffer = conf.logBuffer,
    app = server.app,
    worker,
    address,
    port,
    host,
    pidFile,
    mode;

function start() {
    if (clusterCount <= 0) {
        // 创建新的服务器
        try {
            server.init(port, host);
        } catch(e) {
            console.error('server error', e.message);
        }
    } else {
        // 超过 CPU 核心数设置为和 CPU 核心数相同
        if (clusterCount > numCPUs) {
            console.warn('clusterCount ', clusterCount, ' is larger than numCPUs ', numCPUs);
            clusterCount = numCPUs;
            console.info('set clusterCount to ', clusterCount);
        }

        if (cluster.isMaster) {
            // Fork workers.
            for (var i = 0; i < clusterCount; i++) {
                cluster.fork();
            }

            cluster.on('exit', function(worker, code, signal) {
                console.warn('worker ' + worker.process.pid + ' died');
                console.warn('code ', code);
                console.warn('signal', signal);
            });
        } else {
            // Workers can share any TCP connection
            // In this case its a HTTP server
            // 创建新的服务器
            try {
                server.init(port, host);
            } catch(e) {
                console.error('server error', e.message);
            }
        }
    }

    console.log('CPU Count', numCPUs);
    console.log('Cluster Count', clusterCount);
    console.log('Server Mode', mode);
    console.log('Server Host', host);
    console.log('Listening on', port);
    console.log('pid', process.pid);

    process.on('uncaughtException', function (e) {
        console.log('Caught exception:', e);
    });

    if (pidFile) {
        fs.writeFileSync(pidFile, process.pid);
        process.on('SIGINT', function () {
            if (fs.existsSync(pidFile)) {
                fs.unlinkSync(pidFile);
            }
            process.kill(process.pid);
        });
    }
}

if (require.main === module) {
    // 配置命令行参数
    commander.option('-p, --port <number>', 'server port')
        .option('-h, --host <ip>', 'ipv4 address')
        .option('-P, --pidfile <path>', 'path of pidfile')
        .option('-m, --mode <dev|prod>', 'server mode')
        .parse(process.argv);

    console.log('commander.port', commander.port);
    console.log('commander.pidfile', commander.pidfile);
    console.log('commander.mode', commander.mode);

    console.log('process.env.PORT', process.env.PORT);
    console.log('process.env.UAE_MODE', process.env.UAE_MODE);

    port = (commander.port && parseFloat(commander.port)) || process.env.PORT || 4999;

    // 指定运行ip地址
    if (commander.host) {
        if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(commander.host)) {
            host = commander.host.trim();
        }
    }

    pidFile = commander.pidfile;

    // 从命令行参数中读取，如果没有就默认设置为开发环境
    mode = commander.mode || 'dev';

    // 尝试读取 UAE 环境变量
    if (process.env.UAE_MODE) {
        mode = process.env.UAE_MODE;
    }

    console.log('mode', mode);

    // 非生产/测试模式，清空日志
    if (mode !== 'prod' || mode !== 'test') {
        log.clean();
    }

    // 初始化日志工具
    console.log('setup logs');
    log.init(logDir);
    log.setMaxBlockCount(logBuffer);

    // 设定服务器模式
    if (mode === 'dev') {
        server.dev();
    } else if (mode === 'test') {
        server.test();
    } else if (mode === 'prod') {
        server.prod();
    }

    // 启动服务器
    console.log('starting server');
    // cluster 模式启动服务
    // start();

    server.init(port, host);
}
