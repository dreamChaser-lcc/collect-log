/**
 * 初始化
 */

// --------采集脚本主方法-----------------------------------------------
// 按顺序初始化采集脚本所需的各种变量、获取所需的配置和数据、加入对各事件的监听、判定是否需要发送错误数据


// 处理变量
msg.on('processVar', function () {
    // 读取最后的页面URL
    // lastURL = storage.lastURL() || null;
    log.debug('[lastURL: ' + lastURL + ']');
});

// 绑定事件监听
msg.on('bindEvent', function () {
    // 监听document的ready事件，绑定ready处理方法
    ready(onReady);
    // 如果页面在ready超时时间之前都没有准备完毕，那么视为页面已经ready直接发送load数据
    // 如果超时时间为-1则不强制执行ready处理方法
    if (readyTimeout > -1) {
        timer.once(onReady, readyTimeout);
    }
    
    // 离开页面的数据应在是在beforeunload事件时触发
    domEvent.on(win, 'beforeunload', onLeave);

    // 监听窗口变化事件
    domEvent.on(win, 'resize', onResize);
});

function qla(name) {
    if (name) {
        var args = slice.call(arguments, 1),
            names = name.split(','),
            item, fn, context;
        names.forEach(function (name) {
            item = api[name];
            if (item) {
                if (isFunction(item)) {
                    item.apply(that, args);
                } else if (isArray(item)) {
                    fn = item[0];
                    context = item[1];
                    fn.apply(context, args);
                }
                
            }
        });
    }
    return this;
}

// 如果已经存在采集脚本的全局变量
if (win['_' + name]) {
    // 判断是否开启了单例模式，如果开启单例模式则终止采集脚本初始化
    if (singleton) {
        log.warn('!singleton is enabled, already exists _' + name + ', stop initialization!');
        return;
    }
}

log.info('.:start initialization queue:.');

win['_' + name] = qla;

extend(qla, api);

// 执行初始化队列
msg.trigger('beforeInit');

// 检测浏览器等环境
detectEnvi();

// 初始化窗体相关数据
onResize();

msg.trigger('init');

msg.trigger('readVar');

if (win._uaq) {
    each(win._uaq, function (args) {
        qla.apply(that, args);
    }, that);
    win._uaq = null;
}

// 读取其他采集脚本所需配置
msg.trigger('processVar');

msg.trigger('bindEvent');

msg.trigger('afterInit');

log.info('.:initialization queue finished:.');