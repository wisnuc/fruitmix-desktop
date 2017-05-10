**copyright 上海闻上科技 (wisnuc) 2014-2017**

___

# Fruitmix-Desktop 软件规范

**作者**

* 刘华

**版本**

* 2017-5-3 草稿（刘华）

## 项目结构

**dbCache : 数据库文件存放目录**

**doc : 项目文档目录**

**media : 缩略图 原图存放目录**

**node : 后端源代码目录**

* lib : electron 相关模块
* serve : electron redux存放目录（store, action, reducers）

**node_modules : 存放项目依赖包（工具相关）**

**public :  前端资源文件目录,**

* assets : 存放资源文件（css, images, font)
* bundle.js : 前端打包输出

**src : 前端源代码目录**

* app
  * action : redux相关action
  * components : react组件
  * lib : 组件相关依赖
  * reducers : redux 相关 reducer
  * stores : 创建redux store
  * utils : 各类封装的function
  * app.js : js入口, 定义debug关键字 , 调用fruitmix.js
  * fruitmix.js : 挂载组件, 事件监听
* assets : 组件相关样式、图片 
* index.html : 前端页面入口

**test: 模块单元测试目录**

**.babelrc : babel工具配置文件**

**devel.js :  开发环境使用的入口文件**

**Gruntfile.js :  grunt 配置文件** [详细说明](https://gruntjs.com/sample-gruntfile)

**package.json : 配置项目依赖及命令** [详细说明](https://docs.npmjs.com/files/package.json)

**webpack.config.js : webpack配置文件** [详细说明](https://webpack.js.org/concepts/)



## 使用说明

**安装依赖**

* 安装nodejs ，webpack
* 安装 项目依赖包 ，运行npm install

**常用操作及命令**

* 打包前端代码 : webpack
* 打包前端代码 (开发环境) : webpack --watch
* 打包后端代码 : npm run build
* 运行项目(开发环境) : npm run devel
* 清除热替换产生的缓存 : grunt clean



## 前端源码详解

### 相关模块

#### class MDNS



### 入口文件

#### app.js

app.js 引入了真正的入口文件，他的作用是定义的调试模块（debug）的输出结果

```javascript
localStorage.debug = 'component:*' 
```



#### fruitmix.js

fruitmix负责初始化页面、引入样式、挂载react根组件以及一些初始化工作

​	









































