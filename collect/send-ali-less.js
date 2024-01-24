// 生成采集数据对象，携带有探针的基础采集数据
function makeUrlVarAli() {
    var data = {},
        args = arguments,
        count = args.length,
        urlVar;

    for (var i = 0; i < count; i++) {
        if (isObject(args[i])) {
            extend(data, args[i]);
        }
    }
    urlVar = new URLVar({});
    urlVar.set(data);
    urlVar.set({
        site:common.site,
        viewId:common.viewId,
        referrer: window.document.referrer
    });

    // 尝试获取app公参
    urlVar.set({
        appcaller: cookie.get('caller'),
        appos: cookie.get('os'),
        appver: cookie.get('ver'),
        userId: cookie.get('userId'),
        cUserId: cookie.get('cUserId'),
    });
    return urlVar;
}


msg.on('sendAliLess', function (data, options) {
    // 无内容或超过有效期的数据不发送
    if (!data || !options || sinceOpen() >= collectTimeout) {
        return;
    }

    var api = options.type;

    var logType = data.logType || api;
    delete data.logType;

    var urlVar = makeUrlVarAli(data),
        urlVarString = urlVar.stringify().replace(/\&/gi,'`'),
        url = '//qlchat.cn-hangzhou.log.aliyuncs.com/logstores/' + 'qlchat-collect/' + 'track_ua.gif?APIVersion=0.6.0&logType=' +logType + '&detail=' + urlVarString;
    
    ping(url);

    collectLog && console.log('[collect log][' + options.type + ']', data.logs || data);
});
