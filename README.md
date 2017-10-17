# Fruitmix-Desktop 软件说明

### 部署命令

```
sudo apt-get install git
sudo apt-get install npm
sudo npm install -g n
sudo n latest
node -v
git clone https://github.com/wisnuc/fruitmix-desktop.git
cd fruitmix-desktop
npm install --registry=https://registry.npm.taobao.org
npm run rebuild || ./node_modules/.bin/electron-rebuild -e '~/fruitmix-desktop/node_modules/electron/dist' -v 1.7.9
npm run webpack2
npm run build
npm start
```

### 常用操作及命令

```
npm run webpack                     // 热替换打包文件
npm run devel                       // 开发模式启动，文件变化时自动重启
DEBUG='node:lib:*' npm run devel    // node端有debug输出的调试模式
```

* 更多命令见package.json

### 项目结构

* doc : 项目文档目录

* node : 后端源代码目录

    * lib : electron 相关模块
    * app.js : node 端入口

* node\_modules : 存放项目依赖包（工具相关）

* public : 前端资源文件目录

    * assets : 存放资源文件（css, images, font)
    * bundle.js : 前端打包输出

* src : 前端源代码目录

    * app.js: js入口, 定义debug关键字 , 挂载组件, 事件监听
    * Fruitmix.jsx: 顶层React页面
    * common: 通用组件
    * control: admin用户管理相关页面
    * file: 文件页面
    * login: 登录页面
    * maintenance: 维护模式
    * nav: model
    * photo: 照片
    * view: viewmodel

* .babelrc : babel工具配置文件

* devel.js : 开发环境使用的入口文件

* package.json : 配置项目依赖及命令 [详细说明](https://docs.npmjs.com/files/package.json)

* webpack.config.js : webpack配置文件 [详细说明](https://webpack.js.org/concepts/)
