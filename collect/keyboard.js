/**
 * 键盘相关
 */

// 键盘按键记录开关，默认禁用
 var keyPressRecordEnabled = false;

// 绑定事件监听
msg.on('bindEvent', function () {
    domEvent.on(doc, 'keypress', handler.keyPress);
});

// 按键记录集，用于存储按键记录
var KeyRecordSet = function () {
    this.init.apply(this, arguments);
};
extend(KeyRecordSet.prototype, List.prototype, {
    stringify: function () {
        var str = '',
            first;
        this.each(function (r) {
            var code = r.code,
                time = r.time;
            if (!first) {
                first = time;
            } else {
                time -= first;
            }
            str += [code, time].join(',') + ';';
        });
        return str;
    }
});

var keyPressRecord;

function onKeyPressAdd() {
    // TODO
}

// 键盘按键敲击的处理方法
// 参考：htt//unixpapa.com/js/key.html
var onKeyPress = function (event) {
    if (!keyPressRecordEnabled) {
        return;
    }
    var target = event.target || event.srcElement,
        keyCode = event.which || event.keyCode;
    // 为了避免记录到敏感信息，如果当前焦点type为'password'则不记录按键值
    if ((!target || target.type !== 'password')) {
        if (!isBlank(keyCode)) {
            if (!keyPressRecord) {
                keyPressRecord = new KeyRecordSet({onAdd: onKeyPressAdd});
            }
            keyPressRecord.add({code: keyCode, time: event.timeStamp});
        }
    }
};