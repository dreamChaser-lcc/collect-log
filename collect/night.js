var layout = window.layout,
    layoutTimer;

// 在初始化完成之后执行
// 如果在初始化时候执行就会导致 app 等参数还没设置就已经发出请求了，这时候发出的请求就是无效的请求
msg.on('afterInit', function () {
    // 发送当前日间/夜间模式状态
    sendDisplayModeEvent('init');
});

// 绑定事件监听
msg.on('bindEvent', function () {
    // 监听夜间模式/日间模式切换 并且发送统计日志
    if (layout) {
        layout.onnightmodechange = function (event) {
            if (layoutTimer) {
                clearTimeout(layoutTimer);
            }
            layoutTimer = setTimeout(function () {
                sendDisplayModeEvent('change');
            }, 100);
        };
    }
});

// 发送显示模式事件
function sendDisplayModeEvent(action) {
    if (layout) {
        event('browser_display_mode', action, layout.displaymode);
    }
}