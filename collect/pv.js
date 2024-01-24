/**
 * 页面访问统计相关
 */

var pv = api.pv = function (data) {

    // msg.trigger('send', data, {
    //     api: serverApi.pv,
    //     type: 'pv'
    // });
    msg.trigger('sendAli', data, {
        api: serverApi.pv,
        type: 'pv'
    });
};
