
const body = document.body;

function fillUrlParams(params, url = location.href){
    return url + '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
}

function sendInfo(params){
    const req = new Image();
    req.src = fillUrlParams(params);
    req.onload = function(){
        console.log("发送成功啦🚀 ~:", params);
    }
    req.onerror = function(err){
        console.log("发送失败啦🚀 ~ err:", err);
    }
}

function fillParams(target,extend){
    return {
        ...target.dataset,
        ...extend   
    }
}

class CollectClick {
    constructor(){
        this.init();
    }

    static getLogClick(e){
        if(!e.target){
            return null;
        }
        if(typeof e.target.className === 'string' && e.target.className.includes('on-log')){
            return e.target;
        }
        return this.getLogClick(e.target.parentNode);
    }

    static onLogClick(e){
        const target = this.getLogClick(e);
        if(!target) return;
        
        const params = fillParams(target,{
            Y:e.pageY,
            x:e.pageX,
        })
        sendInfo({ logType : 'click',...params});
    }

    static init(container){
        container.addEventListener('click',this.onLogClick)
    }
}

CollectClick.init(body);

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

    // 判断元素是否在容器内
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
            sendInfo(params);
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
        console.log("🚀 ~ CollectVisible ~ collectVisible ~ collectNodes:",curTarget, curTarget.getElementsByClassName(className))

        const wrapRect = this.getWrapRect(curTarget);
        console.log("🚀 ~ CollectVisible ~ collectVisible ~ wrapRect:", wrapRect)
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
    
}

const collectVisibleInstance = new CollectVisible();


function setUpCollectVisible(){
    collectVisibleInstance.collectVisible();
    window.addEventListener('scroll',function(){
        collectVisibleInstance.collectVisible();
    })
}

setUpCollectVisible();