var fs = require('fs'),
    UglifyJS = require("uglify-js"),
    collectDir = 'collect/',
    distDir = 'dist/',
    components = {};

// 读取所有组件
function readComponents() {
    components = {};
    var files = fs.readdirSync(collectDir);
    files.forEach(function (filename) {
        var name = filename.substring(0, filename.lastIndexOf('.')),
            content = fs.readFileSync(collectDir + filename, 'utf8');
        components[name] = content;
    });
}

// 从某个文件中提取出代码片段
function findSnippet(component, block) {
    var script = components[component],
        tag = '// --' + block + '--',
        index = script.indexOf(tag) + tag.length,
        lastIndex = script.lastIndexOf(tag);
    if (index > -1 && lastIndex > -1) {
        return script.substring(index, lastIndex);
    }
    return '';
}

// 压缩代码
function minify(content) {
    var options = {
            fromString: true, 
            compress: {
                screw_ie8: true
            },
            mangle: {
                screw_ie8: true
            }
        };
    return UglifyJS.minify(content, options).code;
}

// 合并后压缩文件
function compile(isMinify) {
    var index = 1;
    if (typeof isMinify !== 'boolean') {
        isMinify = false;
        index = 0;
    }

    // 读取所有小组件
    readComponents();

    var options = Array.prototype.slice.call(arguments, index);

    // 清理掉选项中不存在的组件
    for (var i = options.length - 1; i >= 0; i--) {
        var o = options[i],
            exists = false;
        for (var name in components) {
            if (name === o) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            options.splice(i, 1);
        }
    }

    var script = components.wrap,
        require, option;
    // 插入必须组件
    while ((require = (/\/\/\s@require\(([^\)]+)\)/ig.exec(script))) !== null) {
        script = script.replace(require[0], components[require[1]]);
        console.log("🚀 ~ compile ~ script:",require[0],require[1])
    }
    // 插入可选组件
    while ((option = (/\/\/\s@option\(([^\)]+)\)/ig.exec(script))) !== null) {
        var isContain = options.indexOf(option[1]) > -1;
        script = script.replace(option[0], isContain ? components[option[1]] : '');
    }

    // 处理调试语句
    if (options.indexOf('debug') < 0) {
        var lines = script.split('\n'),
            lineNum = lines.length - 1;
        while (lineNum >= 0) {
            if (!lines[lineNum] || lines[lineNum].trim().indexOf('log.') === 0) {
                lines.splice(lineNum, 1);
            }
            lineNum--;
        }
        script = lines.join('\n');
    }
    // console.log("🚀 ~ compile ~ script:", script)

    return isMinify ? minify(script) : script;
}

function compileAndSave(arg1, arg2) {
    var index = 2;
    if (typeof arg2 === 'boolean') {
        filename = arg1;
        isMinify = args;
    } else if ((typeof arg2 !== 'boolean') &&
        (typeof arg1 === 'boolean')) {
        isMinify = arg1;
        index = 1;
    } else if (typeof arg1 !== 'boolean') {
        isMinify = false;
        index = 0;
    }

    var options = Array.prototype.slice.call(arguments, index);
    options.sort();

    if (index !== 2) {
        var filenameComs = options.slice();
        filenameComs.unshift('collect');
        if (isMinify) {
            filenameComs.push('min');
        }
        filenameComs.push('js');
        filename = filenameComs.join('.');
    }
    filename = distDir + filename;

    // 如果发布文件夹不存在则创建文件夹
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    options.unshift(isMinify);
    var script = compile.apply(this, options);
    fs.writeFileSync(filename, script, 'utf8');
}

exports.compile = compile;
exports.compileAndSave = compileAndSave;