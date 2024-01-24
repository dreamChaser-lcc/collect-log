/**
 * 基础方法
 */

var breaker = {};

var win = window,
    that = this;

// 开放给外部调用的api
// 有需要开放外部调用的接口就放在这里进行开放
var api = {};

// 页面文档对象
var doc,
    // 域名
    domain,
    // body
    body,
    // documentElement
    docElem,

    // 客户端屏幕
    screen,
    // 颜色深度
    colorDepth,
    // 屏幕宽
    sWidth,
    // 屏幕高
    sHeight,
    // 页面可见宽
    cWidth,
    // 页面可见高
    cHeight,
    docWidth,
    docHeight,
    // 分辨率
    resolution,

    // 浏览器相关信息
    navi,
    // 操作系统平台
    platform,
    // 浏览器的user-agent标识
    ua,
    // 浏览器的user-agent标识转化为小写字符
    ua_lc,

    // 上一个页面的URL
    referrer,

    cookieEnabled,
    timeZone;

// Object原生hasOwnProperty的捷径
var hasOwn = Object.prototype.hasOwnProperty,
    // Object原生toString的捷径
    toString = Object.prototype.toString,
    // String原生substring的捷径
    substring = String.prototype.substring,
    // Array原生slice的捷径
    slice = Array.prototype.slice,
    // Array原生splice的捷径
    splice = Array.prototype.splice,
    // Array原生forEach的捷径
    forEach = Array.prototype.forEach,
    // 四舍五入的捷径
    round = Math.round,
    // 取绝对值的捷径
    abs = Math.abs,
    // 向上取整的捷径
    ceil = Math.ceil,
    // 向下取整的捷径
    floor = Math.floor,
    // 编码
    encode = encodeURIComponent,
    // 解码
    decode = decodeURIComponent;

// Object原生keys捷径
// --es5-keys--
var keys = Object.keys;
// --es5-keys--

// 判断对象是否是数组
// --es5-isArray--
var isArray = Array.isArray;
// --es5-isArray--

// 获取指定对象指定的值
function get(obj, attr) {
    if (isDef(obj)) {
        return obj[attr];
    }
}

// 获取全局值
function $get(attr) {
    return get(win, attr);
}

// 获取 qla 前缀的全局值
function $_get(attr) {
    return get(win, QLA + attr);
}

// 是否完全相等
function equal(v1, v2) {
    return v1 === v2;
}

// 判断某个类中是否有指定的键
function has(obj, key) {
    if (isUndef(obj) || isUndef(key)) {
        return false;
    }
    return hasOwn.call(obj, key) || isDef(obj[key]);
}

// 获取指定对象的子元素数量
function size(obj) {
    var s = 0;
    if (isUndef(obj) || (obj === null)) {
        s = 0;
    } else if (obj.length === +obj.length) {
        s = obj.length;
    } else if (isObject(obj)) {
        s = keys(obj).length;
    } else if (isNumber(obj) || isBoolean(obj)) {
        s = String(obj).length;
    }
    return s;
}

