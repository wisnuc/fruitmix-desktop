import React, { PureComponent } from 'react'
import Debug from 'debug'
import sanitize from 'sanitize-filename'
import prettysize from 'prettysize'
import { TextField, Checkbox, Divider } from 'material-ui'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import FileFolder from 'material-ui/svg-icons/file/folder'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:file:FileDetail:')

const phaseDate = (time) => {
  const a = new Date(time)
  const year = a.getFullYear()
  const month = a.getMonth() + 1
  const date = a.getDate()
  return `${year}年${month}月${date}日`
}

const getType = (type, name) => {
  if (type === 'folder') return '文件夹'
  if (type === 'public') return '共享文件夹'
  let extension = name.replace(/^.*\./, '').toUpperCase()
  if (!extension || extension === name) extension = '未知文件'
  return extension
}

const getPath = (path) => {
  const newPath = []
  path.map((item, index) => {
    if (!index) {
      newPath.push('我的文件')
    } else {
      newPath.push(item.name)
    }
  })
  return newPath.join('/')
}

class FileDetail extends PureComponent {

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
    // debug('detailFile', detailFile, path)
    if (!detailFile) return <div style={{ height: 128, backgroundColor: '#00796B' }} />
    const Titles = [
      '类型',
      detailFile.type === 'file' ? '大小' : '',
      detailFile.type !== 'public' ? '位置' : '',
      detailFile.type !== 'public' ? '修改时间' : ''
    ]

    const Values = [
      getType(detailFile.type, detailFile.name),
      prettysize(detailFile.size),
      getPath(path),
      phaseDate(detailFile.mtime)
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

        {/* content */}
        <div style={{ width: 312, height: 'calc(100% - 152px)', padding: 24, display: 'flex', flexDirection: 'column' }}>
          { this.renderList(Titles, Values) }
        </div>
      </div>
    )
  }
}

export default FileDetail
