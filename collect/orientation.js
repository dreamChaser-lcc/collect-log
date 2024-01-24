/**
 * 屏幕转动
 */
 // 初始化执行
msg.on('afterInit', function () {
    if (screen && screen.addEventListener) {
        screen.addEventListener("orientationchange", function() {
            event('screen_orientation', 'change', screen.orientation);
        });
    }
});