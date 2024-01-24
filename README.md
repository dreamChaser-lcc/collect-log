使用说明
---------
## 项目运行
```shell
cd projDir
npm install
node server/startup.js
```


## 配置日志采集全局变量配置
```shell
<script type="text/javascript">
    var _uaq = window._uaq || [];
    // 配置站点名,默认值为： ql-h5
    _uaq.push(['set', 'site', 'weibo']);

    // 配置站点版本, 默认值为: 1.0.0
    _uaq.push(['set', 'sitever', '1.0.2']);

    // 配置日志采集服务地址，用于发送采集日志,默认地址为： //collect.qlchat.com
    _uaq.push(['set', 'server', '//localhost:4999']);

    // 其它自定义日志参数配置
    // 配置采集当前url参数key2作为日志参数log_key
    _uaq.push(['set', 'log_key', 'query.key2']);

</script>
```

## 在页面引用采集脚本
### 基础路径
/js/c

### 参数
采集脚本可以按需要加载对应的脚本，可选脚本参数以'.'拼接在基础路径后，拼以'.js'结尾

### 可选脚本参数：
click ---- 点击日志api脚本

event ---- 事件日志api脚本

pv    ---- 访问日志api脚本

error ---- 错误日志api及自动发送错误日志脚本

visible ---- 曝光日志api脚本

query ---- 页面url参数解析脚本，通过配置全局变量（_uaq.push(['set', 'xx', 'query.xxx']);）来达到提取url中xxx参数值作为日志参数xx的值的工具方法

onlog ---- 点击日志自动采集发送脚本

onpv  ---- 访问日志自动采集发送脚本

onvisible --- 曝光日志自动采集发送脚本

src   ---- 获取源码（否则获取编译后代码）

debug ---- 开启调试模式（浏览器控制台会打印采集脚本过程参数）

test  ---- 测试模式（此模式下所有日志请求到采集服务不作日志存储，只返回成功标识）



### 完整的采集脚本代码
```shell
    <script type="text/javascript" src="http://localhost:4999/js/c.click.event.pv.error.visible.query.onlog.onpv.onvisible.debug.test.src.js"></script>
```

## 日志公参
所有类型的日志均会打印公有参数及全局自定义参数，单个类型的日志要求打印相应类型所必要的参数。文档参考：http://docs.corp.qlchat.com/pages/viewpage.action?pageId=8323446

## 点击日志采集
### 自动采集（采集脚本引用时，需添加'.click' 以及'.onlog'）
1.在需要打印点击日志的标签元素中添加class="on-log"

2.自定义日志参数通过在标签元素中添加以'data-log-'开头的属性字段。

示例：
```shell
    // html部分
    <div class="on-log"  log-title="标题" log-region="header" log-pos="banner"></div>

    //日志打印时，日志打印参数
    {
        // 公有参数、全局自定义参数
        ...(略)
        ,
        title: '标题',
        region: 'header',
        'pos': 'banner'
    }
```

### 手动采集（采集脚本引用时，需添加'.click')
```shell
_qla('click', {
    key1: value1,
    key2: value2
});
```

## 访问日志
### 自动采集（采集脚本引用时，需添加'.pv' 以及'.onpv'）

### 手动采集（采集脚本引用时，需添加'.pv'）
```shell
_qla('pv', {
    key: value
});
```

## 事件日志（采集脚本引用时，需添加'.event'）
```shell
_qla('event', {
    key: value
});
```

## 错误日志（采集脚本引用时，需添加'.error'）(采集脚本默认会自动上传js错误日志)
```shell
_qla('error', {
    key: value
});
```


## 曝光日志采集
### 自动采集（采集脚本引用时，需添加'.visible' 以及'.onvisible'）
1.在需要打印点击日志的标签元素中添加class="on-visible"

2.自定义日志参数通过在标签元素中添加以'data-log-'开头的属性字段。

示例：
```shell
    // html部分
    <div class="on-visible"  log-title="标题" log-region="header" log-pos="banner"></div>

    //日志打印时，日志打印参数
    {
        // 公有参数、全局自定义参数
        ...(略)
        ,
        title: '标题',
        region: 'header',
        'pos': 'banner'
    }
```

### 手动采集（采集脚本引用时，需添加'.visible')
```shell
_qla('visible', {
    key1: value1,
    key2: value2
});
```


