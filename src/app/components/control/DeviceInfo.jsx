import React from 'react'
import Debug from 'debug'
import { Avatar, Divider } from 'material-ui'
import ActionDns from 'material-ui/svg-icons/action/dns'
import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

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

class DriveHeader extends React.PureComponent {

  // 104, leading
  // 240, label
  // grow, user
  // 320, uuid
  // 56, spacer
  // 64, view
  // 24, padding

  render() {
    return (
      <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: '0 0 104px' }} />
        <div style={{ flex: '0 0 240px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          名称
        </div>
        <div style={{ flexGrow: 1, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          用户
        </div>
        <div style={{ flex: '0 0 320px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
          UUID
        </div>
        <div style={{ flex: '0 0 144px' }} />
      </div>
    )
  }
}

class DeviceInfo extends React.PureComponent {

  constructor(props) {
    super(props)
  }


  renderList(titles, values) {
    const titleStyle = { fontSize: 16, flex: '0 0 104px', textAlign: 'right' }
    const valueStyle = Object.assign(contentStyle, { flex: '0 0 480px' })
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => (
            <div style={{ height: 48, display: 'flex', alignItems: 'center', width: '100%' }} >
              <div style={titleStyle}> { title } </div>
              <div style={{ flex: '0 0 80px' }} />
              <div style={valueStyle}> { values[index] }</div>
              <div style={{ flexGrow: 1 }} />
            </div>
          ))
        }
      </div>
    )
  }

  renderDivider() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        <div style={{ height: 24 }} />
        <hr style={{ width: 720, marginLeft: 16 }} />
        <div style={{ height: 24 }} />
      </div>
    )
  }

  render() {
    debug('this.props.device', this.props.device)
    if (!this.props.device) return <div />

    const { cpuInfo, memInfo, ws215i, dmidecode, release, commit } = this.props.device

    const cpuTitles = [
      <Avatar><ActionDns color="white" /></Avatar>,
      'CPU核心数:',
      'CPU类型:',
      'Cache:'
    ]

    const cpuValues = [
      'CPU',
      cpuInfo.length,
      cpuInfo[0].modelName,
      cpuInfo[0].cacheSize
    ]

    const memTitles = [
      <Avatar><ActionDns color="white" /></Avatar>,
      '总内存:',
      '未使用内存:',
      '可用内存:'
    ]

    const memValues = [
      '内存',
      memInfo.memTotal,
      memInfo.memFree,
      memInfo.memAvailable
    ]

    let relTitles
    let relValues
    let ws215iTitles
    let ws215iValues

    if (release) {
      relTitles = [
        <Avatar><ActionDns color="white" /></Avatar>,
        '版本:',
        '版本类型:',
        '发布时间:',
        '源码版本:'
      ]

      relValues = [
        '软件',
        release.tag_name + (release.prerelease ? ' beta' : ''),
        release.prerelease ? '测试版' : '正式版',
        new Date(release.published_at).toLocaleDateString('zh-CN'),
        commit ? commit.slice(0, 12) : '未知'
      ]
    }

    if (ws215i) {
      ws215iTitles = [
        <Avatar><ActionDns color="white" /></Avatar>,
        '型号:',
        '硬件序列号:',
        'MAC地址:'
      ]

      ws215iValues = [
        '闻上家用私有云',
        'WS215i',
        ws215i.serial,
        ws215i.mac.toUpperCase()
      ]
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ height: 24 }} />
        { ws215i && this.renderList(ws215iTitles, ws215iValues) }
        { ws215i && <this.renderDivider /> }
        { release && this.renderList(relTitles, relValues) }
        { release && <this.renderDivider /> }
        { this.renderList(cpuTitles, cpuValues) }
        <this.renderDivider />
        { this.renderList(memTitles, memValues) }
      </div>
    )
  }
}

export default DeviceInfo
