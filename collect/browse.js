
var browse = api.browse = function (data) {

    msg.trigger('sendAliLess', data, {
        api: serverApi.browse,
        type: 'browse'
    });
};


api.collectBrowse = collectBrowse;
api.bindBrowseScroll = bindBrowseScroll;



/**
 * 收集一次浏览
 * @param {object} [options]
 *  @param {string|element} [wrap=document] 指定容器类名或直接传入元素
 *  @param {function} [callback] 回调，参数为收集到的元素数组
 * 
 * e.g.
 * func()
 * func({wrap})
 * func({wrap, className})
 */
var isSending = false;
function collectBrowse(options) {
    options || (options = {});
    if (isSending) {
        return;
    }
    isSending = true;
    setTimeout(function () {
        isSending = false;
    },500)

    var wrap;
    if (!options.wrap) {
        wrap = document;
    } else if (typeof options.wrap === 'string') {
        wrap = document.getElementsByClassName(options.wrap)[0];
    } else if (options.wrap && options.wrap.nodeType === 1) {
        wrap = options.wrap;
    }
    if (!wrap) return;
    if (!document.body.getBoundingClientRect) return;

    window.wrap = wrap;

    var clientHeight = wrap.clientHeight
    var scrollHeight = wrap.scrollHeight;
    var scrollTop = wrap.scrollTop;
    var windowHeight = window.innerHeight;

    
    
    var result = {};
    result.clientHeight = clientHeight;
    result.scrollHeight = scrollHeight;
    result.scrollTop = scrollTop;
    result.windowHeight = windowHeight;
    result.viewTime = options.viewTime;

    result.length && typeof options.callback === 'function' && options.callback(result);
    commonCollectBrowse(result);
}




/**
 * 监听滚动事件收集浏览信息
 * @param {string|object} options 类名（兼容旧函数）或配置对象
 *  @param {string|element} wrap 指定容器类名或直接传入元素
 *  @param {function} [callback] 回调，参数为收集到的元素数组
 * 
 * e.g.
 * func(wrap)
 * func({wrap})
 * func({wrap, callback})
 */
function bindBrowseScroll(options,time) {
    if (!options) return;
    var bindTime = Date.now();
    var wrap;
    if (typeof options === 'string') {
        wrap = document.getElementsByClassName(options)[0];
    } else if (typeof options.wrap === 'string') {
        wrap = document.getElementsByClassName(options.wrap)[0];
    } else if (options.wrap && options.wrap.nodeType === 1) {
        wrap = options.wrap;
    }
    if (!wrap) return;

    

    wrap.addEventListener('scroll', function (e) {
        collectBrowse({
            wrap: e.target,
            viewTime: Date.now() - bindTime,
            callback: options.callback,
        });
    });

    var intTime = time || 2500;
    // 定时提交
    var wrapInterval = setInterval(function () {
        collectBrowse({
            wrap: wrap,
            viewTime: Date.now() - bindTime,
            callback: options.callback,
        });
    }, intTime)
    
    window.onbeforeunload = function (e) {  
        collectBrowse({
            wrap: wrap,
            viewTime: Date.now() - bindTime,
            callback: options.callback,
        });
        
    } 
        
}




// 判断元素是否在容器内
function judgeElementInViewport(el, wrapRect, minViewPx) {
    if (typeof minViewPx === 'undefined') minViewPx = 1; // 最小显示px值
    var rect = el.getBoundingClientRect();
    if (rect.bottom < wrapRect.top + minViewPx
        || rect.top > wrapRect.bottom - minViewPx
        || rect.right < wrapRect.left + minViewPx
        || rect.left > wrapRect.right - minViewPx
    ) {
        return false;
    }
    return true;
}




function getWindowRect() {
    return {
        top: 0,
		bottom: (document.documentElement || document.body).clientHeight,
		left: 0,
		right: (document.documentElement || document.body).clientWidth,
	};
}




// 生成浏览日志
function commonCollectBrowse(item) {
    var logs = [];
    var logsParamStr = '';
    logs.push(extend({}, item));
    var logsParamStr = '';
    try {
        logsParamStr = JSON.stringify(logs);
    } catch (err) {
        console.error('parse logs array err.', err);
    }
    browse({
        logs: logsParamStr
    });
}
