// 读取全局配置变量
msg.on('readVar', function () {
    log.debug('--start reading global config vars');

    // 读取是否配置为单例模式
    singleton = !!($_get('singleton') || $_get('sing') || singleton);
    log.debug('[singleton: ' + singleton + ']');


    var uid = storage.get('uid');
    log.debug('[*uid from storage*: ' + uid + ']');
    if (!common.uid) {
        common.uid = $_get('viewId') || uid || uuid('ql');
    }
    if (!uid || uid !== common.uid) {
        storage.set('uid', common.uid);
    }
    log.debug('[*uid*: ' + common.uid + ']');


    // 插入单次浏览记录的唯一标识
    if(typeof window !== 'undefined'){
        var viewId = window.viewId;
        if (!common.viewId) {
            common.viewId = window.viewId || uuid('ql');
        }
        if (!viewId || viewId !== common.viewId) {
            window.viewId = common.viewId;
        }
    }

    // 获取会话id
    var sid = session.get('sid');
    if (!sid) {
        sid = common.uid + Date.now();
        session.set('sid', sid);
    }
    common.sid = sid;
    log.debug('[*sid*: ' + common.sid + ']');

    // 读取采集端服务器列表
    if ($_get('s')) {
        conf.server = $_get('s');
    }

    // 读取页面ready超时时间
    if (isNumber($_get('rdy_to'))) {
        readyTimeout = $_get('rdy_to');
    }
    log.debug('[page ready timeout: ' + readyTimeout + ']');

    // 读取采集时间超时阀值
    if (isNumber($_get('clt_to'))) {
        collectTimeout = $_get('clt_to');
    }
    log.debug('[collect timeout: ' + collectTimeout + ']');

    if (browser.name) {
        common.br = browser.name;
        common.brv = browser.version;
    }

    extend(common, {
        // sid: $_get('sid') || uuid('s'),
        // cd: colorDepth,
        ua: ua,
        ck: cookieEnabled ? 1 : 0,
        tz: timeZone,
        rs: resolution,
        // ht: domain
    });
});
