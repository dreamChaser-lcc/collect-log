function parseQuery(queryString) {
    if (!queryString) {
        queryString = location.search.substring(1);
    }
    var queryPairs = queryString.split('&'),
        query = {};
    each(queryPairs, function (pair) {
        var p = pair.split('='),
            key = p[0],
            value = p[1];
        if (isDef(key) && isDef(value)) {
            query[key] = value;
        }
    });
    return query;
}

setHandlers.push(function (key, value) {
    if (key && value && value.indexOf('query.') === 0) {
        var query = parseQuery(),
            v = query[value.replace('query.', '')];
        if (isDef(v)) {
            qla.set(key, v);
        }
        return true;
    }
    return false;
});