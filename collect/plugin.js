/**
 * 插件相关
 */

// 读取初始化变量
msg.on('beforeInit', function () {
    // 读取打包的预配置插件
    var pkd_pls = $_get('packed_plugins') || $_get('pkd_pls');
    plug(pkd_pls);
    // 读取预配置插件
    var pls = $_get('plugins') || $_get('pls');
    plug(pls);
});

// 读取变量

// 处理变量

// 绑定事件监听

// 初始化收尾工作
msg.on('afterInit', function () {
    // 执行插件
    eachPlugin(function (pl) {
        pl.call(this);
    }, api);
});

// 插件
var plugins = {};
    // 遍历插件
    eachPlugin,

// 默认为遍历插件函数，可以被覆盖为其他函数
plugins.each = eachPlugin = function (fn, context) {
    if (!fn) {
        return;
    }
    each(plugins, function (pl) {
        if (pl && pl !== eachPlugin) {
            fn.call(context, pl);
        }
    });
};

// 插件注入函数
var plug = function (name, plugin, context) {
    if (!name) {
        return;
    }
    var pls, bind;
    if (isString(name)) {
        pls = {};
        pls[name] = plugin;
    } else {
        pls = name;
        context = plugin;
    }
    if (!context) {
        context = api;
    }
    bind = function (pl) {
        return function () {
            pl.call(context);
        };
    };
    each(pls, function (pl, name) {
        plugins[name] = bind(pl, context);
    });
};