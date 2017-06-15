# Fruitmix-Desktop 软件说明

## 使用说明

### 安装依赖

* 安装nodejs（由于前端的一些工具是构建在node.js 之上，请确保 已经安装了node.js 和 npm。可以去 <http://nodejs.org/download/> 下载）
* 安装项目依赖包 ，运行npm install（需要一段时间，可能需要翻墙）

### 常用操作及命令

* 打包后端代码: npm run build
* 开发项目 : npm run webpack,  新开终端 npm run devel
* 开启node端有debug输出的调试模式: DEBUG=\* npm run devel
* 清除热替换产生的缓存: grunt clean
* 更多命令见package.json

## 项目结构

* dbCache : 数据库文件存放目录

* doc : 项目文档目录

* media : 缩略图 原图存放目录

* node : 后端源代码目录

    * lib : electron 相关模块
    * serve : electron redux存放目录（store, action, reducers）

* node_modules : 存放项目依赖包（工具相关）

* public : 前端资源文件目录

    * assets : 存放资源文件（css, images, font)
    * bundle.js : 前端打包输出

* src : 前端源代码目录

    * app
        * app.js: js入口, 定义debug关键字 , 挂载组件, 事件监听
        * Fruitmix.jsx: 顶层React页面
        * common: 通用组件
        * control: admin用户管理相关页面
        * file: 文件页面
        * login: 登录页面
        * maintenance: 维护模式
        * mdc: 测试文件
        * nav: model
        * photo: 照片
        * view: viewmodel
    * assets : 组件相关样式、图片
    * index.html : 前端页面入口

* test: 模块单元测试目录

* .babelrc : babel工具配置文件

* devel.js : 开发环境使用的入口文件

* Gruntfile.js : grunt 配置文件 [详细说明](https://gruntjs.com/sample-gruntfile)

* package.json : 配置项目依赖及命令 [详细说明](https://docs.npmjs.com/files/package.json)

* webpack.config.js : webpack配置文件 [详细说明](https://webpack.js.org/concepts/)
