/**填充url */
function fillUrlParams(params, url = location.href){
    return url + '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
}

/**合并参数 */
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