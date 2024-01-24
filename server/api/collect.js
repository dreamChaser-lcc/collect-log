var _ = require('underscore'),

    log = require('../log'),
    common = require('./common'),

    clickApi = require('./click'),
    errorApi = require('./error'),
    eventApi = require('./event'),
    pv = require('./pv');

function handle(req, res, next) {
    var query = req.query;
    
    req._options.logtype = req._options.debug === '1' ?
                    'debug' : 'pv';

    // logtype 为空
    if (!query.logtype || query.logtype === 'null') {
        res.status(400).send('no log type');
        // TODO 本地记录 BAD REQUEST
        return;
    }

    switch (query.logtype) {
        case 'click':
            clickApi.handle(req, res, next);
            break;

        case 'error':
            errorApi.handle(req, res, next);
            break;

        case 'event':
            eventApi.handle(req, res, next);
            break;

        case 'pv':
            pv.handle(req, res, next);
            break;
    }
}

exports.handle = handle;