// --userData--
var userDataObj = null,
    userDataStorage = {
    data: function (options) {
        // 由于MooTools中会重写元素的load方法，导致userData的原生load被替换
        // 因而会产生不良后果，故如果发现有MooTools则不使用userData存取数据
        if (!browser.ie || $get('MooTools')) {
            return null;
        }
        if (!userDataObj) {
            try {
                var el, expires = date.at(10 * 366 * 24 * 60 * 60 * 1000);
                el = $('<input>');
                el.type = 'hidden';
                el.style.position = 'absolute';
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.addBehavior('#default#userData');
                el.expires = expires.toGMTString();
                body.appendChild(el);
                userDataObj = el;
            } catch(e) {}
        }
        return userDataObj;
    },
    set: function (key, value, options) {
        try {
            var data = userDataStorage.data(options);
            if (data) {
                data.load(domain);
                data.setAttribute(key, stringifyStorage(value));
                data.save(domain);
            }
        } catch(e) {}
    },
    get: function (key) {
        try {
            var data = userDataStorage.data(),
                value;
            if (data) {
                data.load(domain);
                value = data.getAttribute(key);
            }
            return parseStorage(value);
        } catch(e) {}
    },
    remove: function (key) {
        try {
            var data = userDataStorage.data();
            if (data) {
                data.load(domain);
                data.removeAttribute(key);
                data.save(domain);
            }
        } catch(e) {}
    }
};
// --userData--