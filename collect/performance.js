// 性能统计

var pageOpenTimeStamp = 0,
    firstScreenTimeStamp = 0,
    performanceTimer;

function onPerformance() {
    clearTimeout(performanceTimer);
    performanceTimer = null;

    var performance = win.performance,
        timing = performance && performance.timing,
        navigation = performance && performance.navigation,
        // 重定向次数
        redirectCount = navigation && navigation.redirectCount;

    if (!timing || timing.requestStart === 0 || timing.responseStart === 0) {
        return;
    }

        // 跳转耗时
    var redirect = timing.redirectEnd - timing.redirectStart,

        // APP CACHE 耗时
        appcache = timing.domainLookupStart - timing.fetchStart,

        // DNS 解析耗时
        dns = timing.domainLookupEnd - timing.domainLookupStart,
    
        // 连接耗时
        conn = timing.connectEnd - timing.connectStart,

        // 等待服务器响应耗时
        request = timing.responseStart - timing.requestStart,

        // 内容加载耗时
        response = timing.responseEnd - timing.responseStart,

        // 总体网络交互耗时，即开始跳转到服务器资源下载完成
        network = timing.responseEnd - timing.navigationStart,

        // 渲染处理
        processing = (timing.domComplete || timing.domLoading) - timing.domLoading,

        // 抛出 load 事件
        load = timing.loadEventEnd - timing.loadEventStart,

        // 总耗时
        total = (timing.loadEventEnd || timing.loadEventStart || timing.domComplete || timing.domLoading) - timing.navigationStart,

        // 发呆耗时
        pending = total - load - processing - response - request - conn - dns - redirect,

        // 可交互
        active = timing.domInteractive - timing.navigationStart,

        // 请求响应耗时，即 T0
        t0 = timing.responseStart - timing.navigationStart,

        // 首次出现内容，即 T1
        t1 = timing.domLoading - timing.navigationStart,

        // DOM 加载完毕，即 T2
        t2 = timing.domContentLoadedEventEnd - timing.navigationStart,

        // 内容加载完毕，即 T3
        t3 = timing.loadEventEnd - timing.navigationStart,

        domStart = 0,

        firstScreen = 0;

    if (pageOpenTimeStamp > 0) {
        domStart = pageOpenTimeStamp - timing.navigationStart;
    }

    if (firstScreenTimeStamp > 0) {
        firstScreen = firstScreenTimeStamp - timing.navigationStart;
    }

    msg.trigger('send', {
        category: 'performance',
        action: 'timing',
        label: 'timing',
        redirect: redirect,
        appcache: appcache,
        dns: dns,
        conn: conn,
        request: request,
        response: response,
        processing: processing,
        network: network,
        load: load,
        total: total,
        pending: pending,
        active: active,
        redirectCount: redirectCount,
        domStart: domStart,
        firstScreen: firstScreen,
        t0: t0,
        t1: t1,
        t2: t2,
        t3: t3 < 0 ? 0 : t3
    }, {
        api: serverApi.event,
        type: 'event'
    });
}

// 读取DOM开始渲染时间
msg.on('readVar', function () {
    if ($_get('o')) {
        pageOpenTimeStamp = $_get('o');
        log.debug('[pageOpenTimeStamp: ' + pageOpenTimeStamp + ']');
    }
});

// 加载完成后发出统计
msg.on('load', function () {
    // 骚等一段时间再触发，等待是否有首页首屏的渲染时间
    clearTimeout(performanceTimer);
    performanceTimer = setTimeout(onPerformance, 1500);
});

// 等待是否有首屏加载统计
msg.on('send', function (data, options) {
    // 忽略非 首页首屏统计 事件
    if (options.type !== 'event' || data.category !== 't_index' || data.action !== 'render_index') {
        return;
    }
    
    firstScreenTimeStamp = date.now();
    log.debug('[firstScreenTimeStamp: ' + firstScreenTimeStamp + ']');

    // 如果是首页首屏的事件，立刻发出统计
    clearTimeout(performanceTimer);
    onPerformance();
});