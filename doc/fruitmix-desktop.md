**copyright 上海闻上科技 (wisnuc) 2014-2017**

___

# Fruitmix-Desktop 软件设计

**作者**

* 刘华 李新炜

**版本**

* 2017-5-3 草稿（刘华）
* 2017-5-31 添加设计逻辑和源码详解（李新炜）
* 2017-6-12 添加api与状态机模型（李新炜）

**目录**

[TOC]

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

## 前端架构设计

### UML

![UML](UML.png)

* components

    * Login: 用户登录界面

    * Maintenance: 维护模式页面

    * User: 用户登录成功后的使用界面。该部分采用MVVM的架构，即Model-View-ViewModel，View绑定到ViewModel，通过ViewModel来控制View。ViewModel跟Model通讯，告诉它更新来响应UI。

        * Model: 管理api，分发数据

        * ViewModel: 处理单个View所需要的数据与操作

        * View: 呈现具体的用户界面

* interface

    * mdns: 搜索局域网内的设备信息，如ip，用户列表等

    * device api: 包括3000端口system部分api，及3721端口与登录或应用初始化相关的api

    * fruitmix api: 3721端口的api，如File APIs、Media APIs等

    * node: 通过ipcRenderer与node通讯，获取本地文件，如file、media等

### api与状态机模型

* Device APIs

|Device APIs|systemStatus|start|token|initWizard|refreshSystemState|manualBoot|reInstall|device|net|timedate|fan|setFanScale|power|
| --------- |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
login       | √ | √ | √ |   |   |   |   |   |   |   |   |   |   |
InitWizard  |   |   |   | √ |   |   |   |   |   |   |   |   |   |
maintenance |   |   |   |   | √ | √ | √ |   |   |   |   |   |   |
Device      |   |   |   |   |   |   |   | √ |   |   |   |   |   |
Networking  |   |   |   |   |   |   |   |   | √ |   |   |   |   |
TimeDate    |   |   |   |   |   |   |   |   |   | √ |   |   |   |
FanControl  |   |   |   |   |   |   |   |   |   |   | √ | √ |   |
Power       |   |   |   |   |   |   |   |   |   |   |   |   | √ |

* Fruitmix APIs

|Fruitmix APIs|account|adminDrives|adminUsers|driveListNavDir|listNavDir|login|media|mkdir|renameDirOrFile|updateAccount|extDrives|extListDir|
| --------- |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|home       |   |   |   |   | √ |   |   | √ | √ |   |   |   |
|public     |   | √ |   | √ |   |   |   |   |   |   |   |   |
|physical   |   |   |   |   |   |   |   |   |   |   | √ | √ |
|media      |   |   |   |   |   |   | √ |   |   |   |   |   |
|adminUsers |   |   | √ |   |   | √ |   |   |   |   |   |   |
|adminDrives|   | √ | √ |   |   |   |   |   |   |   |   |   |
|account    | √ |   |   |   |   | √ |   |   |   | √ |   |   |


* ipcRenderer.send

LOGIN
LOGIN_OFF
LOGIN_OUT

mediaHideImage
mediaHideThumb
mediaShowImage
mediaShowThumb

START_TRANSMISSION
GET_TRANSMISSION
OPEN_TRANSMISSION

UPLOAD
DOWNLOAD
PAUSE_UPLOADING
RESUME_UPLOADING
PAUSE_DOWNLOADING
RESUME_DOWNLOADING
DELETE_DOWNLOADING
DELETE_UPLOADING

TRANSFER
CLEAN_RECORD
DRAG_FILE
newWebWindow

* ipcRenderer.on

CONFIG_LOADED
MDNS_UPDATE
UPDATE_TRANSMISSION
snackbarMessage
getThumbSuccess
donwloadMediaSuccess
driveListUpdate
physicalListUpdate

#### login

* mdns api: 获取局域网内的设备列表，其数据结构为

```js
[
    {
        name,
            domain,
            host,
            model,
            serial,
            address
        },
        ...
]
```

* device api

    * systemStatus: 获取设备的状态信息

    * start: 获取设备和系统状态，包括：

        * device: 获取目前系统状态
        * boot: 获取wisnuc fruitmix的启动状态信息
        * storage: 获取设备的存储信息
        * users: 获取当前设备的用户列表

    * token: 根据用户名和密码获取用户token，登陆账户

* device、boot、storage、users的数据结构

```js
device:{
    boot: [Object],
        device: [Object],
     mdev: [Object],
        storage: [Object],
        token: [Object],
        users: [Object]
}

boot: {
    bootMode,
    currentFileSystem: [Object],
    fruitmix: [Object],
    lastFileSystem: [Object],
    state
}

storage: {
    blocks: [Array],
    ports: [Array],
    volumes: [Array]
}

users: [
    {
        avatar,
        unixUID,
        username,
        uuid
    },
    ...
]
```

