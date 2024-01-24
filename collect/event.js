/**
 * 统计事件相关
 */

var event = api.event = function (category, action, label, value) {
    var data;
    if (isString(category)) {
        data = {
            category: category,
            action: action,
            label: label,
            value: value
        };
    } else {
        data = category;
    }
    
    // msg.trigger('send', data, {
    //     api: serverApi.event,
    //     type: 'event'
    // });
    msg.trigger('sendAli', data, {
        api: serverApi.event,
        type: 'event'
    });
};