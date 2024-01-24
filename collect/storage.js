/**
 * 存储相关
 */

var cookieStorage = {
    set: function (key, value, options) {
        try {
            if (!options) {
                options = {};
            }
            value = stringifyStorage(value);
            // 十年过期时间
            options.expires = date.at(10 * 366 * 24 * 60 * 60 * 1000);
            cookie.set(key, value, options);
        } catch(e) {}
    },
    get: function (key) {
        try {
            return parseStorage(cookie.get(key));
        } catch(e) {}
    },
    remove: function (key) {
        try {
            cookie.remove(key);
        } catch(e) {}
    }
};

var localStorage = {
    set: function (key, value, options) {
        try {
            if (win.localStorage) {
                win.localStorage.removeItem(key);
                win.localStorage.setItem(key, stringifyStorage(value));
            }
        } catch(e) {}
    },
    get: function (key) {
        try {
            return win.localStorage ? 
                        parseStorage(win.localStorage.getItem(key)) :
                        {};
        } catch(e) {}
    },
    remove: function (key) {
        try {
            if (win.localStorage) {
                win.localStorage.removeItem(key);
            }
        } catch(e) {}
    }
};

// --userdata-userData--
var userDataStorage = null;
// --userdata-userData--

// 将存储数据反序列化为数据
function parseStorage(str) {
    var kvs, kv, value, create, expires, scope,
        now = date.usec(),
        elapsed = floor(now / 1000),
        data = {};
    if (str && (str.length > 0)) {
        kv = str.split('=');
        if (kv.length > 0) {
            value = decode(kv[0]);
            create = Number(kv[1]);
            expires = Number(kv[2]);
            if (expires === 0 || expires > elapsed) {
                log.debug('parseStorage from ' + str + ' to ' + [value, create, expires]);
                return [value, create, expires];
            }
        }
    }
}

// 序列化为存储格式
function stringifyStorage(value) {
    if (isString(value)) {
        return value;
    }
    return value.join('=');
}


// 数据存储器
// 数据存储在 localStorage 或者 cookie 中
var storage = {
    // 客户端存储的总调度方法，可以将键值保存到所有位置
    set: function (key, value, options) {
        var data,
            now = date.usec(),
            create = ceil(now / 1000),
            // 数据过期时间，默认为1年
            expires = now + (1 * 366 * 24 * 60 * 60 * 1000);

        if (isBlank(options)) {
            options = {};
        }

        if (isNumber(options.expires)) {
            expires = options.expires;
        }

        if (expires > 0) {
            // 如果设置的过期时间小于当前毫秒数，则认为是当前时间加上指定毫秒
            if (expires < now) {
                expires += now;
            }
            expires = ceil(expires / 1000);

        // 如果小于0则是不正常的过期时间，不保存
        } else if(expires < 0) {
            return this;
        }

        data = [value, create, expires];
        if (options.local !== false && localStorage) {
            localStorage.set(key, data, options);
        }
        if (options.cookie !== false && cookieStorage) {
            cookieStorage.set(key, data, options);
        }
        if (options.userData !== false && userDataStorage) {
            userDataStorage.set(key, data, options);
        }
        return this;
    },
    get: function (key, options) {
        var data;

        if (isBlank(options)) {
            options = {};
        }

        if (options.local !== false && localStorage) {
            data = localStorage.get(key);
        }

        if (!data && options.cookie !== false && cookieStorage) {
            data = cookieStorage.get(key);
        }

        if (!data && options.userData !== false && userDataStorage) {
            data = userDataStorage.get(ns);
        }

        return data && data[0];
    },
    has: function (key, options) {
        var value = this.get(key, options);
        return !isBlank(value);
    },
    remove: function (key) {
        if (localStorage) {
            localStorage.remove(key);
        }
        if (cookieStorage) {
            cookieStorage.remove(key);
        }
        if (userDataStorage) {
            userDataStorage.remove(key);
        }
        return this;
    }
};

 // 扩展常用的存取操作
extend(storage, {
    // 从浏览器存储中获取上一次页面跳转时间
    forward: function (f) {
        if (f) {
            // 默认过期时间为180秒
            storage.set('pf', f.getTime(), {expires: 180000});
        }
        return storage.get('pf');
    }
});