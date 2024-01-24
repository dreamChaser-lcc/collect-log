/**
 * 出错统计相关
 */

var _prevErrorHandler = window.onerror;
// 错误信息，出错页面URL，错误抛出行
function onWindowError(msg, url, lineNumber, columnNumber, err) {
    log.info('message[' + msg + ']url[' + url + ']lineNumber[' + lineNumber + ']');

    error({
        message: msg,
        url: url,
        lineno: lineNumber,
        colno: columnNumber
    });

    if (_prevErrorHandler) {
        // 调用之前配置好的处理方法
        return _prevErrorHandler(msg, url, lineNumber, columnNumber, err);
    } else {
        return false;
    }
}
window.onerror = onWindowError;

// 发送页面出错数据
var error = api.error = function (message, url) {
    var data = {
            
        };

    if (isObject(message)) {
        for (var key in message) {
            data[key] = message[key];
        }
    } else {
        data.message = message;
        data.url = url;
    }

    // msg.trigger('send', data, {
    //     api: serverApi.error,
    //     type: 'error'
    // });
    msg.trigger('sendAli', data, {
        api: serverApi.error,
        type: 'error'
    });
};