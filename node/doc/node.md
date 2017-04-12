# node

Files under  `node` directory run in the main process of Electron.

`doc` directory hosts document files.

`lib` directory hosts all function modules.

There are redux reducers inside `reducers` directory. Most of them are used for historical reason. They are going to be removed or minimized.

主要逻辑

1. 启动mdns，初始化所有的config，从前端控制更新
2. login从前端发起，node暂不关心auto login逻辑
3. 有files和upload/download模块为前端提供弹药
4. 暂时只有imagecache和thumbnail为前端提供弹药，但未来可能需要把metadata逻辑一起放在node一侧，因为可以屏蔽远程逻辑
5. 考虑登出该如何处理

## Modules

`adapter` automatically pass a subset of node-side redux store to browser window. This is going to be examined and all unnecessary logic should be removed. **需检查决定如何处理**

`command` implements command pattern for browser / main rpc (remote procedure call) based on Electron / node IPC. **遥远的未来重构**

Currently, `config` deals with some path related issue. This should be changed by a strict definition of global config, user config, as well as a uniform interface for retrieving file paths. **需要写**

`files` implements server-side file API encapsulation. It is necessary mainly for two reasons:

1. providing a unified interface to browser for both local access and remote access.
2. performance optimization.

This module is going to be heavily rewritten and refactoring. **需要仔细设计**

`mdns` is refactored and greatly simplified comparing to previous version. However, whether an ip address scanning is required or not is undetermined. **基本上OK**

`server` module encapsulates all (fruitmix) server apis. **修复broken**

`system` module encapsulates certain system api for mkfs, installing, initialization etc. No it is deprecated. Those functionality is implemented in browser. **计划删除**

`misc` implements a few ipc without using any command. It is going to be changed. **考虑ipc模块**

`util` has some utility and algorithm functions. **暂时不管了**

`window` is responsible for creating browser windows. **Bug Fix**

`reducers` and `store` **和adapter一样处理**



## redux store##









* ## app.js

  ### 作为node的如口文件功能如下
  1. 启动node服务，初始化所有API
  2. 初始化 *mdns()* 查找
  3. 初始化并打开electron窗口


* ## lib
### 1. window.js 可以通过调用 *electron* 的方法创建新的窗口，并向外部提供 *initMainWindow* 和 *getMainWindow* 两个组件。
 ### 2. command.js 通过 *electron* 中的 *ipcMain.on()* 的方法来接收处理前端传来的参数 *(evd , ip ,op)* ，并向外提供一个 *registerCommandHandlers* 组件。
 ### 3. adapter.js 在 *store* 更新后被触发，将更新后的新的store抛到前端。
 ### 4. download.js 提供下载功能。
        1)  addToRunningQueue() 将下载任务添加到下载队列
        2)  removeOutOfRunningQueue() 将正在下载的任务移出队列
        3)  addToReadyQueue() 将任务添加到准备对列
        4)  removeOutOfReadyQueue() 将下载任务移出准备队列
        5)  createUserTask() 创建用户任务
        6)  userTask() 用户任务，获取下载路径
        7)  createFileDownloadTask() 创建文件下载任务
        8)  fileDownloadTask() 处理下载文件的状态、路径、下载结果等信息
        9)  createFolderDownloadTask() 创建文件夹下载任务
        10) folderDownloadTask() 处理下载文件夹的状态、路径、下载结果等信息
        11) downloadHandle() 区分文件和文件夹并向窗口发送下载数量信息

 ### 5. upload.js 提供上传功能
        1) addToRunningQueue() 添加上传任务到上传对列
        2)  removeOutOfRunningQueue() 将正在下载的任务移出队列
        3)  addToReadyQueue() 将任务添加到准备对列
        4)  removeOutOfReadyQueue() 将准备任务移出
        5)  addToHashingQueue()(只针对文件)
        6)  addHashlessQueue() (只针对文件)
        7)  removeOutOfHashlessQueue()
        8)  userTask() 用户任务
        9)  createUserTask() 创建用户任务
        10) sendUploadMessage() 发送文件上传的数量信息
        11) folderStats() 读取文件夹路径
        12) hashFile() 获取文件的hash值
        13) createFileUploadTask() 创建文件上传任务
        14) fileUploadTask() 处理上传文件的状态、路径、上传结果等信息
        15) createFolderUploadTask() 创建文件夹上传任务
        16) fileUploadTask() 处理上传文件夹的状态、路径、上传结果等
        17）uploadHandle() 向前端发送上传文件夹的数量信息
        18) dragFileHandle() 向前端发送上传文件的数量信息

 ### 6. file.js 通过sever中的一些方法来创建和更新本地的文件树，提供文件的增删改和分享功能。向外部提供一个 *resetData*
 ### 7. login.js (已不用) 提供了搜索，更新用户和验证账户密码的功能
 ### 8. mdns.js 用mdns方法查找设备，提供设备信息（name , ip , ...) 和存储设备使用的详细信息
 ### 9. media.js 用来处理媒文件。提供照片的缩略图、大图浏览，图片下载，创建相册，图片分享的功能
 ### 10. migration.js 给老用户提供了一个数据迁移功能
 ### 11. misc.js 提供更改下载路径 、创建 *3000* 和 *3001* 窗口的功能
 ### 12. server.js 给上传、下载、图片等提供一些服务      
 ### 13. system.js 给磁盘卷操作提供了一个API
 ### 14. trash.js (没用)
 ### 14. util.js 是一个工具文件，向外提供了 *quickSort()* 和 *getTreeCount()* 两个方法
 ### 16. config.js 对node stream的配置
 ### 17. testFolderStats.js (已不用)一个拓展的测试文件
 ### 18. testHook.js (?)
 ### 19. filehash.js (空)
 ### 20. async.js (已不用)


*  ## server

  1) action 提供数据结构
  2）reducers 用来处理action改变state
  3）store 创建一个store管理state