* ipc通讯

    * newWebWindow: 新开窗口，目前是新开固件管理页面
    * LOGIN: 发送给node端登录信息，包括当前设备和用户信息（device、user）

* state

    * selectedDevice: null, 显示InfoCard，表示正在通过mdns搜索设备

    * selectedDevice: new Device(mdev), 获取到了设备信息及状态（ systemStatus），显示DeviceCard

        * status: 'busy', 连接未建立，通讯中

            * systemStatus: 'probing'

        * status: 'initWizard', 初次启动的状态，将进入初始化页面 -> `InitWizard`

            * systemStatus: 'uninitialized'

        * status: 'ready', deviece api、fruitmix api均获取正常，正常的登录模式

            * systemStatus: 'ready'

                * token: 需要uuid和password来获取token，成功登录后 -> `user`

        * status: 'maintenance', 系统出错，或用户指定进入维护模式的状态 -> `maintenance`

            * systemStatus: 'userMaint', 用户指定进入维护模式
            * systemStatus: 'failLast', 未能启动上次使用的系统
            * systemStatus: 'failMulti', 存在多个可用系统
            * systemStatus: 'failNoAlt', 未能发现可用系统
            * systemStatus: 'unknownMaint', 未知错误

        * status: 'connnect error', 连接出错

            * systemStatus: 'systemError', 无法与该设备通讯, 3000端口连接异常
            * systemStatus: 'fruitmixError', 系统启动但应用服务无法连接，3721端口连接异常

#### InitWizard

* device api

    * initWizard: 发送初始化设备的请求，并不断请求目前系统状态包括：

        * mkfs: 获取创建brtfs文件系统的状态
        * storage: 获取设备的存储信息
        * install: 获取安装wisnuc fruitmix的状态
        * boot: 获取wisnuc fruitmix的启动状态信息
        * users: 获取当前设备的用户列表
        * firstUser: 获取第一用户的信息
        * token: 根据用户名和密码获取用户token，登陆账户

* state

    * step: 'CreatingVolume', 创建磁盘卷

        * volumeselect: 将要被格式化为btrfs文件系统并作为wisnuc系统盘的磁盘

    * step: 'UsernamePassword', 输入初始用户名和密码

        * userpass: 初始用户的用户名和密码

    * step: 'Confirmation', 确认内容，将调用initWizard api

    * step: 'installing', 安装中，不断请求目前系统状态

    * step: 'finished', 完成 -> `user`


#### maintenance

* device api

    * refreshSystemState: 获取和刷新storage和boot信息
    * manualBoot: 手动启动wisnuc
    * reInstall: 重新安装wisnuc，并不断返回安装状态，包括：

        * install: 获取wisnuc安装进度
        * boot: 获取wisnuc启动状态
        * users: 获取用户信息列表
        * firstUser: 获取第一个用户的信息

* storage和boot的数据结构

```js
boot
{
    bootMode,
    currentFileSystem: [Object],
    fruitmix: [Object],
    lastFileSystem: [Object],
    state
}

storage
{
    blocks: [Array],
    ports: [Array],
    volumes: [
        {
            fileSystemType
            fileSystemUUID,
            isBtrfs,
            isFileSystem,
            isMissing,
            isMounted,
            isVolume,
            label,
            missing,
            false,
            mountpoint,
            total,
            usage: [Object],
            used,
            uuid,
            wisnuc: {
                status,
                users: [Array]
            }
        },
        ...
    ]
}
```

* state

    * expanded: true, 显示隐藏内容
    * creatingNewVolume: true, 进入创建磁盘阵列的模式
    * initVolume: true, 打开安装wisnuc的窗口
    * disk type: 磁盘类型，不同的类型有不同的view

        * 'BtrfsVolume', 安装了Btrfs文件系统的磁盘，可以安装wisnuc
        * 'FileSystemUsageDisk', 安装了其它文件系统的磁盘
        * 'NoUsageDisk', 未使用的磁盘，可以格式化为btrfs
        * 'PartitionedDisk', 含有分区的磁盘

    * error type: 系统状态包括错误信息

        * 'ENOENT': WISNUC未安装
        * 'EDATA': WISNUC未正确安装，用户信息未找到或不能正确解析
        * 'EFAIL': WISNUC无法正常启动
        * 'READY': WISNUC已安装，但用户可能为空

#### user

* fruitmix api

    * start: 登录成功后初始请求数据，包括：

        * account: 获取用户信息
        * listNavDir: 获取根目录文件列表信息
        * adminUsers: 对于admin用户，获取所有用户的详细信息
        * adminDrives: 对于admin用户，获取共享盘信息
        * users: 普通用户获取所有用户信息
        * drives: 普通用户获取共享盘信息
        * fileShare: 获取文件分享信息
        * mediaShare: 获取照片分享信息
        * media: 获取照片的metadata

