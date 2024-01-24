var NS_SESSION = 'COLLECT_SESSION';

var toNS = function(key) {
    return 'QL_' + key;
};

// 浏览器会话存储器
// 浏览器关闭后将会清空数据
var session = {
    set: function (key, value) {
        var ns = toNS(NS_SESSION);
        var data = this.getData(ns);
        data[key] = value;
        this.setData(ns, data);
    },
    get: function (key) {
        var ns = toNS(NS_SESSION);
        var data = this.getData(ns);
        return data[key];
    },
    remove: function (key) {
        var ns = toNS(NS_SESSION);
        var data = this.getData(ns);
        delete data[key];
        this.setData(ns, data);
    },
    parse: function (str) {
        return !isBlank(str) ? JSON.parse(str) : {};
    },
    stringify: function (data) {
        if (!data) {
            data = {};
        }
        return JSON.stringify(data);
    },
    getData: function (ns) {
        try {
            var dataStr, data;
            if (sessionStorage) {
                dataStr = sessionStorage.getItem(ns);
            } else {
                dataStr = cookie.get(ns);
            }
            return this.parse(dataStr);
        } catch(e) {
            return {};
        }
    },
    setData: function (ns, data) {
        try {
            if (sessionStorage) {
                sessionStorage.setItem(ns, this.stringify(data));
            } else {
                cookie.set(ns, this.stringify(data));
            }
        } catch(e) {}
    }
};
