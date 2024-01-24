/**
 * 触摸操作相关
 */

// 处理变量
var touchOffsetX = 0,
    touchOffsetY = 0;

// 读取变量
msg.on('readVar', function () {
});

// 绑定事件监听
msg.on('bindEvent', function () {
});

// 鼠标移动的处理方法
function onTouch(event) {
    var touches = event.touches,
        touch = touches[0];
    click();
}