* state:

    * views: 各个模块的视图，包括：

        * home: 我的文件
        * public: 共享文件夹
        * physical: 物理磁盘
        * transmission: 文件传输
        * media: 我的照片
        * adminUsers: 用户管理
        * adminDrives: 共享文件夹管理
        * device: 设备信息
        * net: 网络设置
        * timeDate: 时间与日期
        * power: 重启和关机
        * account: 我的账户

    * openDrawer: 显示左侧菜单栏

    * showDetail: 显示右侧详细内容的页面

    * snackBar: 显示server或node端返回的消息

##### home

* fruitmix api

    * listNavDir: 获取当前页面的项目列表及上级目录
    * mkdir: 新建文件夹
    * renameDirOrFile: 重命名文件或文件夹

* listNavDir的数据格式：

```js
{
    entries: [
        {
            digest,
            metadata: [Object],
            mtime,
            name,
            size,
            type,
            uuid
        },
        ...
    ]
    path: [
        {
            mtime,
            name,
            type,
            uuid
        },
        ...
    ]
}
```

* ipc通讯

    * mediaShowThumb: 发出缩略图的请求
    * mediaHideThumb: 取消缩略图的请求
    * getThumbSuccess: 接收缩略图所在路径
    * command: fileapp: UPLOAD, 上传文件或文件夹
    * command: fileapp: DOWNLOAD, 下载选中的文件或文件夹
    * command: fileapp: TRANSFER, 记录传输文件拷贝或移动

* state

    * upload: 上传文件或文件夹
    * selected: 处理选中的项目
    * showMemu: 打开右键菜单
        * createNewFolder: 新建文件夹
        * download: 下载项目
        * delete: 删除项目
        * rename: 重命名项目
        * move: 移动项目
        * copy: 拷贝项目

* persistence

    * path: 保存当前页面的路径
    * entries: 保存当前文件列表
    * detailFile: 保存显示详细信息的文件的位置

##### public

* fruitmix api

    * adminDrives: 获取共享盘列表
    * driveListNavDir: 获取共享盘内页面的项目列表及上级目录

* adminDrives和driveListNavDir的数据结构

```js
adminDrives
[
    {
        label,
        readlist: [],
        shareAllowed,
        type,
        uuid,
        writelist: [],
    },
    ...
]

driveListNavDir
{
    entries: [
        {
            digest,
            metadata: [Object],
            mtime,
            name,
            size,
            type,
            uuid
        },
        ...
    ]
    path: [
        {
            mtime,
            name,
            type,
            uuid
        },
        ...
    ]
}
```
* ipc通讯：同Home

* state

    * upload: 上传文件或文件夹

    * selected: 处理选中的项目

    * showMemu: 打开右键菜单
        * createNewFolder: 新建文件夹
        * download: 下载项目
        * delete: 删除项目
        * rename: 重命名项目
        * move: 移动项目
        * copy: 拷贝项目

##### physical

* fruitmix api

    * extDrives: 获取物理磁盘列表
    * extListDir: 获取物理磁盘内的项目列表及上级目录

* extDrives和extListDir的数据结构

```js
extDrives
[
    {
        devname,
        fileSystemType,
        fileSystemUUID,
        fsUsageDefined,
        idBus,
        idFsUsage,
        isATA,
        isExt4,
        isFileSystem,
        isMounted,
        isPartition,
        isRootFS,
        mountpoint,
        name,
        parentName,
        path,
        removable,
        size,
        type,
        unformattable: [Object]
    },
    ...
]

extListDir
[
    {
        mtime,
        name,
        size,
        type: "directory"
    },
    ...
]

```

* ipc通讯：无上传，其他同Home

* state

    * selected: 处理选中的项目

    * showMemu: 打开右键菜单
        * move: 移动项目
        * copy: 拷贝项目

##### transmission

* ipc通讯

    * PAUSE_DOWNLOADING: 暂停下载项目

    * RESUME_DOWNLOADING: 重新启动暂定的下载项目

    * PAUSE_UPLOADING: 暂停上传项目

    * RESUME_UPLOADING: 重新启动暂定的上传项目

    * DELETE_UPLOADING: 取消上传项目

    * DELETE_DOWNLOADING: 取消下载项目

    * OPEN_TRANSMISSION: 打开项目所在文件夹

    * GET_TRANSMISSION: 发送获取transmission列表的请求

    * UPDATE_TRANSMISSION: 获取transmission列表

        * userTasks: 进行中的任务
        * finishTasks: 已完成的任务

* userTasks和finishTasks的数据结构

