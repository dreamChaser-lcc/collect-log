/**
 * 旧浏览器兼容相关
 */

// --JSON--
var _JSON = window.JSON,
    JSON = {
    stringify: function (obj) {
        if (_JSON && isFunction (_JSON.stringify)) {
            // 直接调用浏览器原生的解析方法解析JSON
            return _JSON.stringify(obj);
        } else if (isObject(obj)) {
            // 简单实现序列化json的方法
            var str = '';
            each(obj, function (v, k) {
                if (isObject(v)) {
                    v = JSON.stringify(v);
                }
                str += ',"' + k + '":"' + v + '"';
            });
            return '{' + substring.call(str, 1) + '}';
        }
    },
    parse: function (text, reviver) {
        if (_JSON && isFunction (_JSON.parse)) {
            // 直接调用浏览器原生的解析方法解析JSON
            return _JSON.parse(text);
        } else {
            // 来源：json2.js
            var j;
            var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
            var walk = function (holder, key) {
                var k, v, value = holder[key];
                if (value && isObject(value)) {
                    for (k in value) {
                        if (hasOwn.call(value, k)) {
                            v = walk(value, k);
                            if (isDef(v)) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            };
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return isFunction (reviver) ? walk({'': j}, '') : j;
            }
        }
    }
};
// --JSON--

// --event--
// 定义操作方法
var ADD_EVENT_LISTENER = 'addEventListener';
var REMOVE_EVENT_LISTENER = 'removeEventListener';
var ATTACH_EVENT = 'attachEvent';
var DETACH_EVENT = 'detachEvent';
// 浏览器事件监听、解除监听函数
 var event = {
    // 寄存事件相应的元素以及类型和响应函数
    events: {},
    on: function (el, type, fn) {
        if (!el || !type || !fn) {
            return;
        }
        var events = event.events,
            handlers = events[type] || (events[type] = []);
        handlers.push({el: el, fn: fn});
        event.add(el, type, fn);
    },
    off: function (el, type, fn) {
        if (!el || !type) {
            return;
        }
        var events = event.events,
            handlers = events[type];
        each(handlers, function (handler, i) {
            if (handler) {
                var el = handler.el,
                    fn = handler.fn;
                handlers[i] = null;
                event.remove(el, type, fn);
            }
        });
    },
    add: function (el, type, fn) {
        if (has(el, ADD_EVENT_LISTENER)) {
            el[ADD_EVENT_LISTENER](type, fn, false);
        } else if (has(el, ATTACH_EVENT)) {
            el[ATTACH_EVENT]('on' + type, fn);
        }
    },
    remove: function (el, type, fn) {
        if (has(doc, REMOVE_EVENT_LISTENER)) {
            if (has(el, REMOVE_EVENT_LISTENER)) {
                el[REMOVE_EVENT_LISTENER](type, fn, false);
            }
        } else {
            if (has(el, DETACH_EVENT)) {
                el[DETACH_EVENT]('on' + type, fn);
            }
        }
    }
};
// --event--

// 提取对象中的属性名列表
// --keys--
var keys = Object.keys || function (obj) {
    var keys = [];
    if (isObject(obj)) {
        for (var key in obj) {
            if (has(obj, key)) {
                keys.push(key);
            }
        }
    }
    return keys;
};
// --keys--

// --isArray--
var isArray = Array.isArray || function (obj) {
    return isDef(obj) && (toString.call(obj) === '[object Array]');
};
// --isArray--

// --ready--
function bindReady() {
    // 防止在绑定document的ready事件监听之前document已经触发ready事件
    // 直接执行
    if (equal(doc.readyState, 'complete')) {
        return defer(ready);
    }
    
    function onDOMLoaded() {
        // 移除各load监听器
        log.warn('remove all document-load-event listeners');
        domEvent.off(doc, 'DOMContentLoaded', onDOMLoaded);
        domEvent.off(doc, 'readystatechange', onDOMLoaded);
        domEvent.off(win, 'load', onDOMLoaded);
        // 调用ready执行监听ready的函数
        defer(ready);
    }
    
    log.info('add document-load-event listener');
    // firefox或其他标准浏览器支持此方法
    if (has(doc, ADD_EVENT_LISTENER)) {
        domEvent.on(doc, 'DOMContentLoaded', onDOMLoaded);

    // IE事件监听
    } else if (has(doc, ATTACH_EVENT)) {
        domEvent.on(doc, 'readystatechange', onDOMLoaded);

        // 如果是IE且不是一个frame
        // 继续检测document是否已经ready
        var toplevel = false;
        try {
            toplevel = (win.frameElement === null);
        } catch(e) {}
        if (docElem.doScroll && toplevel) {
            doScrollCheck();
        }
    }
    
    // 保险方法：监听win的load事件，这个事件任何情况下都能正常工作
    domEvent.on(win, 'load', onDOMLoaded);
}

// IE专用的dom的ready检查器
function doScrollCheck() {
    if (isReady) {
        return;
    }
    try {
        // 如果是IE，则使用Diego Perini的小技巧
        // htt//javascript.nwbox.com/IEContentLoaded/
        docElem.doScroll('left');
    } catch(e) {
        timer.once(doScrollCheck, 1);
        return;
    }
    ready();
}
// --ready--