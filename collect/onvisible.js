/**
 * 给包含'on-log' class的标签添加点击日志打印
 */

// 绑定事件监听
msg.on('bindEvent', function() {

    // 监听全局屏幕滚动事件
    if (conf.scrollBoxClass) {
        var scrollBox = document.getElementsByClassName(conf.scrollBoxClass);
        
        scrollBox && scrollBox.length && (scrollBox[0].onscroll = throttle(function () {collectVisible()}, 50));
    } else {
        window.onscroll = throttle(function () {collectVisible()}, 50);
    }

    collectVisible();
});