```js
userTasks
[
    {
        abspath,
        completeSize,
        count,
        finishCount,
        finishDate,
        name,
        pause,
        record: [Array],
        restTime,
        size,
        speed,
        state,
        trsType,
        type,
        uuid
    },
    ...
]
finishTasks
[
    {
        _id,
        abspath,
        createTime,
        finishDate: [Array],
        name,
        target,
        trsType,
        type,
        uploading: [Array],
        uuid
    },
    ...
]
```

* state

    * selected: 处理选中的项目

    * showMemu: 打开右键菜单

    * pause: 暂停上传或下载项目
    * resume: 运行上传或下载项目
    * delete: 取消上传或下载项目
    * openFolder: 打开项目所在本地目录

##### Media

* fruitmix api

    * media: 获取照片metadata

* metadata的数据结构

```js
[
    [
        digest,
        {
            metadata: {
                exifDateTime,
                exifMake,
                exifModel,
                exifOrientation,
                format,
                height,
                size,
                width
            },
            permittedToShare
        }
    ],
    ...
]
```

* ipc通讯: 与node通讯，获取照片的缩略图和原图

    * mediaShowThumb: 发出缩略图的请求
    * mediaHideThumb: 取消缩略图的请求
    * getThumbSuccess: 接收缩略图所在路径
    * mediaShowImage: 发出原图的请求
    * mediaHideImage:取消原图的请求
    * donwloadMediaSuccess: 接收原图所在路径

* state

    * openDetail: false, 仅显示图片列表

        * showTimeline, 显示时间轴

    * openDetail: true, 切换查看大图

        * direction, 左右切换图片
        * thumbPath, 缩略图的路径，不为空时，显示缩略图
        * detailPath, 原图的路径，不为空时，显示原图

* persistence

    * currentDigest: 保存当前选中照片的digest
    * currentScrollTop: 保存当前滚动条的位置

##### Account

* fruitmix api

    * account: 获取用户信息
    * login: 获取所有用户列表，用于修改用户名时防重复
    * updateAccount: 更新用户的用户名或密码

* account的数据结构

```js
{
    avatar
    email
    friends: [],
    home
    isAdmin
    isFirstUser
    lastChangeTime
    library
    nologin
    password
    service
    smbPassword
    type
    unixPassword
    unixuid
    username
    uuid
}
```

* state

    * openDialog: '', 仅显示用户信息
    * openDialog: 'username', 显示更改用户名对话框
    * openDialog: 'password', 显示更改密码的对话框


##### AdminUsers

* fruitmix api

    * adminUsers: 获取仅admin用户可见的完整的用户信息列表
    * login: 获取所有用户列表，用于创建新用户时防重复

* adminUsers的数据结构

```js
[
    {
        avatar
        email
        friends: [],
        home
        isAdmin
        isFirstUser
        lastChangeTime
        library
        nologin
        password
        service
        smbPassword
        type
        unixPassword
        unixuid
        username
        uuid
        },
        ...
]
```

* state

    * createNewUser: false, 仅显示现有用户列表
    * createNewUser: true, 显示创建新用户的对话框

##### AdminDrives

* fruitmix api

    * adminUsers: 获取仅admin用户可见的完整的用户信息列表
    * adminDrives: 获取共享盘信息

* adminDrives的数据结构

```js
[
    {
        label,
        readlist: [],
        shareAllowed,
        type,
        uuid,
        writelist: [],
    },
    ...
]
```

* state

    * contextMenuOpen: true, 显示右键菜单
    * newDrive: true, 打开新建共享盘的对话框

##### Device

* device api

    * device: 获取设备信息

* device的数据结构

```js
{
    commit: {}
    cpuInfo: [
        {
            length,
            modelName,
            cacheSize,
            ...
        },
        ...
    ],
    dmidecode: {},
    memInfo: {
        memTotal,
        memFree,
        memAvailable,
        ...
    },
    release: {}
}
```

* state: null

##### Networking

* device api

    * net: 获取网络信息

* net的数据结构

```js
{
    os: {
        [network interface card name]: [
            {
                address,
                family: 'IPv4',
                internal,
                mac,
                netmask
            },
            ...
        ],
        lo: {}
    },
    sysfs: []
}
```

* state: null

##### TimeDate

* device api

    *    timedate: 获取日期与时间信息

* timedate的数据结构

```js
{
    ObjectLocal time,
    NTP synchronized,
    Network time on,
    RTC in local TZ,
    RTC time,
    Time zone,
    Universal time
}
```

* state: null

##### FanControl

* device api

    * fan: 获取风扇信息
    * setFanScale: 调节风扇转速

* fan的数据结构

```js
{
    fanScale,
    fanSpeed
}
```

* state

    * fanScale: 由api获取的风扇速度等级的值，可手动调节
    * fanSpeed: 由api获取的风扇速度的值

##### Power

* device api

    * power: 对设备进行电源相关的管理

* ipc 通讯

    * LOGIN_OFF: 向node端发出登出的信息，主要是处理transmission相关任务

