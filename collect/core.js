/**
 * 统计核心
 */

// 处理采集脚本关于采集脚本数据的内容，主要是探测各种参数以及提供数据保存同步等功能 

var // 最大页面加载时间，超过此时间直接发送onload数据
    readyTimeout = 30 * 1000,
    // 最大采集时间超时阀值，超过这个时间则不再发送任何数据
    collectTimeout = 24 * 3600 * 1000,
    // 数据发送超时时间，默认10000毫秒
    sendTimeout = 10 * 1000,
    // resize事件延迟执行的计时器
    resizeTimer,
    // 是否是单例模式
    singleton = false,

    lastURL,

    lastPageViewReferrer,

    // 页面打开时间
    openTimeStamp;

// 返回自从页面打开当前时刻经过的毫秒数
function sinceOpen() {
    return date.between(date.now(), openTimeStamp);
}

// 消息器
var Message = function () {};
extend(Message.prototype, CustomEvent);

var msg = new Message();
api.on = [msg.on, msg];
api.off = [msg.off, msg];

var setHandlers = [];
api.set = function set(key, value) {
    if (isString(key)) {
        var done = false;
        each(setHandlers, function (handler) {
            if (!done && (done = handler(key, value))) {
                return breaker;
            }
        });
        if (!done) {
            common[key] = value;
        }
    } else if (isObject(key)) {
        each(key, function (v, k) {
            set(k, key[k]);
        });
    }
};

// 页面加载完毕的处理方法
function onReady() {
    msg.trigger('load');
}

// 离开页面的处理方法
function onLeave() {
    msg.trigger('leave');
}

// 页面尺寸变化的处理方法
function onResize() {
    if (!resizeTimer) {
        detectSize();
        resizeTimer = timer.once(function () {
            detectSize();
            resizeTimer = null;
            msg.trigger('resize');
        }, 150);
    }
}
