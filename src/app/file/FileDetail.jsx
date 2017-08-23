import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { CircularProgress, Divider } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ContentCopy from 'material-ui/svg-icons/content/content-copy'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import Thumb from './Thumb'
import renderFileIcon from '../common/renderFileIcon'

const debug = Debug('component:file:FileDetail:')

const phaseDate = (time) => {
  const a = new Date(time)
  const year = a.getFullYear()
  const month = a.getMonth() + 1
  const date = a.getDate()
  return `${year}年${month}月${date}日`
}

const phaseExifTime = (time) => {
  const a = time.replace(/\s+/g, ':').split(':')
  return `${a[0]}年${a[1]}月${a[2]}日 ${a[3]} : ${a[4]}`
}

const getType = (type, name, metadata) => {
  if (type === 'folder') return '文件夹'
  if (type === 'public') return '共享盘'
  if (type === 'directory') return '文件夹'
  if (metadata && metadata.format) return metadata.format
  let extension = name.replace(/^.*\./, '')
  if (!extension || extension === name) extension = '未知文件'
  return extension.toUpperCase()
}

const getPath = (path) => {
  const newPath = []
  path.map((item, index) => {
    if (!index) {
      newPath.push(item.type === 'publicRoot' ? '共享盘' : '我的文件')
    } else {
      newPath.push(item.name)
    }
    return null
  })
  return newPath.join('/')
}

const getResolution = (height, width) => {
  let res = height * width
  if (res > 100000000) {
    res = Math.ceil(res / 100000000)
    return `${res} 亿像素 ${height} x ${width}`
  } else if (res > 10000) {
    res = Math.ceil(res / 10000)
    return `${res} 万像素 ${height} x ${width}`
  }
  return `${res} 像素 ${height} x ${width}`
}

class FileDetail extends React.PureComponent {

  constructor(props) {
    super(props)
  }

  renderList(titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => {
            if (!title) return <div key={`${title}+${index.toString()}`} />
            return (
              <div
                style={{
                  height: 32,
                  color: 'rgba(0, 0, 0, 0.54)',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%'
                }}
                key={title}
              >
                <div style={{ flex: '0 0 96px', fontSize: 14 }} > { title } </div>
                <div
                  style={{
                    fontSize: 14,
                    flex: '0 0 216px',
                    color: 'rgba(0, 0, 0, 0.54)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                > { values[index] }</div>
              </div>
            )
          })
        }
      </div>
    )
  }

  renderTitle(detailFile) {
    const { name, type, metadata } = detailFile
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 32,
          fontSize: 20,
          fontWeight: 500,
          color: '#FFFFFF'
        }}
      >
        <div style={{ flex: '0 0 24px', display: 'flex', alignItems: 'center' }}>
          {
            type === 'folder' || type === 'public' || type === 'directory'
            ? <FileFolder style={{ color: '#FFFFFF' }} />
            : type === 'file'
            ? renderFileIcon(name, metadata, 24, false, true) // name, metadata, size, dark, white
            : <ErrorIcon style={{ color: '#FFFFFF' }} />
          }
        </div>
        <div style={{ flex: '0 0 16px' }} />
        <div style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          { name }
        </div>
        <div style={{ flex: '0 0 24px' }} />
      </div>
    )
  }

  renderMultiFiles(detailFile) {
    let size = 0
    const noSize = detailFile.findIndex(f => f.size === undefined) > -1
    if (!noSize) detailFile.forEach(f => (size += f.size))
    // debug('renderMultiFiles', detailFile, noSize, size)
    const Titles = [
      '位置',
      noSize ? '' : '总计大小'
    ]

    const Values = [
      getPath(this.props.path),
      prettysize(size)
    ]

    return (
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ height: 128, backgroundColor: this.props.primaryColor, filter: 'brightness(0.9)' }}>
          <div style={{ height: 64 }} />
          {/* header */}
          <div style={{ height: 64, marginLeft: 24 }} >
            <div style={{ height: 16 }} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 32,
                fontSize: 20,
                fontWeight: 500,
                color: '#FFFFFF'
              }}
            >
              <div style={{ flex: '0 0 24px', display: 'flex', alignItems: 'center' }}>
                <ContentCopy style={{ color: '#FFFFFF' }} />
              </div>
              <div style={{ flex: '0 0 16px' }} />
              <div style={{ flexGrow: 1 }}>
                { `您选择了${detailFile.length}项` }
              </div>
              <div style={{ flex: '0 0 24px' }} />
            </div>
          </div>
        </div>

        {/* data */}
        <div style={{ width: 312, padding: 24, display: 'flex', flexDirection: 'column' }}>
          { this.renderList(Titles, Values) }
        </div>
      </div>
    )
  }

  render() {
    const { detailIndex, entries, path, primaryColor } = this.props
    if (!detailIndex || !entries || !detailIndex.length) {
      return (<div style={{ height: 128, backgroundColor: primaryColor, filter: 'brightness(0.9)' }} />)
    }

    let detailFile // object or array of object
    if (detailIndex.length === 1) {
      detailFile = entries[detailIndex]
    } else {
      detailFile = detailIndex.map(i => entries[i])
      return this.renderMultiFiles(detailFile)
    }
    debug('detailFile', detailFile)

    const { metadata, hash } = detailFile
    let exifDateTime = ''
    let exifModel = ''
    let height = ''
    let width = ''
    if (metadata) {
      exifDateTime = metadata.datetime
      exifModel = metadata.model
      height = metadata.h
      width = metadata.w
    }

    let longPic = false
    if (height && width && (height / width > 2 || width / height > 2)) {
      longPic = true
    }

    const Titles = [
      '类型',
      detailFile.type === 'file' ? '大小' : '',
      detailFile.type !== 'public' ? '位置' : '',
      (detailFile.type !== 'public' && detailFile.type !== 'unsupported') ? '修改时间' : '',
      exifDateTime ? '拍摄时间' : '',
      exifModel ? '拍摄设备' : '',
      height && width ? '分辨率' : ''
    ]

    const Values = [
      getType(detailFile.type, detailFile.name, metadata),
      prettysize(detailFile.size),
      getPath(path),
      phaseDate(detailFile.mtime),
      exifDateTime ? phaseExifTime(exifDateTime) : '',
      exifModel,
      getResolution(height, width)
    ]

    return (
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ height: 128, backgroundColor: primaryColor, filter: 'brightness(0.9)' }}>
          <div style={{ height: 64 }} />
          {/* header */}
          <div style={{ height: 64, marginLeft: 24 }} >
            <div style={{ height: 16 }} />
            { this.renderTitle(detailFile) }
          </div>
        </div>

        {/* picture */}
        {
          metadata && hash &&
            <div
              style={{
                margin: 24,
                width: 312,
                height: 234,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Thumb
                digest={hash}
                ipcRenderer={this.props.ipcRenderer}
                height={234}
                width={312}
                full
              />
            </div>
        }
        { metadata && hash && <Divider /> }

        {/* data */}
        <div style={{ width: 312, padding: 24, display: 'flex', flexDirection: 'column' }}>
          { this.renderList(Titles, Values) }
        </div>
      </div>
    )
  }
}

export default FileDetail
