var modules = [ 'src', 'debug',
                'pv', 'click', 'event',
                'error', 'visible', 'selector', 'query',
                'es5', 'userdata',
                'onlog', 'onpv', 'onvisible','browse','commonlog'],
    len = modules.length;

exports.abbr = function (arr) {
    if (!arr || arr.length === 0) {
        return;
    }
    var sn = '',
        n;
    modules.forEach(function (m, i) {
        n = arr.indexOf(m) > -1 ? '1' : '0';
        sn = n + sn;
    });
    sn = parseInt(sn, 2).toString(32);
    while (sn.length < 4) {
        sn = 'x' + sn;
    }
    return sn;
};

exports.expand = function (abbr) {
    if (!abbr) {
        return [];
    }
    abbr = abbr.replace(/x/g, '');
    var sn = parseInt(abbr, 32).toString(2).split('').reverse(),
        arr = [];
    while (sn.length < len) {
        sn.push('0');
    }
    modules.forEach(function (m, i) {
        if (i < len && sn[i] === '1') {
            arr.push(m);
        }
    });
    return arr;
};