// 遍历方法，'each'的实现，就如'forEach'
// 调用类和数组的原生遍历方法
// 如果有**ECMAScript 5**原生的'forEach'方法则委托其处理
// 来源: underscore
function each(obj, fn, context) {
    if (isUndef(obj) || !isFunction (fn)) {
        return;
    }
    if (forEach && (obj.forEach === forEach)) {
        obj.forEach(fn, context);
    } else if (isArray(obj)) {
        for (var i = 0, l = size(obj); i < l; i++) {
            if (fn.call(context, obj[i], i, obj) === breaker) {
                return;
            }
        }
    } else if (isObject(obj)) {
        for (var key in obj) {
            if (has(obj, key)) {
                if (fn.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
}

// 扩展方法，用于扩展对象
function extend(obj) {
    var prop, src;
    each(slice.call(arguments, 1), function (source) {
        each(source, function (src, prop) {
            if (obj !== src) {
                obj[prop] = src;
            }
        }, this);
    }, this);
    return obj;
}

// 字符串复制
function repeat(string, times) {
    return (times < 1) ? '' : (new Array(times + 1).join(string));
}

// 判断对象是否已定义
function isDef() {
    var args = arguments,
        count = args.length;
    if (count < 2) {
        return typeof(args[0]) !== 'undefined';
    } else {
        var r = true;
        each(args, function (v) {
            if (typeof(v) === 'undefined') {
                r = false;
                return {};
            }
        });
        return r;
    }
}

// 判断对象是否未定义
function isUndef() {
    var args = arguments,
        count = args.length;
    if (count < 2) {
        return typeof(args[0]) === 'undefined';
    } else {
        var r = true;
        each(args, function (v) {
            if (typeof(v) !== 'undefined') {
                r = false;
                return {};
            }
        });
        return r;
    }
}

// 判断对象是否为空值
// 空值情况包括：未定义、null、空字符串、空对象（对象中没有键值）
function isBlank(obj) {
    var blank = true;
    if (isDef(obj) &&
        (obj !== null) &&
        (obj !== 'null') &&
        (obj !== '')) {
        blank = false;
    }
    if (!blank &&
        (isArray(obj) || isObject(obj))) {
        blank = true;
        each(obj, function (v) {
            if (isDef(v)) {
                blank = false;
                return breaker;
            }
        });
    }
    return blank;
}

// 判断对象是否为布尔值
function isBoolean(obj) {
    return (obj === true) || (obj === false);
}

// 判断对象是否为函数
function isFunction (obj) {
    return toString.call(obj) === '[object Function]';
}

// 判断对象是否为字符串
function isString(obj) {
    return toString.call(obj) === '[object String]';
}

// 判断对象是否为字符串
function isNumber(obj) {
    return toString.call(obj) === '[object Number]';
}

// 判断对象是否为Object，这里的Object为狭义上的Object
function isObject(obj) {
    return (obj === Object(obj)) && !isArray(obj) && !isFunction (obj);
}

// 生成随机数
// 可以不指定参数（生成0～1）或指定最大值（生成0～最大值）或最小值和最大值（生成最小值～最大值）
// 使用原生产生随机数的方法
function random() {
    var r = Math.random(),
        args = arguments,
        length = size(args);
    if (length === 1) {
        r *= args[0];
    } else if (length === 2) {
        r = round(r * (args[1] - args[0])) + args[0];
    }
    return r;
}

// 生成随机数，length用于指定所产生结果的长度
// 如果type为空，则生成随机字符串（包含字母和数字）；如果type为‘num’，则生成随机数字字符串（仅包含数字）
function rand(length, type) {
    if (length < 1) {
        return 0;
    }
    var str = '',
        r,
        isNum = (type === 'num');
    while (size(str) < length) {
        r = floor(date.usec() * random() * 999);
        if (!isNum) {
            r = r.toString(16);
        }
        str += r;
    }
    return str.substr(0, length);
}

// 生成唯一id
// 参数flag可以传入标记，如访客标记为'v'，页面标记为'p'，将出现在第3组数据，建议只设置1位字符
function uuid(flag) {
    var pick = function (value, length) {
        var base16 = value.toString(16),
            len = size(base16) - 1,
            str = '';
        while (size(str) < length) {
            str += base16.substr(round(random(0, len)), 1);
        }
        return str;
    };

    var t = Date.now(),
        t16 = add0(t.toString(16), 12),
        u1 = t16.substr(0, 8),
        u2 = t16.substr(8, 4),
        u3 = pick(t, 4),
        u4 = pick(rand(t % 97), 2),
        u5 = pick(rand(t % 89), 2),
        u6 = pick(rand(4), 1) + pick(rand(8), 1) + pick(rand(16), 2) +
            pick(rand(32), 2) + pick(rand(64), 3) + pick(rand(128), 3),
        id = '';
    if (flag) {
        u3 = (flag + u3).substr(0, 4);
    }
    id = u1 + '-' + u2  + '-' + u3 + '-' + u4 + u5 + '-' + u6;
    return id.toUpperCase();
}

// 阻塞浏览器进程，默认300毫秒
function sleep(usec) {
    if (!usec) {
        usec = 300;
    }
    var now = date.now(),
        expires = date.at(usec);
    while (now < expires) {
        now = date.now();
    }
}

// 将对象转化为字符串并在前面补足0直到满足指定长度
function add0(obj, length) {
    if (!obj) {
        return '0';
    }
    var str = String(obj),
        times = length - size(str);
    return repeat('0', times) + str;
}

// 延迟一段时间执行方法
function delay(fn, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {return fn.apply(null, args); }, wait);
}

// 延迟执行函数，让浏览器有机会喘口气
function defer(fn) {
    return delay.apply(this, [fn, 1].concat(slice.call(arguments, 1)));
}

// 序列化和反序列化 JSON
// --es5-JSON--
// --es5-JSON--

// 实现简单的自定义事件，供扩展使用
var CustomEvent = {
    // 监听指定事件
    // 参数：事件类型、绑定函数、指针
    on: function (type, fn, context) {
        if (!type || !fn) {
            return;
        }
        var callbacks = this._callbacks || (this._callbacks = {}),
            list = callbacks[type] || (callbacks[type] = []);
        list.push({fn: fn, context: context});
    },
    // 移除事件监听
    // 参数：事件类型、绑定函数、指针
    // 如果不指定事件类型则移除所有事件监听
    off: function (type, fn, context) {
        if (!type) {
            delete this._callbacks;
        } else {
            var list = this._callbacks && this._callbacks[type];
            if (list) {
                each(list, function (v, i) {
                    if (v && (!fn || v.fn === fn) &&
                        (!context || v.context === context)) {
                        list[i] = null;
                    }
                });
            }
        }
    },
    // 触发指定事件
    trigger: function (type) {
        if (!type) {
            return;
        }
        var list = this._callbacks && this._callbacks[type],
            args = slice.call(arguments, 1),
            context;
        if (list) {
            each(list, function (v, i) {
                if (v && v.fn) {
                    context = v.context || that;
                    v.fn.apply(context, args);
                }
           });
        }
    }
};

// 数据映射对象，一个提供键值映射的对象，用于保存数据
// 使用Key-Value形式保存，一个Key只能对应一个Value
// 提供常用方法方便对数据进行增删查清空以及遍历
var Map = function () {
    this.init.apply(this, arguments);
};
extend(Map.prototype, CustomEvent, {
    init: function (map, options) {
        this.map = {};
        this.add(map, options);
    },
    add: function (key, value, options) {
        if (isUndef(key)) {
            return;
        }
        var attrs,
            force = false,
            checkFn;
        if (isObject(key)) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (options) {
            if (options.force === true) {
                force = true;
            }
            if (options.check) {
                checkFn = options.check;
            }
        }
        each(attrs, function (value, key) {
            // 必须符合以下条件才能添加成功
            // key必须定义
            // 强制设置 或者 为存在该key
            // 未定义验证方法 或 通过验证方法验证
            if (isDef(key) &&
                (force || !this.has(key)) &&
                (!checkFn || checkFn.call(this, key, value))) {
                this.map[key] = value;
            }
        }, this);
    },
    set: function (key, value, options) {
        if (isUndef(key)) {
            return;
        }
        var attrs;
        if (isObject(key)) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!options) {
            options = {};
        }
        options.force = true;
        this.add(attrs, options);
    },
    get: function (key) {
        return isDef(key) ? this.map[key] : void(0);
    },
    has: function (key) {
        return isDef(key) && isDef(this.map[key]);
    },
    remove: function (key) {
        if (isDef(key)) {
            delete this.map[key];
        }
    },
    clear: function () {
        this.map = {};
    },
    each: function (fn) {
        each(this.map, fn, this);
    }
});

// 采集数据的参数类，用于存放采集的数据以及对应的属性名，并提供序列化方法
var URLVar = function () {
    this.init.apply(this, arguments);
};
extend(URLVar.prototype, Map.prototype, {
    stringify: function () {
        var str = '';
        this.each(function (value, key) {
            // 只拼接属性为非undefined的健值
            if (isDef(value)) {
                str += '&' + key + '=' + encode(value);
            }
        });
        return str.substring(1);
    }
});

// 列表类，提供方便的添加、移除、清空、遍历方法及对应的事件绑定
var List = function () {
    this.init.apply(this, arguments);
};
extend(List.prototype, CustomEvent, {
    init: function (options) {
        var that = this;
        that.list = [];
        if (options) {
            var onAdd = options.onAdd,
                onRemove = options.onRemove,
                onClear = options.onClear;
            if (onAdd) {
                that.onAdd(onAdd);
            }
            if (onRemove) {
                that.onRemove(onRemove);
            }
            if (onClear) {
                that.onClear(onClear);
            }
        }
    },
    all: function () {
        return this.list;
    },
    add: function (value , silent) {
        this.list.push(value);
        if (!silent) {
            this.trigger('a', value);
        }
    },
    onAdd: function (fn) {
        this.on('a', fn , this);
    },
    remove: function (value , silent) {
        var that = this,
            size = that.size();
        for (var i = size - 1; i >= 0; i--) {
            if (that.list[i] === value) {
                that.list.splice(i, 1);
                if (!silent) {
                    that.trigger('r', value);
                }
            }
        }
    },
    onRemove: function (fn) {
        this.on('r', fn , this);
    },
    clear: function (silent) {
        var that = this;
        that.list = [];
        if (!silent) {
            that.trigger('c', that.list);
        }
    },
    onClear: function (fn) {
        this.on('c', fn , this);
    },
    size: function () {
        return size(this.list);
    },
    each: function (fn) {
        each(this.list, fn, this);
    }
});

// 时间处理函数
var date = {
    // 返回当前时间
    now: function () {
        return new Date();
    },
    // 返回当前时间格式化后的字符串
    nowString: function () {
        var n = this.now();
        return this.format(n);
    },
    // 返回指定毫秒后的时间
    at: function (usec) {
        var u = this.usec() + (usec || 0);
        return new Date(u);
    },
    // 返回指定时间的毫秒数或者当前时间的毫秒数
    usec: function (t) {
        if (!t) {
            t = this.now();
        }
        return t.getTime();
    },
    // 计算两个时间之间相差毫秒数
    // 如果只有一个时间则与当前时间比较
    between: function (d1, d2) {
        if (!d1) {
            return 0;
        }
        if (!d2) {
            d2 = this.now();
        }
        return abs(d2 - d1);
    },
    // 返回随机日期
    rand: function () {
        return this.make(random(0, new Date().getFullYear()), random(0, 11), random(0, 31), random(0, 23), random(0, 59), random(0, 59), random(0, 999));
    }
};

// 定时器
var timer = {
    // 设置定时器
    // 参数repeat仅支持 重复一次（1）和 无限次重复（其他所有值）
    on: function (fn, delay, repeat) {
        if (!fn) {
            return;
        }
        if (!delay) {
            delay = 1;
        }
        if (!repeat) {
            repeat = 0;
        }
        var args = slice.call(arguments, 3),
            wrapper = null,
            id = -1;
        wrapper = function () {
            fn.apply(null, args);
        };
        if (repeat === 1) {
            id = setTimeout(wrapper, delay);
        } else {
            id = setInterval(wrapper, delay);
        }
        return id;
    },
    // 清空指定id的定时器
    off: function (id) {
        clearTimeout(id);
        clearInterval(id);
    },
    // 单次定时器，相当于timeout
    once: function (fn, delay) {
        var args = [fn, delay, 1],
            len = size(arguments),
            id;
        for(var i = 2; i < len; i++) {
            args.push(arguments[i]);
        }
        id = timer.on.apply(this, args);
        return id;
    }
};

// 寄存事件相应的元素以及类型和响应函数
var events = {},
    // 浏览器事件监听、解除监听函数
    domEvent = {
        on: function (el, type, fn) {
            if (!el || !type || !fn) {
                return;
            }
            var handlers = events[type] || (events[type] = []);
            handlers.push({el: el, fn: fn});
            domEvent.add(el, type, fn);
        },
        off: function (el, type, fn) {
            if (!el || !type) {
                return;
            }
            var handlers = events[type];
            each(handlers, function (handler, i) {
                if (handler) {
                    var el = handler.el,
                        fn = handler.fn;
                    handlers[i] = null;
                    domEvent.remove(el, type, fn);
                }
            });
        },
        add: function (el, type, fn) {
            el.addEventListener(type, fn, false);
        },
        remove: function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        }
    };


// 浏览器相关信息
var browser = {
    uc: false,
    qq: false,
    liebao: false,
    ie: false,
    ie4: false,
    ie5: false,
    ie5_5: false,
    ie6: false,
    ie7: false,
    ie8: false,
    ie9: false,
    ie10: false,
    chrome: false,
    safari: false,
    firefox: false,
    opera: false,
    u3: false,
    webkit: false,
    unknown: false
};

// 检测浏览器类型
function detectBrowser() {
    log.debug('detecting browser');
    log.debug('[ua: ' + ua + ']');
    var r;
    // 分析浏览器类型
    if (r = ua_lc.match(/ucbrowser\/([\d.]+)/)) {
        browser.uc = true;
        browser.name = 'UCBrowser';
        log.debug('[browser: uc]');
    } else if (r = ua_lc.match(/qqbrowser\/([\d.]+)/)) {
        browser.qq = true;
        browser.name = 'QQBrowser';
        log.debug('[browser: qq]');
    } else if (r = ua_lc.match(/liebaofast\/([\d.]+)/)) {
        browser.liebao = true;
        browser.name = 'LieBao';
        log.debug('[browser: liebao]');
    } else if (r = ua_lc.match(/msie ([\d.]+)/)) {
        browser.ie = true;
        browser.name = 'MSIE';
        log.debug('[browser: ie]');
        if (doc.documentMode === 10) {
            browser.ie10 = true;
            log.debug('[browser: ie10]');
        } else if (doc.documentMode === 9) {
            browser.ie9 = true;
            log.debug('[browser: ie9]');
        } else if (win.postMessage) {
            browser.ie8 = true;
            log.debug('[browser: ie8]');
        } else if (win.XMLHttpRequest) {
            browser.ie7 = true;
            log.debug('[browser: ie7]');
        } else if (doc.compatMode) {
            browser.ie6 = true;
            log.debug('[browser: ie6]');
        } else if (win.createPopup) {
            browser.ie5_5 = true;
            log.debug('[browser: ie5.5]');
        } else if (win.attachEvent) {
            browser.ie5 = true;
            log.debug('[browser: ie5]');
        } else if (doc.all) {
            browser.ie4 = true;
            log.debug('[browser: ie4]');
        }
    } else if (r = ua_lc.match(/firefox\/([\d.]+)/)) {
        browser.firefox = true;
        browser.name = 'Firefox';
        log.debug('[browser: firefox]');
    } else if (r = ua_lc.match(/chrome\/([\d.]+)/)) {
        browser.chrome = true;
        browser.name = 'Chrome';
        log.debug('[browser: chrome]');
    } else if (win.opera) {
        browser.opera = true;
        browser.name = 'Opera';
        log.debug('[browser: opera]');
    } else if (r = ua_lc.match(/version\/([\d.]+).*safari/)) {
        browser.safari = true;
        browser.name = 'Safari';
        log.debug('[browser: safari]');
    } else {
        browser.unknown = true;
        log.debug('[browser: unknown]');
    }
    // 提取浏览器版本号
    if (r && r.length > 1) {
        browser.version = r[1];
        log.debug('[browser.version: ' + browser.version + ']');
    }

    // 分析浏览器核心
    if (r = ua_lc.match(/u3\/([\d.]+)/)) {
        browser.u3 = true;
        browser.core = 'U3';
        log.debug('[browser.core: u3]');
    } else if ((r = ua_lc.match(/applewebkit\/([\d.]+)/)) ||
        (r = ua_lc.match(/safari\/([\d.]+)/))) {
        browser.webkit = true;
        browser.core = 'Webkit';
        log.debug('[browser.core: webkit]');
    }
    if (r && r.length > 1) {
        browser.coreVersion = r[1];
        log.debug('[browser.coreVersion: ' + browser.coreVersion + ']');
    }
    return browser;
}

// 获取客户端时区
function detectTimeZone() {
    var date = new Date(),
        offset = date.getTimezoneOffset(),
        offsetHour = offset / 60;
    timeZone = '';
    if (offsetHour < -10 || offsetHour > 10) {
        timeZone = offsetHour * 100;
    } else if (offsetHour >= -10 && offsetHour < 0) {
        timeZone = '-0' + Math.abs(offsetHour) * 100;
    } else if (offsetHour < 10) {
        timeZone = '0' + Math.abs(offsetHour) * 100;
    }
}

// 检测页面的referrer，即上一个页面的URL
function detectReferrer() {
    log.debug('detecting referrer');
    try {
        if (win.top && win.top.document) {
            referrer = win.top.document.referrer;
        }
        if (isBlank(referrer) && win.parent && win.parent.document) {
            referrer = win.parent.document.referrer;
        }
        if (isBlank(referrer)) {
            referrer = doc.referrer;
        }
    } catch(e) {};
    
    log.debug('[referrer: ' + referrer + ']');

    _getSPARefUrl(win.location.href, win.document.referrer);

    return referrer;
}

// 适用于单页面获取referrer
function _getSPARefUrl(absUrl, refUrl) {
    if (!sessionStorage) {
        return '';
    }

    var tempAbsUrl = sessionStorage.getItem('absUrl'),
        tempRefUrl = sessionStorage.getItem('refUrl');

    // 首次进入页面
    if (tempAbsUrl === null && tempRefUrl === null) {
        //存入本地存储
        tempAbsUrl = absUrl;
        sessionStorage.setItem('absUrl', absUrl);
        tempRefUrl = refUrl;
        sessionStorage.setItem('refUrl', refUrl);

    // 当前页面不等于缓存的页面，说明已切换页面。替换缓存中的refurl
    } else if (absUrl !== tempAbsUrl) {
        sessionStorage.setItem('refUrl', tempAbsUrl);
        tempRefUrl = tempAbsUrl;
        sessionStorage.setItem('absUrl', absUrl);
        tempAbsUrl = absUrl;
    }

    return tempRefUrl;
}

// 检测是否开启cookie功能
function detectCookieEnabled() {
    if (navi.cookieEnabled === true) {
        cookieEnabled = true;
    } else {
        var key = '_qla_cookie_',
            value = 'test';
        cookie.set(key, value);
        cookieEnabled = (cookie.get(key) === value);
    }
    log.debug('[cookie enabled: ' + cookieEnabled + ']');
    return cookieEnabled;
}

function detectSize() {
    var bch = (body && body.clientHeight) || 0,
        dch = (docElem && docElem.clientHeight) || 0,
        bcw = (body && body.clientWidth) || 0,
        dcw = (docElem && docElem.clientWidth) || 0;
    cHeight = (bch < dch) ? bch : dch;
    cWidth = (bcw < dcw) ? bcw : dcw;
    docHeight = (docElem && docElem.scrollHeight) ||
        (body && body.scrollHeight) ||
        0;
    docWidth = (docElem && docElem.scrollWidth) ||
            (body && body.scrollWidth) ||
            0;
}

// 检测环境
function detectEnvi() {
    doc = win.document;
    domain = doc.domain;
    body = doc.body;
    docElem = doc.documentElement;

    screen = win.screen;
    colorDepth = screen.colorDepth;
    sWidth = screen.width;
    sHeight = screen.height;
    resolution = sWidth + 'x' + sHeight;

    navi = win.navigator;
    platform = navi.platform;
    ua = navi.userAgent;
    ua_lc = ua.toLowerCase();

    detectTimeZone();
    detectReferrer();
    detectBrowser();
    detectSize();
    detectCookieEnabled();
}

/**
*
* @param fn {Function}   实际要执行的函数
* @param delay {Number}  执行间隔，单位是毫秒（ms）
*
* @return {Function}     返回一个“节流”函数
*/
function throttle(fn, threshhold) {
    // 记录上次执行的时间
    var last,
    // 定时器
    timer;
    // 默认间隔为 250ms
    threshhold || (threshhold = 250);
    // 返回的函数，每过 threshhold 毫秒就执行一次 fn 函数
    return function () {
        // 保存函数调用时的上下文和参数，传递给 fn
        var context = this;
        var args = arguments;
        var now = +new Date();
        // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
        // 执行 fn，并重新计时
        if (last && now < last + threshhold) {
            clearTimeout(timer);
            // 保证在当前时间区间结束后，再执行一次 fn
            timer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}


/**
 *
 * @param fn {Function}   实际要执行的函数
 * @param delay {Number}  延迟时间，单位是毫秒（ms）
 *
 * @return {Function}     返回一个“防反跳”了的函数
 */

function debounce(fn, delay) {

    // 定时器，用来 setTimeout
    var timer
  
    // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
    return function () {
  
        // 保存函数调用时的上下文和参数，传递给 fn
        var context = this
        var args = arguments
    
        // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
        clearTimeout(timer)
    
        // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
        // 再过 delay 毫秒就执行 fn
        timer = setTimeout(function () {
            fn.apply(context, args)
        }, delay)
    }
}



// 操作cookie
var cookie = {
    set: function (key, value, options) {
        if (!options) {
            options = {};
        }
        try {
            var map = {},
                c = '';
            map[key] = value;
            if (options.expires) {
                map.expires = options.expires.toGMTString();
            }
            map.domain = options.domain || domain;
            map.path = options.path || '/';
            map = new Map(map);
            map.each(function (value, key) {
                c += key + '=' + value + ';';
            });
            doc.cookie = c;
        } catch(e) {}
    },
    get: function (key) {
        try {
            var exp = '(^|)' + key + '=([^;]*)(;|$)',
                data = doc.cookie.match(new RegExp(exp));
            if (data) {
                return data[2];
            }
        } catch(e) {
            console.log('cookie get val failed:', e);
        }
    },
    remove: function (key) {
        try {
            this.set(key, '', {expires: date.at(-1)});
        } catch(e) {}
    }
};

var isReady = false,
    readyList = [];
// 绑定 document 在 ready 时执行的函数
function ready(fn) {
    // 如果有参数添加 ready 函数列表中
    if (fn) {
        readyList.push(fn);
        bindReady();

    // document 已经 ready，遍历 ready 函数列表执行函数并且清空列表
    } else {
        log.info('doc ' + (isReady ? 'has been' : 'just') + ' ready');
        isReady = true;
        each(readyList, function (fn) {
            if (fn) {
                fn.apply();
            }
        }, this);
        readyList = [];
    }
}

// --es5-ready--
function bindReady() {
    // 防止在绑定document的ready事件监听之前document已经触发ready事件
    // 直接执行
    if (equal(doc.readyState, 'complete')) {
        return defer(ready);
    }

    log.info('add document-load-event listener');
    // firefox或其他标准浏览器支持此方法
    domEvent.on(doc, 'DOMContentLoaded', onDOMLoaded);

    // 保险方法：监听win的load事件，这个事件任何情况下都能正常工作
    domEvent.on(win, 'load', onDOMLoaded);
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
// --es5-ready--
