## Structure

```
Maintenance{
  RenderTitle
  NewVolumeTop{
    ConstElement
  }
  BtrfsVolume{
    ConstElement
    Users
    VolumeWisnucError
    InitVolumeDialogs
  }
  PartitionedDisk{
    ConstElement
  }
  FileSystemUsageDisk{
    ConstElement
  }
  NoUsageDisk{
    ConstElement
  }
}
```

# api:

```
http://${device.address}:3000/system/storage?wisnuc=true
http://${device.address}:3000/system/boot
http://${device.address}:3000/system/mir/run
http://${device.address}:3000/system/mir/mkfs
http://${device.address}:3000/system/mir/init
```

## status and error of volumes

```javascript
let status = users ? 'READY' :
['ENOWISNUC', 'EWISNUCNOTDIR', 'ENOFRUITMIX', 'EFRUITMIXNOTDIR'].includes(error) ? 'NOTFOUND' :
['ENOMODELS', 'EMODELSNOTDIR', 'ENOUSERS', 'EUSERSNOTFILE'].includes(error) ? 'AMBIGUOUS' :
['EUSERSPARSE', 'EUSERSFORMAT' ].includes(error) ? 'DAMAGED' : null

let mmap = new Map([
    ['ENOWISNUC', '/wisnuc文件夹不存在'],
    ['EWISNUCNOTDIR', '/wisnuc路径存在但不是文件夹'],
    ['ENOFRUITMIX', '/wisnuc文件夹存在但没有/wisnuc/fruitmix文件夹'],
    ['EFRUITMIXNOTDIR', '/wisnuc/fruitmix路径存在但不是文件夹'],
    ['ENOMODELS', '/wisnuc/fruitmix路径存在但/wisnuc/fruitmix/models文件夹不存在'],
    ['EMODELSNOTDIR', '/wisnuc/fruitmix/models路径存在但不是文件夹'],
    ['ENOUSERS', '/wisnuc/fruitmix/models文件夹存在但users.json文件不存在'],
    ['EUSERSNOTFILE', '/wisnuc/fruitmix/models/users.json路径存在但users.json不是文件'],
    ['EUSERSPARSE', '/wisnuc/fruitmix/models/users.json文件存在但不是合法的JSON格式'],
    ['EUSERSFORMAT', '/wisnuc/fruitmix/models/users.json文件存在但格式不正确']
])  
```
