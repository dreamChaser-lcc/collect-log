/**
 * 点击相关
 */
    // 鼠标位置偏移量，用于计算鼠标实际相对于页面左上角的位置
var offsetX = 0,
    offsetY = 0,
    pageZoom = 1;

extend(conf, {
    pageLayout: null,
    pageWidth: 0,
    pageAlign: null
});

msg.on('readVar', function () {
    // 页面布局
    // float 浮动布局
    // zoom 缩放
    conf.pageLayout = $_get('pl') || null;

    // 读取页面固定宽度
    conf.pageWidth = $_get('pw') || 0;
    
    // 读取页面对齐方式，默认为居中对齐
    conf.pageAlign = $_get('pa') || null;
});

msg.on('processVar', calPageOffset);

msg.on('resize', calPageOffset);

function calPageOffset() {
    // 当配置的pageWidth为空或者为0的时候，不更新页面鼠标的偏移量
    if (conf.pageWidth > 0) {
        if (conf.pageLayout === 'zoom') {
            pageZoom = cWidth / conf.pageWidth;
        }
        // switch (pageAlign) {
        //     case 'right':
        //         offsetX = pageWidth - docWidth;
        //         break;
                
        //     case 'left':
        //         offsetX = 0;
        //         break;
                
        //     default:
        //         // 默认为页面居中显示
        //         offsetX = (pageWidth - docWidth) * 0.5;
        // }
    }
}

var click = api.click = function (data) {
    if (!data) {
        return;
    }

    if (isDef(data.x)) {
        data.x = floor(data.x / pageZoom);
    }

    if (conf.pageLayout) {
        data.pl = conf.pageLayout;
    }

    if (conf.pageWidth) {
        data.pw = conf.pageWidth;
    }

    if (conf.pageAlign) {
        data.pa = conf.pageAlign;
    }

    // msg.trigger('send', data, {
    //     api: serverApi.click,
    //     type: 'click'
    // });
    msg.trigger('sendAli', data, {
        api: serverApi.click,
        type: 'click'
    });
};