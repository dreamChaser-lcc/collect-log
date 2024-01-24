var conf = {
        server: 'http://collect.qlchat.com',
        scrollBoxClass: ''
    },

    serverApi = {
        collect: '/collect',
        pv: '/pv',
        event: '/event',
        click: '/click',
        error: '/error',
        visible: '/visible',
        browse: '/browse'
    },

    // 前缀
    QLA = '_qla_';

setHandlers.push(function (key, value) {
    if (isDef(conf[key])) {
        conf[key] = value;
        return true;
    }
    return false;
});