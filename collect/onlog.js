/**
 * 给包含'on-log' class的标签添加点击日志打印
 */

// 绑定事件监听
msg.on('bindEvent', function () {
    // 监听全局鼠标事件
    domEvent.on(body, 'click', onMouseClick);
});

function getLogTarget (target) {
    if (!target) {
        return;
    }

    if (typeof target.className == 'string' && target.className.indexOf('on-log') > -1) {
        return target;
    }

    return getLogTarget(target.parentNode);
}


// 鼠标点击处理方法
function onMouseClick(e) {
    var targetClassNames = e.target && e.target.className;
    
    // if (targetClassNames.indexOf('on-log') < 0) {
    //     return;
    // }
    
    var logTarget = getLogTarget(e.target);

    if (!logTarget) {
        return;
    }
    var params = extend({
        x: e.pageX,
        y: e.pageY
    }, fillParams(logTarget));
    
    setTimeout(function() {
        click(params);
    }, 5);
}

function fillParams(tar) {
    if (!tar) {
        return;
    }

    var namedNodeMap = tar.attributes,
        params = {};

    for (var i = 0, len = namedNodeMap.length; i < len; i++) {
        var attr = namedNodeMap[i], key;

        if (attr.name.indexOf('log-') === 0 || attr.name.indexOf('data-log-') === 0) {
            key = attr.name.substring(4);

            if (attr.name.indexOf('data-log-') === 0) {
                key = attr.name.substring(9);
            }

            if (key) {
                params[key] = encode(attr.value);
            }
        }
    }

    return params;
}