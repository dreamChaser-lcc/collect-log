/**
 * 鼠标相关
 */

// 鼠标移动记录间隔
var minMouseRecordInterval = 300,
    // 鼠标最小移动偏移量，小于此数值则不进行记录
    minMouseRecordOffset = 100,
    // 最后一次鼠标移动的绝对位置
    lastMousePoint = null,
    // 鼠标移动记录开关，默认启用
    mouseMoveRecordEnabled = true,
    // 最后一次鼠标移动时间
    lastMouseMoveTimeStamp,
    // 鼠标点击记录开关，默认启用
    mouseClickRecordEnabled = true;

// 绑定事件监听
msg.on('bindEvent', function () {
    // 监听全局鼠标事件
    domEvent.on(body, 'click', onMouseClick);
    domEvent.on(body, 'mousemove', onMouseMove); 
    // 监听页面滚动事件
    // 由于页面滚动时并不触发鼠标移动事件，但是鼠标在页面上的实际位置已经改变
    // 这里通过监听页面滚动事件并且进行计算得出鼠标的位置
    domEvent.on(win, 'scroll', onMouseMove);
});

var MouseRecordSet = function () {
    this.init.apply(this, arguments);
};
extend(MouseRecordSet.prototype, List.prototype, {
    stringify: function () {
        var str = '',
            first;
        this.each(function (r) {
            var point = r.point,
                tagName = r.tagName,
                time = r.time,
                s = '';
            if (!first) {
                first = time;
            } else {
                time -= first;
            }
            str += [point.x, point.y, time, tagName].join(',') + ';';
        });
        return str;
    }
});

var mouseClickRecord,
    mouseMoveRecord;

function onMouseClickAdd() {
    if (mouseClickRecord && mouseClickRecord.size()) {
        // TODO
        // send()
    }
}

// 鼠标点击的处理方法
function onMouseClick(event) {
    if (!mouseClickRecordEnabled) {
        return;
    }
    var click = parseMouseEvent(event);
    if (click) {
        if (!mouseClickRecord) {
            mouseClickRecord = new MouseRecordSet({onAdd: onMouseAdd});
        }
        mouseClickRecord.add(click);
        lastMousePoint = click.point;
    }
}

function onMouseMoveAdd() {
    if (mouseMoveRecord && mouseMoveRecord.size()) {
        // TODO
        // send()
    }
}

// 鼠标移动的处理方法
function onMouseMove(event) {
    if (!mouseMoveRecordEnabled) {
        return;
    }
    var move = parseMouseEvent(event),
        point, now, timeInterval;
    if (!move) {
        return;
    }
    point = move.point;
    now = date.now();
    timeInterval = minMouseRecordInterval;
    // 如果有最后鼠标移动的时间戳，则计算鼠标移动间隔时间
    if (lastMouseMoveTimeStamp) {
        timeInterval = date.between(lastMouseMoveTimeStamp, now);
    }
    // 达到以下条件其中一个才记录鼠标移动：
    // 鼠标移动间隔时间大于最小的鼠标移动间隔时间
    // 鼠标移动距离大于指定间隔
    if (timeInterval >= minMouseRecordInterval &&
        (!lastMousePoint ||
            (abs(lastMousePoint.x - point.x) > minMouseRecordOffset) ||
            (abs(lastMousePoint.y - point.y) > minMouseRecordOffset)  ||
            (abs(lastMousePoint.sl - point.sl) > minMouseRecordOffset) ||
            (abs(lastMousePoint.st - point.st) > minMouseRecordOffset))) {
        // 如果事件为滚动事件，则没有鼠标的坐标值
        // 但可以通过之前鼠标的相对位置和当前的页面滚动偏移值计算出当前的鼠标位置
        if (lastMousePoint && isNaN(point.x)) {
            point.cx = lastMousePoint.cx;
            point.x = point.cx + point.sl;
        }
        if (lastMousePoint && isNaN(point.y)) {
            point.cy = lastMousePoint.cy;
            point.y = point.cy + point.st;
        }
        // 更新最后鼠标点击位置
        lastMousePoint = point;
        // 更新最后鼠标移动时间戳
        lastMouseMoveTimeStamp = now;
        // 在鼠标坐标值都存在的情况下才加入鼠标移动记录集
        if (!isNaN(point.x) && !isNaN(point.y)) {
            if (!mouseMoveRecord) {
                mouseMoveRecord = new MouseRecordSet({onAdd: onMouseMoveAdd});
            }
            mouseMoveRecord.add(move);
        }
    }
}

// 解析鼠标事件
function parseMouseEvent(event, options) {
    if (!event) {
        return;
    }
    var target = event.target || event.srcElement,
        tagName = '',
        point, px, py, cx, cy, sl, st;
    if (target) {
        if (has(target, 'tagName')) {
            tagName = target.tagName;
        } else if (has(target, 'nodeName')) {
            tagName = target.nodeName;
        }
    }
    cx = event.clientX || 0;
    cy = event.clientY || 0;
    if (browser.ie) {
        sl = docElem ? docElem.scrollLeft : 0;
        st = docElem ? docElem.scrollTop : 0;
        px = cx + sl;
        py = cy + st;
    } else {
        sl = body ? body.scrollLeft : 0;
        st = body ? body.scrollTop : 0;
        px = event.pageX;
        py = event.pageY;
    }
    // 加入页面鼠标偏移量
    px += mouseOffsetX;
    py += mouseOffsetY;
    point = {x: px, y: py, cx: cx, cy: cy, sl: sl, st: st };
    return {
        time: event.timeStamp,
        point: point,
        tagName: tagName
    };
}