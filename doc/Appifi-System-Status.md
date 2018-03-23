# Appifi System Status

### APIs

`boot`, `storage` and `users` are required to get the status of appifi system.

```
boot: get('http://${address}:3000/boot`)
storage: get('http://${address}:3000/storage`)
users: get(`http://${address}:3000/users`)
```

#### boot

Boot is a process to choose a file system (btrfs volume) as the backing file system and starts all applications.

Boot encapsulates the following information and states into a resource singleton.

+ user boot configuration
+ system boot state
+ file system currently used by applications if system boots successfully, or error code if system fails to boot.

It has the following properties:

+ mode is a persistent user configuration. When set to normal, boot module will try to find a usable file system and start applications automatically. When set to maintenance, boot module won’t start applications. This is equivalent to the so-called safe mode
+ last is a read-only configuration. It is updated automatically each time a file system is selected as the backing file system to start applications.
+ state is the boot module’s state. It may be starting, started, stopping. It has nothing to do with the state of applications.
+ current and error. They works like the node callback arguments (err, data). When boot module tries to bring up applications, it checks the target file system firstly. The file system is either designated by the configuration file (last), or by the user (run). If the designated file system can be used, current is set to the file system’s uuid. If the designated file system cannot be used, error code is recorded in error.

```js
boot: {
  bootMode,
  currentFileSystem: [Object],
  fruitmix: [Object],
  lastFileSystem: [Object],
  state
}
```

#### storage

Storage is a collection of disk information of entire system.

* blocks are the list of blocks. The block is a sequence of bytes or bits, usually containing some whole number of records, having a maximum length, a block size.
* volumes are the list of btrfs volume. The volume contains the disk info(such as usage, mountpoint, uuid) and appifi users if exist.

```js
storage: {
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
      users: [Array]
    }
  ]
}
```

#### users

list of current users of appifi

```js
users: [
  {
    avatar,
    unixUID,
    username,
    uuid
  }
]
```


#### Appifi Status

* Ready: !boot.error && boot.state === 'started' && boot.current && users.length
* No User: !boot.error && boot.state === 'started' && boot.current && users.length === 0
* Appifi Starting: !boot.error && boot.state === 'starting'
* Uninitialized: storage && storage.volumes && storage.volumes.length === 0
* Maintenance: boot.error || boot.mode === 'maintenance'

#### Blocks info

```js
const blk = storage.blocks[]
const model = blk.model ? blk.model : 'Unknown Disk Model'    // 型号
const name = blk.name                                         // 设备名称
const size = prettysize(blk.size * 512)                       // 容量
const iface = blk.isATA ? 'ATA' : blk.isSCSI ? 'SCSI' :       // 接口
blk.isUSB ? 'USB' : 'Unknown Disk Iterface'                   // 是否是USB
const usage = blk.isFileSystem ? blk.fileSystemType :         // 磁盘系统状态(是否包含文件系统、是否有文件分区)
  blk.isPartitioned ? isPartitioned : No FileSystem or Partition
const valid = !blk.unformattable                              // 是否可以格式化

let comment                                                   // 说明
if (/ActiveSwap/.test(blk.unformattable)) {
comment = i18n.__('Unformattable Comment isActiveSwap')       // 该磁盘含有在使用的交换分区，不可用
} else if (/RootFS/.test(blk.unformattable)) {
comment = i18n.__('Unformattable Comment isRootFS')           // 该磁盘含有rootfs，不可用
} else if (blk.unformattable) {
comment = i18n.__('Unformattable Comment')                    // 该磁盘无法格式化，不可用
} else if (blk.removable) {
comment = i18n.__('Removable Disk Comment')                   // 该磁盘为可移动磁盘，可以加入磁盘卷，但请谨慎选择
} else comment = i18n.__('Disk All OK Comment')               // 该磁盘可以加入磁盘卷
```

#### Checklist in maintenance mode

```js
volume = /storage.volume
boot = /boot
const mounted = volume.isMounted                                                // 是否挂载
const noMissing = !volume.missing                                               // 磁盘阵列是否完整
const lastSystem = boot.last === volume.uuid                                    // 是否是上次启动的文件系统
const fruitmixOK = Array.isArray(volume.users) || volume.users === 'EDATA'      // 是否存在Wisnuc系统 volume.users 是数组或者 'EDATA'
const usersOK = Array.isArray(volume.users)                                     // 用户信息是否完整
}
```
