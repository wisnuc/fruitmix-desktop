import React from 'react'
import Debug from 'debug'
import ActionDns from 'material-ui/svg-icons/action/dns'
import CPU from 'material-ui/svg-icons/hardware/memory'
import Memory from 'material-ui/svg-icons/device/sd-storage'

const debug = Debug('component:control:deviceinfo')

/** sample dmidecode for vmware guest / window host
  "dmidecode": {
    "processorFrequency": "3300 MHz",
    "processorVersion": "Intel(R) Core(TM) i5-4590 CPU @ 3.30GHz",
    "processorManufacturer": "GenuineIntel",
    "processorFamily": "Unknown",
    "chassisAssetTag": "No Asset Tag",
    "chassisSerialNumber": "None",
    "chassisVersion": "N/A",
    "chassisType": "Other",
    "chassisManufacturer": "No Enclosure",
    "baseboardAssetTag": "Not Specified",
    "baseboardSerialNumber": "None",
    "baseboardVersion": "None",
    "baseboardProductName": "440BX Desktop Reference Platform",
    "baseboardManufacturer": "Intel Corporation",
    "systemUuid": "564DF053-1B08-DB67-0B1F-C654F24CC61B",
    "systemSerialNumber": "VMware-56 4d f0 53 1b 08 db 67-0b 1f c6 54 f2 4c c6 1b",
    "systemVersion": "None",
    "systemProductName": "VMware Virtual Platform",
    "systemManufacturer": "VMware, Inc.",
    "biosReleaseDate": "07/02/2015",
    "biosVersion": "6.00",
    "biosVendor": "Phoenix Technologies LTD"
  },
**/

class DeviceInfo extends React.PureComponent {

  constructor(props) {
    super(props)
  }

  renderList(Icon, titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }} key={title}>
              <div style={{ flex: '0 0 24px' }} />
              <div style={{ flex: '0 0 56px' }} >
                { !index && <Icon color={this.props.primaryColor} /> }
              </div>
              <div>
                <div style={{ fontSize: 16, flex: '0 0 240px', color: 'rgba(0, 0, 0, 0.87)' }}> { values[index] }</div>
                <div style={{ fontSize: 14, flex: '0 0 240px', color: 'rgba(0, 0, 0, 0.54)' }}> { title } </div>
              </div>
              <div style={{ flexGrow: 1 }} />
            </div>
          ))
        }
      </div>
    )
  }

  renderDivider() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginLeft: 80 }}>
        <div style={{ height: 8 }} />
        <hr style={{ marginRight: 80, backgroundColor: 'rgb(224, 224, 224)', border: 0, height: 1, width: 'calc(100% - 72px)' }} />
        <div style={{ height: 8 }} />
      </div>
    )
  }

  render() {
    // debug('this.props.device', this.props.device)
    if (!this.props.device) return <div />

    const { cpuInfo, memInfo, ws215i, dmidecode, release, commit } = this.props.device

    const cpuIcon = CPU

    const cpuTitles = [
      'CPU核心数',
      'CPU类型',
      'Cache'
    ]

    const cpuValues = [
      cpuInfo.length,
      cpuInfo[0].modelName,
      cpuInfo[0].cacheSize
    ]

    const memTitles = [
      '总内存',
      '未使用内存',
      '可用内存'
    ]

    const menIcon = Memory

    const memValues = [
      memInfo.memTotal,
      memInfo.memFree,
      memInfo.memAvailable
    ]

    let relTitles
    let relValues
    let relIcon
    let ws215iTitles
    let ws215iValues
    let ws215iIcon

    if (release) {
      relIcon = ActionDns

      relTitles = [
        '版本',
        '版本类型',
        '发布时间',
        '源码版本'
      ]

      relValues = [
        release.tag_name + (release.prerelease ? ' beta' : ''),
        release.prerelease ? '测试版' : '正式版',
        new Date(release.published_at).toLocaleDateString('zh-CN'),
        commit ? commit.slice(0, 12) : '未知'
      ]
    }

    if (ws215i) {
      ws215iIcon = ActionDns

      ws215iTitles = [
        '型号',
        '硬件序列号',
        'MAC地址'
      ]

      ws215iValues = [
        'WS215i',
        ws215i.serial,
        ws215i.mac.toUpperCase()
      ]
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
        <div style={{ height: 16 }} />
        { ws215i && this.renderList(ws215iIcon, ws215iTitles, ws215iValues) }
        { ws215i && <this.renderDivider /> }
        { release && this.renderList(relIcon, relTitles, relValues) }
        { release && <this.renderDivider /> }
        { this.renderList(cpuIcon, cpuTitles, cpuValues) }
        <this.renderDivider />
        { this.renderList(menIcon, memTitles, memValues) }
      </div>
    )
  }
}

export default DeviceInfo