* state

    * operation: '', 默认状态，不显示对话框
    * operation: 'confirm', 打开确认操作的对话框
    * operation: 'progress', 打开表示重启中的对话框
    * operation: 'done', 打开表示操作完成的对话框
    * choice: '', 默认状态，用于表示操作的类型，operation变为'confirm'的同时会对choice赋值
    * choice: 'POWEROFF', 关机
    * choice: 'REBOOT', 重启设备
    * choice: 'REBOOTMAINTENANCE', 重启设备并进入维护模式

## 前端业务逻辑

主要包括三部分的页面，即Login、Maintenance、User页面。

### Login

默认启动时会进入login页面。此时系统会进行搜素设备的过程。用户可以在搜索到的不同设备间切换选择。设备可以有多种状态，包括：

* 未初始化：第一次启动的设备会显示为未初始化，可进入初始化界面，选择磁盘并建立账户和设置密码

* 正常启动：正常的状态，可以选择特定用户，输入正确密码后登录进应用，页面切换为user页面

* 以维护模式启动：用户可点击进入维护模式，页面切换为Maintenance页面

* 设备已搜索到，但出现错误：目前只能等待或重启

* 自动登陆：自动登陆上次登陆的设备，功能尚未实现

### Maintenance

维护模式页面，主要显示当前设备的磁盘阵列信息及其他磁盘信息，可进行新建磁盘阵列、启动应用、安装/重新安装应用、回到login页面等操作

* 新建磁盘阵列: 选择磁盘建立磁盘阵列用于安装wisnuc，可以选择single、raid0、raid1等多种模式，该操作会格式化磁盘为Btrfs文件系统

* 启动应用: 当应用已安装且没有检测到错误时，会显示启动应用的按钮，启动成功后可回到login页面进行登录

* 安装/重新安装应用: 对于文件系统格式为Btrfs的磁盘，可进行安装wisnuc。对于已安装wisnuc的磁盘可重新安装（目前禁用）

* 回到login页面: 页面切换到login页面

### User

用户使用界面组成包括AppBar、QuickNav、content、Detail、NavDrawer、snackBar等

**AppBar**

顶部菜单栏和工具栏

**NavDrawer**

左侧导航菜单栏，包括顶部的avatar、用户名、设备序列号、各个导航菜单及退出按钮。

**QuickNav**

快速导航栏，包括当前group的所有页面导航，但group内仅一个页面时不显示

**Detail**

右侧可弹出的detail页面

**snackBar**

全局消息显示，主要是与服务器通讯后的成功或失败信息

**content**

主要内容页面，可以是以下页面之一，默认为`我的文件`页面

* file: 文件部分，包括

    * 我的文件
    * 共享文件夹
    * 物理磁盘
    * 文件传输

* media: 媒体部分，包括

    * 我的照片

* settings: admin用户的管理页面，普通用户该部分不展示

    * 用户管理
    * 共享文件夹管理
    * 设备信息
    * 网络设置
    * 时间与日期
    * 重启和关机

* others: 其他页面，包括

    * 我的账户

## 前端源码详解（src/app/）

### app.js

初始化页面、引入样式、挂载react根组件以及一些初始化工作，调用Fruitmix.jsx

### Fruitmix.jsx

顶层React页面，根据当前状态选择渲染login、Maintenance或Navigation页面。主要函数包括：

* setPalette: 定义字体、primary color、accent color
* selectDevice: 选择设备并加载设备信息，调用./common/device
* nav: 跳转页面
* maintain: 跳转至maintenance页面
* login: 跳转至Navigation页面，即登陆成功后的页面

### login

登陆页面

* Login.jsx: 登陆页面的入口，搭建整体页面

* CrossNavcd.jsx: 处理切换设备时的动画

* InfoCard.jsx: 渲染尚未发现设备时的等待页面

* ErrorBox.jsx: 渲染系统错误信息

* ModelNameCard.jsx: 设备信息界面，包括设备图标、名称、序列号等

* Barcelona.jsx: ws215i的logo

* Computer.jsx: 计算机logo

* HoverNav.jsx: 左右切换的按钮

* UserBox.jsx: 渲染罗列用户的Box

* LoginBox.jsx: 渲染登录框，包括输入密码等操作

* InitStep.jsx: 初始化页面，调用UsernamePassword和CreatingVolumeDiskSelection

* UsernamePassword.jsx: 输入用户名、密码的对话框

* CreatingVolumeDiskSelection.jsx: 创建磁盘阵列的信息框

### nav

页面框架及数据分发，亦即model部分

