# node功能文档

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


 * ## server

  1) action 提供数据结构
  2）reducers 用来处理action改变state
  3）store 创建一个store管理state
