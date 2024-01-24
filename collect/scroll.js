/**
 * 屏幕滚动相关
 */

var pageXOffset,
    pageYOffset,

    pageOffsetStep = 300,

    pageXStep = 0,
    pageYStep = 0,

    scrollId,
    scrollPageInfo,

    scrollEventHasListened = false;

function sendScrollEvent() {
    var availHeight = screen.availHeight,
        availWidth = screen.availWidth,
        hStep = Math.floor(availHeight / pageOffsetStep),
        wStep = Math.floor(availWidth / pageOffsetStep),
        xStep = Math.floor(window.pageXOffset / pageOffsetStep),
        yStep = Math.floor(window.pageYOffset / pageOffsetStep),
        data = extend({
                sc_id: scrollId,
                category: 'window_scroll',
                action: 'scroll',
                screen_h: availHeight,
                screen_w: availWidth
            }, scrollPageInfo);

    if (xStep > pageXStep) {
        data.label = 'x';
        data.value = xStep * pageOffsetStep;
        data.xw = (xStep + wStep) * pageOffsetStep;
        event(data);
        pageXStep = xStep;
    }

    if (yStep > pageYStep) {
        data.label = 'y';
        data.value = yStep * pageOffsetStep;
        data.yh = (yStep + hStep) * pageOffsetStep;
        event(data);
        pageYStep = yStep;
    }
}

var resetScroll = api.resetScroll = function (pageInfo) {
    scrollPageInfo = pageInfo;

    scrollId = rand(16);
    pageXStep = 0;
    pageYStep = 0;

    // 判断是否已经监听滚动事件，如果尚未监听则加上
    if (!scrollEventHasListened) {
        window.addEventListener('scroll', sendScrollEvent);
        scrollEventHasListened = true;
    }

    // 重置后发出一条初始化的日志
    sendScrollEvent();
};