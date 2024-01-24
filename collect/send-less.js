// 生成采集数据对象，携带有探针的基础采集数据
function makeUrlVarLess() {
    var data = {},
        args = arguments,
        count = args.length,
        fullUrl = decode(window.location.href),
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
        url: fullUrl,
    });

    // 尝试获取app公参
    urlVar.set({
        userId: cookie.get('userId'),
        cUserId: cookie.get('cUserId'),
    });

    return urlVar;
}


msg.on('sendless', function (data, options) {
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

    var urlVar = makeUrlVarLess(data),
        urlVarString = urlVar.stringify(),
        server = options.server || conf.server,
        api = options.api || serverApi.collect,
        url = server + api + '?' + urlVarString;

    ping(url);

    collectLog && console.log('[collect log][' + options.type + ']', data.logs || data);
});
