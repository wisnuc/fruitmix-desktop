# Hello World : 



## 项目结构
>
### src : 是前端源代码根目录
* app ：项目源代码目录。
* assets ：资源文件目录(css,images)。
* index.html ：首页文件
>
### dist : 压缩，合并后的代码，发布到生产环境中的代码；运行 grunt build 命令会自动生成，无需手动更改此文件夹。

>
### node_modules : 存放node.js依赖包(工具相关)，通过在 package.json 中配置依赖，运行 npm install 自动下载相应包，无需手动更改此文件夹。



## 文件说明
>
* package.json ：node 模块的配置文件， 通常用来 配置 node.js依赖包，所有有node.js插件依赖在此文件配置。[详细说明](https://docs.npmjs.com/files/package.json)
* Gruntfile.js ：编写的 grunt task 文件，定义了 如何用 grunt 压缩、合并、混淆代码的 任务。[详细说明](http://gruntjs.com/sample-gruntfile)
* webpack.config.js  ：webpack 开发环境配置。[详细说明](http://webpack.github.io/docs/configuration.html)
* webpack.dist.config.js ：webpack 生产环境配置。[详细说明](http://webpack.github.io/docs/configuration.html)



## 使用说明
>
### 第一次使用操作
1. 安装 node.js。（由于前端的一些工具是构建在node.js 之上，请确保 已经安装了node.js 和 npm。没有可以去 <http://nodejs.org/download/> 下载）
2. 安装 webpack、grunt工具。运行命令：npm install webpack -g && npm install grunt -g
3. 安装 npm相关的包。运行命令：npm install
4. 至此，我们所有的工具、及 包都安装成功，以后不需要进行第1、2步了。可以运行下面相应的命令。

>
### 常用操作及其命令
* 安装npm相应包 : npm install , npm install --save name
* 编译项目 : grunt build
* 开发项目 : sudo webpack --watch   新开终端 npm start
* 查看生产环境项目 : grunt connect



## src 源码详解
>
* app ：react项目主目录。
* assets ：存放资源文件，比如 ：css、fonts、images 等等。
* index.html ：首页，定义html结构。
* app/app.js ：项目主组件，引入其他组件，做一些路由配置、初始化操作。
* app/components ：存放各模块的组件代码。按业务模块划分，建相应模块的文件夹。