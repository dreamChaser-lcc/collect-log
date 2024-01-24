var
    // 最大并发请请求数，一条数据向采集服务器列表发送数据的最大允许的并发请求数量
    maxConcurrentRequests = -1,
    // 最大成功次数，一条数据向采集服务器列表发送数据达到指定成功次数后就不再发送
    maxSuccessRequests = 1;
    
function (urlVar, options) {
    var urlVarString = urlVar.stringify(),
        type = options.type || 0,
        retry = options.retry || 0,
        always = options.always,
        done = options.done,
        fail = options.fail,
        _servers = options.servers || servers,
        serverQueue = slice.call(_servers),
        serverCount = size(serverQueue),
        priority = options.priority || 'xhr',
        cancel, cancelAndResend, canceled = false,
        url, next, loadFn, errorFn,
        imageLoad, imageSent = false, imageAbort, imageErrorFn, imageLoadFn,
        XHR, xhrSent = false, xhrLoad, xhrAbort, xhrLoadFn, xhrErrorFn,
        success = 0,
        index = 0,
        queue = [];
        
    loadFn = function (index) {
        if (canceled) {
            return;
        }
        ++success;
        log.info('load [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + '] [success:' + success + ']');
        if (success >= maxSuccessRequests) {
            log.info('load success is larger than max success requests [maxSuccessRequests:' + maxSuccessRequests + ']');
            if (always) {
                always.call(this);
            }
            if (done) {
                done.call(this);
            }
        } else {
            next(index);
        }
    };
    errorFn = function (index) {
        if (canceled) {
            return;
        }
        if (index < (serverCount - 1)) {
            log.warn('fail [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + ']');
            next(index);
        } else {
            if (always) {
                always.call(this);
            }
            if (fail) {
                fail.call(this);
            }
        }
    };
    xhrLoad = function (index) {
        if (canceled) {
            return;
        }
        var url = queue[index].url;
        var xhr;
        if (win.XDomainRequest) {
            log.debug('[request:XDomainRequest]');
            XHR = win.XDomainRequest;
            xhr = new XHR();
            xhr.open('get', url);
        } else if (win.XMLHttpRequest) {
            log.debug('[request:XMLHttpRequest]');
            XHR = win.XMLHttpRequest;
            var r = new XHR();
            if (has(r, 'withCredentials')) {
                xhr = r;
                xhr.open('get', url, true);
                xhr.setRequestHeader('Content-Type', 'text/plain');
            }
        }
        if (xhr) {
            log.info('try ajax [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + ']');
            var _loadFn = xhrLoadFn(index);
            var _errorFn = xhrErrorFn(index);
            xhr.onreadystatechange = function () {
                queue[index].xhrState[xhr.readyState] = true;
                if (xhr.readyState === 4) {
                    var _fn = queue[index].xhrState[2] ? _loadFn : _errorFn;
                    _fn.call();
                }
            };
            queue[index].xhr = xhr;
            queue[index].xhrState = {};
            xhr.onerror = xhr.ontimeout = _errorFn;
            xhr.send();
            delay(_errorFn, sendTimeout);
        } else if (!isReady) {
            log.warn('not support ajax, cancel sending data, wait for doc ready and then resend data');
            cancelAndResend();
            return;
        } else {
            log.info('not support ajax [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + ']');
            imageLoad(index);
        }
        xhrSent = true;
    };
    xhrAbort = function (index) {
        var xhr = queue[index].xhr;
        if (xhr) {
            if (xhr.abort) {
                xhr.abort();
            }
            xhr.onerror = null;
            xhr.ontimeout = null;
            queue[index].xhr = null;
        }
    };
    xhrLoadFn = function (index) {
        return function () {
            if (canceled) {
                return;
            }
            log.info('ajax load [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + ']');
            xhrAbort(index);
            loadFn(index);
        };
    };
    xhrErrorFn = function (index) {
        return function () {
            if (canceled || queue[index].xhrError) {
                return;
            }
            queue[index].xhrError = true;
            // 如果页面尚未加载完成，取消发送数据并在页面加载完成后才重新发送数据
            if (!isReady) {
                log.warn('ajax fail, cancel sending data, wait for doc ready and then resend data');
                cancelAndResend();
                return;
            }
            log.info('ajax fail [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + ']');
            xhrAbort(index);
            if (imageSent) {
                errorFn(index);
            } else {
                imageLoad(index);
            }
        };
    };
    imageLoad = function (index) {
        var _loadFn = imageLoadFn(index);
        var _errorFn = imageErrorFn(index);
        var url = queue[index].url;
        var image = new Image(1, 1);
        image.src = url;
        queue[index].image = image;

        image.onload = _loadFn;
        image.onabort = image.onerror = _errorFn;
        imageSent = true;
        delay(_errorFn, sendTimeout);
    };
    imageAbort = function (index) {
        var image = queue[index].image;
        if (image) {
            image.onload = null;
            image.onerror = null;
            image.src = '';
            image.src = null;
            image.removeAttribute('src');
            queue[index].image = null;
        }
    };
    imageLoadFn = function (index) {
        return function () {
            if (canceled) {
                return;
            }
            log.info('image load [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + ']');
            imageAbort(index);
            loadFn(index);
        };
    };
    imageErrorFn = function (index) {
        return function () {
            if (canceled || queue[index].imageError) {
                return;
            }
            queue[index].imageError = true;
            log.info('image fail [index:' + index + '] [retry:' + retry + '] [url:' + queue[index].server + ']');
            imageAbort(index);
            if (xhrSent) {
                errorFn(index);
            } else {
                xhrLoad(index);
            }
        };
    };
    cancel = function () {
        canceled = true;
        each(queue, function (q, i) {
            xhrAbort(i);
            imageAbort(i);
        });
        queue = null;
    };
    cancelAndResend = function () {
        cancel();
        ready(function () {
            options.retry = retry + 1;
            send(urlVar, options);
        });
    };
    next = function (index) {
        if (canceled) {
            return;
        }
        var server = serverQueue.shift();

        if (!isBlank(server)) {
            if (server.substring(server.length - 1) !== '/') {
                server += '/';
            }
            log.info('next server [index:' + index + '] [retry:' + retry + '] [url:' + server + ']');
            queue[index] = {};
            queue[index].server = server;
            queue[index].url = server + 'c?rnd=' + rand(4) + '&type=' + type + '&rt=' + retry + urlVarString;
            if (priority === 'xhr') {
                xhrLoad(index);
            } else {
                imageLoad(index);
            }
        }
    };
    for (var i = 0; i < serverCount; i++) {
        if ((maxConcurrentRequests === -1) || (i < maxConcurrentRequests)) {
            next(i);
        }
    }
}

msg.on('readVar', function () {
    
    // 读取数据发送超时时间
    if (isNumber($_get('send_timeout'))) {
        sendTimeout = $_get('send_timeout');
    } else if (isNumber($_get('snd_to'))) {
        sendTimeout = $_get('snd_to');
    }
    log.debug('[data send timeout: ' + sendTimeout + ']');
        
    // 读取最大并发请请求数
    if (isNumber($_get('max_concurrent'))) {
        maxConcurrentRequests = $_get('max_concurrent');
    } else if (isNumber($_get('mx_conc'))) {
        maxConcurrentRequests = $_get('mx_conc');
    }
    log.debug('[max concurrent requests: ' + maxConcurrentRequests + ']');
    
    // 读取最大成功次数
    if (isNumber($_get('max_success'))) {
        maxSuccessRequests = $_get('max_success');
    } else if (isNumber($_get('mx_succ'))) {
        maxSuccessRequests = $_get('mx_succ');
    }
    log.debug('[max success requests: ' + maxSuccessRequests + ']');
});