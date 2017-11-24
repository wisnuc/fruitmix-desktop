# node

**author**

* lixinwei

**version**

* 20171123

### Introduction

Files under  `node` directory run in the main process of Electron, including:

* app.js: entry, load modules

* lib: directory hosts all function modules.

  ├── clientUpdate.js
  ├── configObserver.js
  ├── configuration.js
  ├── db.js
  ├── downloadTransform.js
  ├── filehash.js
  ├── ftp.js
  ├── login.js
  ├── mdns.js
  ├── media.js
  ├── newDownload.js
  ├── newUpload.js
  ├── persistence.js
  ├── server.js
  ├── store.js
  ├── transform.js
  ├── transmissionUpdate.js
  ├── uploadTransform.js
  ├── window.js
  └── xattr.js

### Modules

+ clientUpdate.js

  客户端升级相关，检查和下载更新，调用的组件:

  - ftp.js
  - store.js
  - window.js


+ configObserver.js

  系统配置更新时，同步配置到Browser端，调用的组件:

  - store.js
  - window.js


+ configuration.js

  处理配置文件，包括全局配置和用户配置，调用的组件:

  - persistence.js


+ db.js

  持久化传输列表数据

+ downloadTransform.js

  处理下载文件过程，主要包括readRemote、diff、download、rename四个步骤，调用的组件:

  - transform.js
  - server.js
  - window.js
  - transmissionUpdate.js


+ filehash.js

  将文件切块计算hash及fingerprint值

+ ftp.js

  处理ftp下载

+ login.js

  接受用户登录登出信息，同步node端的数据，更新用户配置文件

+ mdns.js

  进行mdns搜索设备

+ media.js

  处理照片缩略图和原图的下载，调用的组件:

  - store.js
  - server.js
  - window.js


+ newDownload.js

  处理browser发起的下载文件相关请求，调用的组件:

  - store.js
  - window.js
  - server.js
  - downloadTransform.js


+ newUpload.js

  处理browser发起的上传文件相关请求，调用的组件:

  - window.js
  - server.js
  - uploadTransform.js


+ persistence.js

  处理系统和用户配置的持久化

+ server.js

  整合与server相关的api，主要是文件的上传下载，调用的组件:

  - store.js


+ store.js

  存储和更新当前用户的信息、配置文件信息等，调用的组件:

  - db.js


+ transform.js

  管道状态机组件，主要用于上传和下载过程管理

+ transmissionUpdate.js

  处理文件传输列表的更新过程，并同步数据至browser端，调用的组件:

  - store.js
  - server.js
  - window.js


+ uploadTransform.js

  处理上传文件过程，主要包括readDir、mkdir、hash、diff、upload四个步骤，调用的组件:

  - transform.js
  - xattr.js
  - server.js
  - window.js
  - transmissionUpdate.js
  - filehash.js


+ window.js

  设定 `Browser` 窗口的配置，调用的组件:

  - transmissionUpdate.js
  - store.js


+ xattr.js

  读取和存储xattr数据, windows下用alternative data stream代替xattr

** END **
