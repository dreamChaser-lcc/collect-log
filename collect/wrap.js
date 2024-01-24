
/**
 * 前端日志采集（collect-log)
 * @DateTime 2016-12-21T15:41:36+0800
 * @version  1.0.0
 */


//try {
// @option(debug)
(function (name, factory) {

    // 检测上下文环境是否为 AMD 或 CMD
    var hasDefine = typeof define === 'function',
        // 检测上下文环境是否为 node
        hasExports = typeof module !== 'undefined' && module.exports,
        // 检测上下文环境是否为浏览器
        hasWindow = typeof window !== 'undefined';

    // 定义为普通 Node 模块
    if (hasExports) {
        module.exports = factory();

    // AMD 环境或 CMD 环境
    // } else if (hasDefine) {
    //     define(name, factory);

    // 浏览器环境
    } else if (hasWindow) {
        var ctor = function () {},
            self = new ctor;
        factory.call(self, name);
    }

})('qla', function (name) {

var VERSION = '1.0.0';
// @require(base)
// @require(data)
// @option(selector)
// @require(promise)
// @require(storage)
// @require(session-storage)
// @option(userdata)
// @require(core)
// @require(conf)
// @option(click)
// @option(es5)
// @option(event)
// @option(commonlog)
// @option(error)    
// @option(pv)
// @option(visible)
// @require(read-var)
// @option(query)
// @option(test)
// @require(send)
// @require(send-less)
// @require(send-ali)
// @require(send-ali-less)
// @option(onlog)
// @option(onpv)
// @option(onvisible)
// @option(browse)
// @require(init)

});
//} catch(e) {}