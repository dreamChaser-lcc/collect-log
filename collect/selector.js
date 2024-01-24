// 页面元素选择器及元素创建器
// 只支持选择body或指定id的元素
function $(selector) {
    // 如果没有指定选择器，则返回undefined
    if (!selector) {
        return;
    }
    
    // 由于body只存在一个，此处直接返回body元素
    if (selector === 'body') {
        return body;
        
    // 处理选择符为字符串的情况
    } else if (isString(selector)) {
        var expr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
            match = expr.exec(selector);
        if (match[1]) {
            var tagExpr = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
                tag = tagExpr.exec(match[1]);
            return doc.createElement(tag[1]);
        } else if (match[2]) {
            return doc.getElementById(match[2]);
        }
    }
}