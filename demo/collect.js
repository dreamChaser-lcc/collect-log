
const body = document.body;

class SentryEntity{
    initialized = false;
    Sentry = window.Sentry;
    constructor(){
        this.init();
    }
    init(){
        window.sentryOnLoad = () => {
            this.Sentry.init({
              dsn: "https://79519d9de955946d1e829b6ff43f7e63@o4506647619764224.ingest.sentry.io/4506647622385664",
        
              // Alternatively, use `process.env.npm_package_version` for a dynamic release version
              // if your build tool supports it.
              release: "my-project-name@2.3.12",
              integrations: [new Sentry.BrowserTracing(), Sentry.replayIntegration()],
        
              // Set tracesSampleRate to 1.0 to capture 100%
              // of transactions for performance monitoring.
              // We recommend adjusting this value in production
              tracesSampleRate: 1.0,
        
              // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
              tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
        
              // Capture Replay for 10% of all sessions,
              // plus for 100% of sessions with an error
              replaysSessionSampleRate: 0.1,
              replaysOnErrorSampleRate: 1.0,
            });
            this.initialized = true;
        };
        sentryOnLoad();
    }
    formatMsg(msg){
        const timeStamp = new Date().getTime() + 8 * 60 * 60 * 1000;
        const time = new Date(timeStamp).toISOString();
        if(Object.prototype.toString(msg) !== '[object Object]'){
            return  `${time} msg:${msg}`
        }
        const msgStr = JSON.stringify(msg).replace(/[{}]/g,'');
        return `${time} msg:${msgStr}`
    }
    sendMessage(msg){
        const msgStr = this.formatMsg(msg);
        this.Sentry.captureMessage(msgStr);
    }
}
const sentry = new SentryEntity();

function fillUrlParams(params, url = location.href){
    return url + '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
}

/**
 * 发送方式: navigator.sendBeacon || Image || sentry
 * @param {*} scene sendBeacon || Image || sentry
 * @param {*} params 
 */
function sendInfo(scene, params){
    const sendUrl = fillUrlParams(params);
    if(sentry.initialized){
        sentry.sendMessage(params);
    }
    else if(typeof navigator.sendBeacon ==='function' && /http(s)?/.test(location.protocol)){
        navigator.sendBeacon(sendUrl, {...params});
    }else{
        const req = new Image();
        req.src = sendUrl;
        req.onload = function(){
            console.log("发送成功啦🚀 ~:", params);
        }
        req.onerror = function(err){
            console.log("发送失败啦🚀 ~ err:", err);
        }
    }
}

function fillParams(target,extend){
    return {
        ...target.dataset,
        ...extend   
    }
}

/**防抖函数 */
function debounce(func, delay, immediate) {
    let timer;
    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timer = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timer;
      clearTimeout(timer);
      timer = setTimeout(later, delay);
      if (callNow) func.apply(context, args);
    };
}

/**节流函数 */
const throttle = (fn, delay) => {
    let startTime = Date.now();
    let timer = null;
    return function() {
        const curTime = Date.now();
        const restTime = delay - (curTime - startTime);
        const params = arguments;
        clearTimeout(timer);
        if (restTime <= 0) {
            //说明时间已超过
            fn.apply(this,[...params]);
        } else {
            timer = setTimeout(() => {
                fn.apply(this,[...params]);
                startTime = Date.now();
            }, restTime);
        }
    };
};

class CollectClick {
    constructor(){
    }

    getLogClick(e){
        if(!e.target){
            return null;
        }
        if(typeof e.target.className === 'string' && e.target.className.includes('on-log')){
            return e.target;
        }
        return this.getLogClick(e.target.parentNode);
    }

    onLogClick(e){
        const target = this.getLogClick(e);
        if(!target) return;
        
        const params = fillParams(target,{
            Y:e.pageY,
            x:e.pageX,
        })
        sendInfo('image',{ logType : 'click', ...params});
    }

    init(container){
        container.addEventListener('click',(e)=>this.onLogClick(e))
    }
}
const collectClick = new CollectClick();
collectClick.init(window);

/**收集曝光埋点 */
class CollectVisible {
    /**
     * 获取当前窗口的尺寸
     * @returns 
     */
    getWindowRect() {
        return {
            top: 0,
            bottom: (document.documentElement || document.body).clientHeight,
            left: 0,
            right: (document.documentElement || document.body).clientWidth,
        };
    }
    
    /**
     * 获取元素在视图中的位置，getBoundingClientRect可以获取元素距离视图的位置
     * @param {*} wrap 
     * @returns 
     */
    getWrapRect(curTarget){
        const windowRect = this.getWindowRect();
        let viewRect = windowRect;
        
        // 获取父级元素在视图中的位置
        if(curTarget !== document){
            const wrapRect = curTarget.getBoundingClientRect();
            viewRect.top = Math.max(wrapRect.top, windowRect.top);
            viewRect.bottom = Math.min(wrapRect.bottom, windowRect.bottom);
            viewRect.left = Math.max(viewRect.left, wrapRect.left);
            viewRect.right = Math.min(viewRect.right, wrapRect.right);
        }
        if (viewRect.top >= viewRect.bottom || viewRect.left >= viewRect.right) return null;
        return viewRect;
    }

    /**
     * 判断元素是否在视图内
     * @param {*} el 判断元素
     * @param {*} wrapRect 容器视图
     * @param {*} minViewPx 最小显示像素(例：边框)
     * @returns 
     */
    judgeElementInViewport(el, wrapRect, minViewPx) {
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

    submitCollectVisible(targetList){
        for(let target of targetList){
            target.setAttribute('isVisible', 'Y');
            const params = {
                logType: 'visible',
                ...fillParams(target)
            }
            sendInfo('image',params);
        }
    }

    collectVisible(options){
        const wrap = options?.wrap;
        const className = options?.className ?? 'on-visible';
        const callback = options?.callback;
        let curTarget = null;
        if(!wrap){
            curTarget = document;
        }else if (typeof wrap === 'string'){ //类名
            curTarget = document.getElementsByClassName(wrap)[0];
        }else if(wrap && wrap.nodeType === 1){ //直接传入元素
            curTarget = wrap;
        }

        if(!document.body.getBoundingClientRect) return;

        const collectNodes = Array.from(curTarget.getElementsByClassName(className));

        const wrapRect = this.getWrapRect(curTarget);
        if(!wrapRect) return;
        // 可以用filter替代，兼容性可能会差点
        let result = [];
        for(let item of collectNodes){
            if (item.getAttribute('isVisible') === 'Y') {
                continue;
            }
            if(this.judgeElementInViewport(item,wrapRect)){
                result.push(item);
            }
        }
        result.length && typeof callback === 'function' && callback(result);
        this.submitCollectVisible(result);
    }

    /**绑定滚动监听 */
    init(){
        this.collectVisible();
        const execFunc = (e) => {
            this.collectVisible();
        } 
        window.addEventListener('scroll', throttle(execFunc, 300));
    }
}

const collectVisibleInstance = new CollectVisible();
function scrollEvent(execFunc){
    window.addEventListener('scroll',execFunc)
}
collectVisibleInstance.init();