* Navigation.jsx: 渲染用户登入系统后的页面框架，根据view model 中各函数返回值渲染页面，包括

    * AppBar: 渲染顶部菜单栏和工具栏
    * QuickNav: 渲染左侧快速导航栏，调用QuickNav.jsx
    * content: 渲染主要内容的部分，调用view.renderContent
    * Detail: 右侧可弹出的detail页面，由view.renderDetail渲染
    * NavDrawer: 左侧导航菜单栏，调用NavDrawer.jsx
    * snackBar: 全局消息显示，主要是与服务器通讯后的成功或失败信息

* NavDrawer.jsx: 渲染左边菜单栏，包括顶部的avatar、用户名、设备序列号及各个导航菜单。主要函数和组件有：

    * class MenuItem: 渲染每个导航菜单的基本组件
    * class SubHeader: 渲染小标题
    * function renderGroup： 渲染一组导航菜单，目前包括file、media、settings

* QuickNav.jsx: 渲染快速导航栏

### view

ViewModel 部分

* Base.jsx: 所有model的基类，注意该组件非react组件，定义一些基本的函数，包括：

    * setState: 更新状态的函数，更新时会emit 'update' 信息，由Navigation.jsx接收，触发重新刷新
    * willReceiveProps: 接受Navigation.jsx传递的props，可对props处理，更新state等
    * navEnter: 处理载入页面前的活动
    * navLeave: 处理页面将要离开时的活动
    * navGroup: 定义页面的group，包括file、media、settings、other等
    * groupPrimaryColor: 定义页面group的整体PrimaryColor
    * groupAccentColor: 定义页面group的整体AccentColor
    * menuName: 定义显示的菜单名称
    * menuIcon: 定义显示的图标
    * quickName: 定义快速导航栏显示的菜单名称
    * quickIcon:定义快速导航栏显示的图标
    * appBarStyle: 定义appBar的样式，包括light、colored等
    * appBarColor: 定义appBar的颜色
    * primaryColor:定义PrimaryColor
    * accentColor:定义AccentColor
    * prominent: 定义Header的高度，prominent为true时高度为128，反之为64
    * showQuickNav: 定义是否显示快速导航栏
    * hasDetail: 定义是否有detail页面
    * detailEnabled: detail页面是否可以打开
    * detailWidth: 定义detail页面的宽度
    * renderTitle: 渲染页面的主标题
    * renderNavigationMenu: 渲染导航按钮
    * renderToolBar: 渲染工具栏
    * renderSnackBar: 渲染SnackBar，用于返回信息
    * renderDetail: 渲染detail页面
    * renderContent: 渲染主要的内容页面

* Home.jsx: 首页，也是我的文件页面

* Public.jsx: 共享文件夹

* Physical.jsx: 物理磁盘

* Transmission.jsx: 文件传输

* Media.jsx: 我的照片，处理与传递media的metadata，调用photo/PhotoApp。主要的函数包括

    * memoize: 暂存处理后的photoInfo、浏览位置等数据
    * photoInfo: 对metadate进行处理，计算整个列表的结构、长度等参数，返回给PhotoList
    * timeline: 根据当前列表的内容，计算对应的时间轴上各时间的位置

* Account.jsx: 个人账户管理，传递与更新account信息，调用control/AccountApp

* AdminUsers.jsx: 用户管理，传递与更新adminUsers信息，调用control/AdminUsersApp

* AdminDrives.jsx: 共享盘管理，传递与更新adminDrives与adminUsers信息，对右键菜单的控制也在这里。调用组件包括：

    * control/AdminDriversApp: 显示共享盘列表
    * control/DriversDetail: 显示共享文件盘详细内容，并提供修改功能

* Device.jsx: 设备信息，传递与更新device信息，调用control/DeviceInfo

* Networking.jsx: 网络管理，传递与更新net信息，调用control/NetworkInfo

* TimeDate.jsx: 时间与日期，传递与更新timedate信息，调用control/TimeDateInfo

* FanControl.jsx: 风扇状态与调节，传递与更新fan信息，调用control/Fan

* Power.jsx: 电源管理，传递api，调用control/PowerApp
* FileSharedWithMe.jsx
* FileSharedWithOthers.jsx
* MediaAlbum.jsx
* MediaShare.jsx
* Storage.jsx

### file

文件相关页面

* FileContent.jsx: 文件列表，使用react-virtualized来渲染，需要捕捉鼠标点击及键盘ctrl、shift事件

* FileUploadButton.jsx: 上传文件或文件夹的FAB按钮

* ListSelect.jsx: 处理各种文件被选中的状态

* FileDetai.jsx: 文件详细信息，包括三部分:

    * header: 标题，目前是icon+文件名
    * picture: 缩略图，仅含有metadata的图片文件会展示缩略图
    * data: 信息列表，由renderList渲染，包括类型、大小、位置、修改时间，图片则会加上拍摄时间、拍摄设备、分辨率等信息

* MoveDialog.jsx: 文件移动的对话框

* NewFolderDialog.jsx: 新建文件夹的对话框

* RenameDialog.jsx: 重命名的对话框

