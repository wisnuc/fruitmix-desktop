# import 
{
  Debug React, many from material-ui, 
  FlatButton, UUID, svg, InitVolumeDialogs,
  Operation, request, validator, prettysize
}

# function
{
  diskDisplayName() //硬盘#N
  partitionDisplayName() //分区#N
  HDDIcon() //硬盘icon
  RAIDIcon() //没有使用
  Checkbox40() //选择框
  HeaderIcon() //磁盘阵列icon，使用Avatar
  HeaderTitle1() //大标题
  SubTitleRow() //副标题
  TableHeaderRow() //底部横向的数据标题
  TableDataRow()  //底部横向的数据内容
  TableDataRowDark() //未使用
  VerticalExpandable() //可纵向展开和收回的部分
}

# class
{
  KeyValueList{} //主要数据列表，每个为占页面一半的一栏
  DoubleDivider{} //分割线
  RaidModePopover{} //创建新磁盘阵列时的可下拉选择的模式选项
  Maintenance
  {
    constructor()
    {
      unmounted
      colors
      dim
      state
      createOperation()
      reloadBootStorage()
      operationOnCancel()
      UsernamePasswordContent()
      OperationTextContent()
      OperationBusy()
      setOperationDialogBusy()
      setOperationDialogSuccess()
      setOperationDialogFailed()
      OperationDialog()
      errorText()
      startWisnucOnVolume() //启动wisnuc应用
      initWisnucOnVolume() //重新安装
      mkfsBtrfsVolume()
      onToggleCreatingNewVolume()
      toggleExpanded()
      toggleCandidate()
      setVolumeMode()
      extractAllCardItems()
      cardStyle()
      cardDepth()
      ExpandToggle()
      TextButtonTop() //创建磁盘阵列按钮
      NewVolumeTop() //添加新磁盘页面，顶栏部分
      VolumeStatus()
      volumeUnformattable()
      diskUnformattable()
      volumeIconColor()
      VolumeTitle() //左边磁盘阵列标题
      VolumeHeadline() //Btrfs文件系统，XX个磁盘，XX模式
      DiskHeadline() //分区使用的磁盘
      DiskTitle() // 左边的硬盘标题
      BtrfsVolume() //磁盘阵列信息，数据使用，磁盘信息列表
      partitionedDiskNewVolumeWarning()
      PartitionedDisk() // 分区信息，磁盘信息
      FileSystemUsageDisk()
      NoUsageDisk() //硬盘不可用时候显示的内容
      VolumeWisnucBadge //用户列表
      {
        constructor()
        {
          state
          toggleList()
        }
        render()
      }
      VolumeMenu
      {
        constructor()
        {
          state
          handleRequestClose()
        }
        render()
      }
    }
    componentDidMount()
    componentWillUnmount()
    renderAppBar() // 退出按钮  
    renderCat() // logo猫
    renderTitle() // 线球+标题 WISNUC-维护模式or已正常启动
    render()
  }
}

# api:
http://${device.address}:3000/system/storage?wisnuc=true
http://${device.address}:3000/system/boot
http://${device.address}:3000/system/mir/run
http://${device.address}:3000/system/mir/mkfs
http://${device.address}:3000/system/mir/init

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
