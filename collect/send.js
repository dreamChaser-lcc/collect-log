/**
 * 数据发送-通过图片请求
 */

function ping(url) {
    var promise = new Promise(),
        image = new Image(1, 1);

    image.onload = function () {
        Promise.resolve(promise);
    };
    image.onabort = image.onerror = function () {
        Promise.reject(promise);
    };
    image.src = url;
    return promise;
}

// 每次发送的唯一序列号
var serialNumber = 0;

// 生成采集数据对象，携带有探针的基础采集数据
function makeUrlVar() {
    var data = {},
        args = arguments,
        count = args.length,
        fullUrl = decode(window.location.href),
        path = decode(window.location.pathname),
        urlVar;

    for (var i = 0; i < count; i++) {
        if (isObject(args[i])) {
            extend(data, args[i]);
        }
    }

    urlVar = new URLVar(common);
    urlVar.set(data);
    urlVar.set({
        // r: rand(4),
        // sm: serialNumber++,
        url: fullUrl,
        path: path,
        platform: platform,
        caller: 'h5', // 调用方参数固定为此值，以便和后端日志区分
        // cht: cHeight,
        // cwt: cWidth
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



var collectLog = false;
try {
    window.localStorage.getItem('COLLECT_LOG') && (collectLog = true);
} catch (e) {}



msg.on('send', function (data, options) {
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

    data.logVersion = '1.0.1';

    lastPageViewReferrer = referrer;

    var urlVar = makeUrlVar(data),
        urlVarString = urlVar.stringify(),
        server = options.server || conf.server,
        api = options.api || serverApi.collect,
        url = server + api + '?' + urlVarString;

    ping(url);

    collectLog && console.log('[collect log][' + options.type + ']', data.logs || data);

});