* TransmissionContainer.jsx: 渲染文件传输页面，页面主要包括：

    * running task title: 传输中任务部分的标题，包括全部开始、全部暂停、全部取消的操作按钮

    * running task list: 传输中任务列表，调用RunningTask.jsx

    * finished task title: 已完成任务部分的标题，包括全部删除的操作按钮

    * finished task list: 已完成任务列表，调用FinishedTask.jsx，

    * menu: 渲染右键菜单

* RunningTask.jsx: 渲染正在运行中的任务列表

* FinishedTask.jsx: 渲染已完成的任务列表

### photo

照片相关页面

* PhotoApp.jsx: 照片的入口，搭建整体页面，包括:

    * PhotoList: 渲染照片列表，调用PhotoList.jsx
    * Carousel: 轮播页面，目前未使用
    * PhotoDetail: 照片详细页面，调用PhotoDetail.jsx
    * Media Upload: 上传照片组件，目前未使用

* PhotoList.jsx: 渲染照片列表与时间轴，照片列表使用react-virtualized来渲染，数据来源于Media.jsx:photoInfo的结果，调用RenderListByRow。时间轴部分包括了date list、position bar、BarFollowMouse、DateBox等部分。主要函数包括：

    * showDateBar: 显示或隐藏时间轴
    * onScroll: 处理滚动条滚动时的行为，包括计算当前页面对应的日期、页面在时间轴对应位置、显示时间轴等
    * onMouseMove: 处理鼠标移动到时间轴上后的行为，包括改变鼠标图标、选择和跳转页面等
    * renderTimeline: 渲染时间轴组件，调用来自media.jsx:timeline计算的数据，目前使用物理对应的方式计算时间轴上个日期的间隔

* RenderListByRow.jsx: 渲染图片列表的一行，多加这一层主要用于在滚动条滑动时避免重新渲染，调用PhotoItem组件

* PhotoItem.jsx: 渲染一张图片的基本组件，加载时通过ipcRenderer与node通讯获取图片，通讯信息包括

    * mediaShowThumb，发送需要获取的图片的请求
    * mediaHideThumb，取消请求
    * getThumbSuccess，接受成功获取的图片路径

* PhotoDetail.jsx: 渲染图片详细页面，首先加载缩略图，然后加载原图，目前使用ReactTransitionGroup和TweenMax做入场与变化的动画。

    * class PhotoDetail: 对PhotoDetailInline包裹ReactTransitionGroup和RenderToLayer。前者是做入场与变化的动画的需要，后者是将页面提到页面的顶层。
    * class PhotoDetailInline: 主要的渲染组件，渲染了大图（main image）、左右及返回按钮（left Button、right Button、return Button）、遮罩层（overlay）
    * function requestNext: 请求下一张照片的缩略图，记忆当前图片位置
    * function changeIndex: 判断并确定当前照片的index
    * function updatePath: 更新大图
    * function updateThumbPath: 更新缩略图
    * function calcPositon: 计算鼠标位置，根据位置显示或隐藏按钮
    * function calcSize: 根据metadata和页面大小，计算图片应该显示的长度与高度
    * function animation: 添加动画，配合componentWillEnter、componentWillAppear、componentWillLeave等函数使用
    * function handleKeyUp: 处理按键，使用方向键控制选择上一张或下一张图片
    * function renderDetail: 渲染大图的组件，引入EventListener监听按键，由this.state.thumbPath或detailPath控制渲染ThumbImage和DetailImage

### control

用户及设备设置页面

* AccountApp.jsx: 账户设置页面，包括以下部分

    * avatar: 展示头像，目前是固定的icon
    * username及usertype，显示当前用户名及用户类型
    * change username: 修改用户名，调用ChangeAccountDialog
    * change password: 修改密码，调用ChangeAccountDialog

* AdminUsersApp.jsx: 显示当前用户列表，创建新用户，包括以下部分

    * FloatingActionButton & ChangeAccountDialog，创建新用户，调用ChangeAccountDialog.jsx
    * renderUserRow: 渲染用户列表

* ChangeAccountDialog.jsx: 输入和修改用户名、密码的dialog。主要函数包括：

    * fire: 发送创建账户/修改用户名或密码的请求，处理反馈信息
    * updateUsername: 判断用户名是否符合要求
    * updatePassword: 判断密码是否符合要求
    * updatePasswordAgain: 判断再次输入的密码是否符合要求
    * inputOK: 判断总体输入是否合法

* AdminDriversApp.jsx: 显示当前共享盘，创建新共享盘，包括以下部分

    * FloatingActionButton & NewDriveDialog: 创建新共享盘，调用NewDriveDialog.jsx
    * DriveHeader: 渲染列表的标题栏
    * DriveRow: 渲染列表内容

