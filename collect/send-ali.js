msg.on('sendAli', function (data, options) {
    // 无内容或超过有效期的数据不发送
    if (!data || !options || sinceOpen() >= collectTimeout) {
        return;
    }

    // 如果没有传入标题，则自动获取
    if (!data.page && doc.title) {
        data.page = encodeURIComponent(doc.title);
        data.page = (data.page || '').replace(/\s*|\t|\r|\n/g, "");
    }

    if (data.name) {
        data.name = (data.name || '').replace(/\s*|\t|\r|\n/g, "");
    }

    // 如果没有传入 referrer，则自动获取
    if (!data.referrer) {
        // 重新检测 referrer
        detectReferrer();

        // referrer 不同，为非单页面应用
        if (referrer !== lastPageViewReferrer) {
            data.referrer = encode(referrer);

        // referrer 相同，判断为单页面应用
        // 改为用 hash 作为 referrer
        } else {
            data.referrer = encode(decode(location.hash));

            if (!data.referrer) {
                data.referrer = _getSPARefUrl(window.location.href, window.document.referrer);
            }
        }
    }

    lastPageViewReferrer = referrer;

    var api = options.type;

    var logType = data.logType || api;
    delete data.logType;

    var urlVar = makeUrlVar(data),
        urlVarString = urlVar.stringify().replace(/\&/gi,'`'),
        // url = '//qlchat.cn-hangzhou.log.aliyuncs.com/logstores/qlchat-collect/track_ua.gif?APIVersion=0.6.0&logVersion=1.0.2&logType=' +logType + '&detail=' + urlVarString;
        url ='';
    ping(url);

    collectLog && console.log('[collect log][' + options.type + ']', data.logs || data);
});
