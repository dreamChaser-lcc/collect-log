var request = require('request'),
    _ = require('underscore'),
    md5 = require('./md5'),
    random = require('./random'),

    conf = require('./conf');

/**
 * 组装服务端请求参数
 *
 * 返回格式：
 * {
 *   "id": "1332396785551379",
     "sign": "be4cf5f643cbf7b5eda61be121e6b349",
     "timestamp": "1234232352534",
     "data": params
 * }
 * @param  {Array} params 请求参数（Array)
 * @param  {String} secret 请求密钥
 * @return {Array}        [description]
 */
var wrapReqParams = function (params, secret) {
    var timeStamp = (new Date()).getTime(),
        reqId = timeStamp + random.randomNum(3),
        reqSign = md5(reqId + ':' + secret + ':' + timeStamp),
        wrapedParams = {
            id: reqId,
            sign: reqSign,
            timestamp: timeStamp,
        };

    wrapedParams.data = params;

    return wrapedParams;
};

/**
 * 服务端接口请求（伪）代理，请求获取的数据通过回调callback给回
 * @param  {[type]}   uri      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var apiProxy = function (uri, params, callback, secret) {
    // 组装参数
    var postData = wrapReqParams(params, secret);

    var _serverRequestStartTime = process.hrtime();

    (function (params, _serverRequestStartTime) {
        request.post({
            uri: uri,
            body: postData, // JSON.stringify(postData),
            json: true,
            timeout: conf.requestTimeout,
        }, function (err, response, body) {
            var _serverRequestEndTime = process.hrtime();

            var ms = (_serverRequestEndTime[0] - _serverRequestStartTime[0]) * 1e3 +
                (_serverRequestEndTime[1] - _serverRequestStartTime[1]) * 1e-6;

            console.log('[request server api] uri:' + uri + ' key:', secret, ' response-time: ' + ms.toFixed(3) + 'ms');

            postData = null;
            _serverRequestStartTime = null;

            if (err) {
                if (callback) {
                    callback(err, null);
                }
                console.error('[proxy request error] uri:' + uri, ' error:', err);

                params = null;
                uri = null;
                callback = null;
                return;
            }

            if (callback) {
                console.log('[request server response-data] uri:' + uri, ' response: ', JSON.stringify(body));
                callback(null, body);

                params = null;
                uri = null;
                callback = null;
            }
        });
    })(params, _serverRequestStartTime);
};

module.exports.apiProxy = apiProxy;
