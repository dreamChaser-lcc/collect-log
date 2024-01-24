var fs = require('fs'),
    path = require('path'),

    _ = require('underscore'),
    dateFormat = require('dateformat'),
    CronJob = require('cron').CronJob,

    // 日志存放路径
    logDir,

    // 临时数据存储
    // {
    //     v: {
    //         page: {
    //             2015011816: []
    //         },
    //         click: {
    //             2015011816: []
    //         }
    //     }
    // }
    storages = {},

    // 存放日志的块
    // {
    //     v: {
    //         page: [],
    //         click: []
    //     }
    // }
    blocks = {},
    maxBlockCount = 500,

    loggers = {};

// 获取当前时间标签
function getNowLabel() {
    return dateFormat(new Date(), 'yyyy-mm-dd-HH');
}

// 配置日志路径
function setLogDir(_dir) {
    if(_dir) {
        logDir = path.resolve(_dir);
        _dir = '';
        var dirParts = logDir.split(/[\/\\]/),
            dirDepth = dirParts.length;
        for (var i = 0; i < dirDepth; i++) {
            _dir += dirParts[i] + '/';
            if (!fs.existsSync(_dir)) {
                fs.mkdirSync(_dir);
            }
        }
    }
}

// 配置最大区块值
function setMaxBlockCount(_count) {
    if (!isNaN(_count)) {
        maxBlockCount = _count;
    }
}

// 获取 Block
function getBlock(app, type) {
    if (!app || !type) {
        return;
    }

    var appBlock = blocks[app];
    return appBlock && appBlock[type];
}

// 获取或创建 Block
function getOrCreateBlock(app, type) {
    if (!app || !type) {
        return;
    }

    var appBlock = blocks[app];
    if (!appBlock) {
        appBlock = blocks[app] = {};
    }

    var block = appBlock[type];
    if (!block) {
        block = appBlock[type] = [];
    }

    return block;
}

// 删除区块
function deleteBlock(app, type) {
    if (!app || !type) {
        return;
    }

    var appBlock = blocks[app];
    if (appBlock) {
        delete appBlock[type];
    }
    return true;
}

function addBlockToStorage(app, type, block) {
    if (!app || !type || !block) {
        return;
    }

    var appStorage = storages[app];
    if (!appStorage) {
        appStorage = storages[app] = {};
    }

    // 检查是否存在类型
    var typeStorage = appStorage[type];
    if (!typeStorage) {
        typeStorage = appStorage[type] = {};
    }

    // 检查是否存在当前时间
    var time = getNowLabel(),
        timeStorage = typeStorage[time];
    if (!timeStorage) {
        timeStorage = typeStorage[time] = [];
    }

    // 将 block 添加到最末尾
    timeStorage.push(block);

    return true;
}

function deleteStorage(app, type, time) {
    if (!app && !type && !time) {
        return;
    }

    if (!type && !time) {
        delete storages[app];
        return true;
    }

    var appStorage = storages[app];
    if (!time) {
        if (appStorage) {
            delete appStorage[type];
        }
        return true;
    }

    var typeStorage = appStorage && appStorage[type];
    if (typeStorage) {
        delete typeStorage[time];
    }
    return true;
}

function getStorage(app, type, time) {
    if (!app && !type && !time) {
        return;
    }

    var appStorage = storages[app];
    if (_.isUndefined(type)) {
        return appStorage;
    }

    var typeStorage = appStorage && appStorage[type];
    if (_.isUndefined(time)) {
        return typeStorage;
    }

    var timeStorage = typeStorage && typeStorage[time];
    return timeStorage;
}

// 将临时存储的数据写入文件
function dumpFile() {
    var filename,
        data,
        count;

    if (!logDir) {
        throw 'NO_LOG_DIR';
        return false;
    }
    // console.log('dumping file: ' + dateFormat(new Date(), 'yyyymmddHHmmss') + '.');

    _.each(storages, function (appStorage, app) {
        _.each(appStorage, function (typeStorage, type) {
            var isEmpty = true;
            _.each(typeStorage, function (timeStorage, time) {
                // filename =  path.resolve(logDir, app + '_' + type + '_' + time + '.log');
                filename =  path.resolve(logDir, 'stat' + '_' + type + '.log.' + time);
                data = '';
                count = 0;

                _.each(timeStorage, function (block) {
                    count += block.length;
                    data += block.join('\n') + '\n';
                });

                try {
                    fs.appendFile(filename, data, {flags: 'a', encoding: 'utf-8'}, function () {
                        console.log('Append log file: ' + filename + ' success, log count: ' + count);
                    });
                    deleteStorage(app, type, time);
                } catch(e) {
                    console.error('Append log file: ' + filename + ' FAIL, log count: ' + count);
                    console.error(e);
                    isEmpty = false;
                }
            });
            if (isEmpty) {
                deleteStorage(app, type);
            }
        });
    });

    return true;
}

// 每个整点将日志临时块存储入缓存中
// 并将对应 APP 删除
function flushBlock() {
    console.log('flushing block: ' + dateFormat(new Date(), 'yyyymmddHHmmss') + '.');
    _.each(blocks, function (appBlocks, app) {
        _.each(appBlocks, function (typeBlock, type) {
            addBlockToStorage(app, type, typeBlock);
            deleteBlock(app, type);
        });
    });
    return true;
}

// 将日志键值对输出为字符串
function formatLog(keyValue) {
    if (_.isArray(keyValue)) {
        return JSON.stringify(keyValue);
    } else if (_.isObject(keyValue)) {
        var arr = [];
        for(var key in keyValue) {
            if (typeof keyValue[key] === 'string' && (key === 'page' || key === 'name')) {
                keyValue[key] = (keyValue[key] || '').replace(/(\s*|\t|\r|\n|`)+/g, "");;
            }

            arr.push(key + '=' + keyValue[key]);
        }
        return arr.join('`');
    } else {
        return keyValue;
    }

}

// 记录日志
// 每写满 block 上限就移动到 storage 中存储并创建新的
function log(app, type, keyValue) {
    var block = getOrCreateBlock(app, type);
    block.push(formatLog(keyValue));
    if (block.length >= maxBlockCount) {
        addBlockToStorage(app, type, block);
        deleteBlock(app, type);
    }
    return true;
}

/*
 * 初始化日志处理：
 *  1.日志路径初始化
 *  2.每隔一个小时清空日志处理容器
 */
function init(_dir) {
    setLogDir(_dir);

    // 每个整点将日志临时块存储入缓存中
    new CronJob('59 59 */1 * * *', flushBlock, null, true);

    // 每隔一段时间（5秒）将数据写入硬盘
    setTimeout(function () {
        setInterval(dumpFile, 3000);
    }, Math.floor(Math.random() * 10000));
}

// 清空日志
function clean() {
    if (!logDir) {
        return;
    }

    try {
        fs.rmdirSync(logDir);
        setLogDir(logDir);
        return true;
    } catch(e) {
        console.error('clean log FAIL: ', e);
        return false;
    }
}

exports.setLogDir = setLogDir;
exports.setMaxBlockCount = setMaxBlockCount;
exports.formatLog = formatLog;
exports.getNowLabel = getNowLabel;

exports.getBlock = getBlock;
exports.getOrCreateBlock = getOrCreateBlock;
exports.deleteBlock = deleteBlock;
exports.flushBlock = flushBlock;

exports.getStorage = getStorage;
exports.addBlockToStorage = addBlockToStorage;
exports.dumpFile = dumpFile;

exports.init = init;
exports.log = log;
exports.clean = clean;
