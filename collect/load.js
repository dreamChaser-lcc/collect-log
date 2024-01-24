var 
    // 页面关闭数据发送阻塞时间
    unloadSleep = 300;
    
msg.on('readVar', function () {
    // 页面关闭数据发送阻塞时间
    if (isBoolean($_get('ul_sl'))) {
        unloadSleep = $_get('ul_sl');
    }
    log.debug('[unload sleep time: ' + unloadSleep + ']');
});

msg.on('load', sendLoad);

// 在浏览器关闭前尝试发送加载完毕的数据
// 避免由于页面加载未完成就关闭而导致没有发出加载完毕的数据
msg.on('leave', sendLoad);
msg.on('leave', sendUnload);

var sentLoad = false;

// 采集脚本数据发送
function sendLoad(options) {
    // 一个页面只发送一次load数据
    if (sentLoad) {
        return;
    }
    
    var data = {};
    msg.trigger('send', data, {priority: 'xhr', api: serverApi.pv});
    sentLoad = true;
    return data;
}

// 发送页面关闭数据
function sendUnload(options) {
    // storage.lastURL(url);
    // storage.forward(date.at(0));

    var data = {};
    msg.trigger('send', data, {priority: 'image', api: serverApi.pv});
    sleep(unloadSleep);
}