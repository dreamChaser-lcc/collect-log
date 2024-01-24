/**
 * 统一统计事件相关
 */

var commonlog = api.commonlog = function (category, action, label, value) {
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
    msg.trigger('sendAliLess', data, {
        api: serverApi.event,
        type: 'event'
    });
};