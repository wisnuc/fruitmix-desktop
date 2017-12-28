import React from 'react'
import i18n from 'i18n'
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
  const hour = a.getHours()
  const min = a.getMinutes()
  return i18n.__('Parse Date Time %s %s %s %s %s', year, month, date, hour, min)
}

const phaseExifTime = (time) => {
  const a = time.replace(/\s+/g, ':').split(':')
  return i18n.__('Parse Date Time %s %s %s %s %s', a[0], a[1], a[2], a[3], a[4])
}

const getType = (type, name, metadata) => {
  if (type === 'public') return i18n.__('Public Drive')
  if (type === 'directory') return i18n.__('Directory')
  if (metadata && metadata.format) return metadata.format
  let extension = name.replace(/^.*\./, '')
  if (!extension || extension === name) extension = i18n.__('Unknown File Type')
  return extension.toUpperCase()
}

const getPath = (path) => {
  const newPath = []
  path.map((item, index) => {
    if (!index) {
      newPath.push(item.type === 'publicRoot' ? i18n.__('Public Drive') : item.type === 'share' ? i18n.__('Share Title') : i18n.__('Home Title'))
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
    return i18n.__('Get 100 Million Resolution {{res}} {{alt}} {{height}} {{width}}', { res, alt: res * 100, height, width })
  } else if (res > 10000) {
    res = Math.ceil(res / 10000)
    return i18n.__('Get 0.01 Million Resolution {{res}} {{alt}} {{height}} {{width}}', { res, alt: res / 100, height, width })
  }
  return i18n.__('Get Resolution {{res}} {{height}} {{width}}', { res, height, width })
}

class FileDetail extends React.PureComponent {
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
                <div style={{ flex: '0 0 112px', fontSize: 14 }} > { title } </div>
                <div
                  style={{
                    fontSize: 14,
                    flex: '0 0 200px',
                    color: 'rgba(0, 0, 0, 0.54)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  { values[index] }
                </div>
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
            type === 'public' || type === 'directory'
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
      i18n.__('Location'),
      noSize ? '' : i18n.__('Total Size')
    ]

    const Values = [
      getPath(this.props.path),
      prettysize(size, false, true, 2)
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
                { i18n.__('Selected Item Text %s', detailFile.length) }
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

  renderCounter() {
    console.log('renderCounter', this.props.counter)
    const c = this.props.counter
    const Titles = [
      i18n.__('Dir Count'),
      i18n.__('File Count'),
      i18n.__('File Size'),
      i18n.__('Media Count')
    ]

    const Values = [
      c.dirCount,
      c.fileCount,
      prettysize(c.fileSize, false, true, 2),
      c.mediaCount
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
                <FileFolder style={{ color: '#FFFFFF' }} />
              </div>
              <div style={{ flex: '0 0 16px' }} />
              <div style={{ flexGrow: 1 }}>
                { getPath(this.props.path).split('/').slice(-1)[0] }
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
    const { detailIndex, entries, path, primaryColor, counter } = this.props
    if (!detailIndex || !entries || (path && path.length === 1 && path[0].type === 'publicRoot')) {
      return (<div style={{ height: 128, backgroundColor: primaryColor, filter: 'brightness(0.9)' }} />)
    }

    if (counter && !detailIndex.length) return this.renderCounter()

    let detailFile // object or array of object
    if (detailIndex.length === 1) {
      detailFile = entries[detailIndex]
    } else {
      detailFile = detailIndex.map(i => entries[i])
      return this.renderMultiFiles(detailFile)
    }
    // debug('detailFile', detailFile)

    const { metadata, hash } = detailFile
    let exifDateTime = ''
    let exifModel = ''
    let height = ''
    let width = ''
    if (metadata) {
      exifDateTime = metadata.date || metadata.datetime
      exifModel = metadata.model
      height = metadata.h
      width = metadata.w
    }

    const Titles = [
      i18n.__('Type'),
      detailFile.type === 'file' ? i18n.__('Size') : '',
      detailFile.type !== 'public' ? i18n.__('Location') : '',
      (detailFile.type !== 'public' && detailFile.type !== 'unsupported') ? i18n.__('Date Modified') : '',
      exifDateTime ? i18n.__('Date Taken') : '',
      exifModel ? i18n.__('Camera Model') : '',
      height && width ? i18n.__('Resolution') : ''
    ]

    const Values = [
      getType(detailFile.type, detailFile.name, metadata),
      prettysize(detailFile.size, false, true, 2),
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
