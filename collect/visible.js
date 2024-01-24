/**
 * 页面元素曝光统计相关
 */


function fillVisibleParams(element) {
    if (!element) {
        return;
    }

    var namedNodeMap = element.attributes,
        params = {};

    for (var i = 0, len = namedNodeMap.length; i < len; i++) {
        var attr = namedNodeMap[i],
            key;

        if (attr.name.indexOf('log-') === 0 || attr.name.indexOf('data-log-') === 0) {
            key = attr.name.substring(4);

            if (attr.name.indexOf('data-log-') === 0) {
                key = attr.name.substring(9);
            }

            if (key) {
                params[key] = encode(encode(attr.value));
            }
        }
    }

    return params;
}

var visible = api.visible = function (data) {

    // msg.trigger('send', data, {
    //     api: serverApi.visible,
    //     type: 'visible'
    // });
    msg.trigger('sendAli', data, {
        api: serverApi.visible,
        type: 'visible'
    });
};


api.collectVisible = collectVisible;
api.bindVisibleScroll = bindVisibleScroll;



/**
 * 收集一次曝光
 * @param {object} [options]
 *  @param {string|element} [wrap=document] 指定容器类名或直接传入元素
 *  @param {string} [className='on-visible'] 需要曝光的类名
 *  @param {function} [callback] 回调，参数为收集到的元素数组
 * 
 * e.g.
 * func()
 * func({wrap})
 * func({wrap, className})
 */
function collectVisible(options) {
    options || (options = {});

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

    var className = options.className || 'on-visible';

    var items = Array.prototype.slice.call(wrap.getElementsByClassName(className)),
        len = items.length,
        result = [];

    var viewRect;

    var i, item;
    for (i = 0; i < len; i++) {
        item = items[i];
        if (item.getAttribute('isVisible')) {
            continue;
        }

        // 获取视觉边界，屏幕边界与容器边界交集
        if (!viewRect) {
            viewRect = getWindowRect();
            // console.log(viewRect)
            if (wrap !== document) {
                var wrapRect = wrap.getBoundingClientRect();
                // console.log(wrapRect)
                viewRect.top = Math.max(viewRect.top, wrapRect.top);
                viewRect.bottom = Math.min(viewRect.bottom, wrapRect.bottom);
                viewRect.left = Math.max(viewRect.left, wrapRect.left);
                viewRect.right = Math.min(viewRect.right, wrapRect.right);
            }
            // console.log({...viewRect})
            if (viewRect.top >= viewRect.bottom || viewRect.left >= viewRect.right) return;
        }

        if (judgeElementInViewport(item, viewRect)) {
            result.push(item);
        }
    }

    result.length && typeof options.callback === 'function' && options.callback(result);
    commonCollectVisible(result);
}




/**
 * 监听滚动事件收集曝光
 * @param {string|object} options 类名（兼容旧函数）或配置对象
 *  @param {string|element} wrap 指定容器类名或直接传入元素
 *  @param {string} [className='on-visible'] 需要曝光的类名
 *  @param {function} [callback] 回调，参数为收集到的元素数组
 * 
 * e.g.
 * func(wrap)
 * func({wrap})
 * func({wrap, callback})
 */
function bindVisibleScroll(options) {
    if (!options) return;

    var wrap;
    if (typeof options === 'string') {
        wrap = document.getElementsByClassName(options)[0];
    } else if (typeof options.wrap === 'string') {
        wrap = document.getElementsByClassName(options.wrap)[0];
    } else if (options.wrap && options.wrap.nodeType === 1) {
        wrap = options.wrap;
    }
    if (!wrap) return;

    collectVisible({
        wrap: wrap,
        className: options.className,
        callback: options.callback,
    });

    wrap.addEventListener('scroll', debounce(function (e) {
        collectVisible({
            wrap: e.target,
            className: options.className,
            callback: options.callback,
        });
    }, 100));
}




// 判断元素是否在容器内
function judgeElementInViewport(el, wrapRect, minViewPx) {
    if (typeof minViewPx === 'undefined') minViewPx = 1; // 最小显示px值
    var rect = el.getBoundingClientRect();
    // console.log(wrapRect, rect)
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




// 生成曝光日志
function commonCollectVisible(items) {
    var logs = [];
    items.forEach(function (item) {
        item.setAttribute('isVisible', 1);
        logs.push(extend({}, fillVisibleParams(item)));
    })
    if (!logs.length) return;

    var logsParamStr = '';
    try {
        logsParamStr = JSON.stringify(logs);
    } catch (err) {
        console.error('parse logs array err.', err);
    }

    visible({
        logs: logsParamStr
    });
}
