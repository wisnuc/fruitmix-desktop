import React from 'react'
import Debug from 'debug'
import UUID from 'node-uuid'
import prettysize from 'prettysize'
import { CircularProgress, Divider } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'

const debug = Debug('component:file:FileDetail:')

const phaseDate = (time) => {
  const a = new Date(time)
  const year = a.getFullYear()
  const month = a.getMonth() + 1
  const date = a.getDate()
  return `${year}年${month}月${date}日`
}

const phaseiExifTime = (time) => {
  const a = time.replace(/\s+/g, ':').split(':')
  return `${a[0]}年${a[1]}月${a[2]}日 ${a[3]} : ${a[4]}`
}

const getType = (type, name) => {
  if (type === 'folder') return '文件夹'
  if (type === 'public') return '共享文件夹'
  let extension = name.replace(/^.*\./, '')
  if (!extension || extension === name) extension = '未知文件'
  return extension.toUpperCase()
}

const getPath = (path) => {
  const newPath = []
  path.map((item, index) => {
    if (!index) {
      newPath.push('我的文件')
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

class FileDetail extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      thumbPath: ''
    }

    this.updateThumbPath = (event, session, path) => {
      if (this.session === session) {
        // debug('thumbPath got')
        this.setState({ thumbPath: path })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.detailFile && nextProps.detailFile.digest &&
      (!this.props.detailFile || nextProps.detailFile.digest !== this.props.detailFile.digest)) {
      this.session = UUID.v4()
      this.props.ipcRenderer.send('mediaShowThumb', this.session, nextProps.detailFile.digest, 210, 210)
      this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
      this.setState({ thumbPath: '' })
    }
  }

  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updateThumbPath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
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

  renderTitle(title, type) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 32,
          fontSize: 20,
          fontWeight: 500,
          color: '#FAFAFA'
        }}
      >
        <div style={{ flex: '0 0 24px', display: 'flex', alignItems: 'center' }}>
          {
            type === 'folder' || type === 'public'
            ? <FileFolder style={{ color: 'rgba(0,0,0,0.54)' }} />
            : type === 'file'
            ? <EditorInsertDriveFile style={{ color: 'rgba(0,0,0,0.54' }} />
            : null
          }
        </div>
        <div style={{ flex: '0 0 16px' }} />
        <div style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          { title }
        </div>
        <div style={{ flex: '0 0 24px' }} />
      </div>
    )
  }


  render() {
    const { detailFile, path } = this.props
    // debug('detailFile', detailFile)
    if (!detailFile) return <div style={{ height: 128, backgroundColor: '#00796B' }} />

    const { metadata, digest } = detailFile
    let exifDateTime = ''
    let exifModel = ''
    let height = ''
    let width = ''
    if (metadata) {
      exifDateTime = metadata.exifDateTime
      exifModel = metadata.exifModel
      height = metadata.height
      width = metadata.width
    }

    let longPic = false
    if (height && width && (height / width > 2 || width / height > 2)) {
      longPic = true
    }

    const Titles = [
      '类型',
      detailFile.type === 'file' ? '大小' : '',
      detailFile.type !== 'public' ? '位置' : '',
      detailFile.type !== 'public' ? '修改时间' : '',
      exifDateTime ? '拍摄时间' : '',
      exifModel ? '拍摄设备' : '',
      height && width ? '分辨率' : ''
    ]

    const Values = [
      getType(detailFile.type, detailFile.name),
      prettysize(detailFile.size),
      getPath(path),
      phaseDate(detailFile.mtime),
      phaseiExifTime(exifDateTime),
      exifModel,
      getResolution(height, width)
    ]
    return (
      <div style={{ height: '100%' }}>
        <div style={{ height: 128, backgroundColor: '#00796B' }}>
          <div style={{ height: 64 }} />
          {/* header */}
          <div style={{ height: 64, marginLeft: 24 }} >
            <div style={{ height: 16 }} />
            { this.renderTitle(detailFile.name, detailFile.type) }
          </div>
        </div>

        {/* picture */}
        {
          digest &&
            <div
              style={{
                margin: 24,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {
                this.state.thumbPath &&
                  <img
                    width={312}
                    height={234}
                    style={{ objectFit: longPic ? 'contain' : 'cover' }}
                    alt="ThumbImage"
                    src={this.state.thumbPath}
                  />
              }
            </div>
        }
        { digest && <Divider /> }

        {/* data */}
        <div style={{ width: 312, height: 'calc(100% - 152px)', padding: 24, display: 'flex', flexDirection: 'column' }}>
          { this.renderList(Titles, Values) }
        </div>
      </div>
    )
  }
}

export default FileDetail