* DriversDetail.jsx: 显示共享文件盘详细内容，并提供修改功能，主要函数包括：

    * fire: 发送修改共享盘名称或用户权限的请求，处理反馈信息
    * updateLabel: 判断共享盘名称是否符合要求
    * togglecheckAll & handleCheck: 处理选择操作

* NewDriveDialog.jsx: 添加新共享盘的dialog，结构上与DriversDetail的类似

* Fan.jsx: 渲染设备风扇的信息，包括马达动力和转速，并提供修改马达动力的功能，主要函数包括：

    * setFanScale: 发送调节马达动力请求
    * increment & decrement: 增减马达动力

* PowerApp.jsx: 渲染电源控制，包括关机、重启、重启并进入维护模式三种操作，主要函数包括：

    * boot: 发送关机或重启的请求，并传递反馈信息至snackbar
    * handleOpen & handleClose 处理打开和关闭确认提示对话框的操作
    * handleStartProgress & handleEndProgress & handleExit 处理打开或退出等待关机/重启页面的页面
    * scanMdns: 通过反复搜索mdns来判断关机/重启状态

* NetworkInfo.jsx: 渲染网络信息，包括网卡名称、地址类型、网络地址、子网掩码、MAC地址等

* DeviceInfo.jsx: 渲染设备信息，包括硬件类型、CPU、内存等

* TimeDateInfo.jsx: 渲染日期和时间信息

### maintenance

维护模式

* Maintenance.jsx: 维护模式的入口，搭建整体页面，调用BtrfsVolume、NewVolumeTop、PartitionedDisk、FileSystemUsageDisk、
NoUsageDisk、RenderTitle等组件。主要的函数包括：

    * reloadBootStorage： 调用props.selectedDevice.refreshSystemState 来刷新storage、boot信息，重置创建新磁盘阵列页面。
    * renderBootStatus： 当设备已经启动时，显示ip、model、serial等信息并隐藏创建新磁盘阵列的按钮

* BtrfsVolume.jsx: 渲染格式为Btrfs的磁盘内容，包括了：

    * startWisnucOnVolume: 启动wisnuc应用
    * renderFinished: 启动过程反馈页面
    * VolumeWisnucError: 调用VolumeWisnucError.jsx，渲染wisnuc的错误信息
    * InitVolumeDialogs: 调用InitVolumeDialogs.jsx，渲染安装或重新安装wisnuc的页面
    * VerticalExpandable: 渲染可折叠的详细磁盘信息内容

* FileSystemUsageDisk.jsx: 渲染检测到非btrfs文件系统的磁盘的内容

* PartitionedDisk.jsx: 渲染存在文件分区的非btrfs磁盘的内容

* NoUsageDisk.jsx: 渲染未发现文件系统或分区表的磁盘的内容

* NewVolumeTop.jsx: 渲染创建磁盘阵列的组件，主要包括

    * RaidModePopover: 模式选择组件
    * renderFinished: 创建过程反馈页面

* InitVolumeDialogs.jsx: 渲染安装或重新安装wisnuc的页面，包括

    * ReinitVolumeConfirm: 重新安装时确认删除
    * UsernamePassword: 输入用户名密码
    * renderFinished: 安装与启动过程反馈页面

* ConstElement.jsx: 一些不变量及公用组件的合集，包括标题、表格、icon等

* RenderTitle.jsx: 渲染页面顶部toolbar的组件，包括title，两个图表及退出按钮

* Svg.jsx: svg图标的合集

* Users.jsx: 渲染用户列表的组件，以Avatar排列用户

* VolumeWisnucError.jsx: 渲染WISNUC出错信息的组件，因为新的api下错误信息有所改变故可能待更新。

### common

一些公用的组件

* mdns.js: 收到ipc的MDNS_UPDATE信息就开始搜索设备，每搜索到一个新设备就更新全局的store

* Checkmark.jsx: 打勾动画

* ContextMenu.jsx: 右键菜单

* BreadCrumb.jsx: 面包渣，渲染文件目录

* validate.jsx: 判断用户名及密码的合法性

* FlatButton.jsx: 修复中文显示问题的material-ui的FlatButton

* motion.js: 定义动画曲线，在login中有使用

* boxShadow.js: 定义阴影参数，在DialogOverlay中有使用

* DialogOverlay.jsx: 自定义的空对话框

* Request.js: 基于EventEmitter的自定义request，可以反馈当前请求的状态

* reqman.js: RequestManager，调度request

* device.js: 使用自定义的Request.js，设备相关api

* fruitmix.js: 使用自定义的Request.js，fruitmix相关api，一般为登陆成功后涉及的api
* Dialogs.jsx
* IconBox.jsx
* keypress.js
* Operation.jsx
* PureDialog.jsx
* PVState.jsx
* TreeTable.jsx

### mdc

一些测试文件

* FlatButton.jsx: 测试FlatButton控件