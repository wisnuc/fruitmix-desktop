import { ipcRenderer } from 'electron'
import React, { Component, PropTypes } from 'react'
import Debug from 'debug'
import { Paper } from 'material-ui'
import PhotoItem from './PhotoItem'
import { formatDate } from '../../utils/datetime'

const debug = Debug('component:photoApp:RenderListByRow.jsx')

export default class RenderListByRow extends Component {
  constructor(props) {
    super(props)

     /*
      this.addHoverToAllItem = () => {
        this.selectionRefs.forEach(refName =>
          this.refs[refName].addHoverIconButton()
        )
      }

      this.removeHoverToAllItem = () => {
        this.detectIsAllOffChecked() && this.selectionRefs.forEach(refName =>
          this.refs[refName].removeHoverIconButton()
        )
      }

      this.addCheckedToItem = (itemIndex) => {
        const photoItem = this.refs[`photoItem${itemIndex}`]

        this.props.addListToSelection(photoItem.props.path)
      }

      this.detectIsAllOffChecked = () => this.selectionRefs.every(refName => this.refs[refName].state.action !== 'on')

      this.addAllChecked = () => {
        const selectDate = this.refs.selectDate

        setTimeout(() =>
          this.selectionRefs.every(refName => this.refs[refName].state.action === 'on')
            && selectDate.onSelected(true)
        , 0)
      }

      this.removeCheckedToItem = (itemIndex) => {
        const photoItem = this.refs[`photoItem${itemIndex}`]

        this.props.removeListToSelection(photoItem.props.path)
      }

      this.removeAllChecked = () => {
        const selectDate = this.refs.selectDate
        selectDate.offSelected(true)
      }

      this.removeCheckToAllItem = () => {
        this.selectionRefs.forEach(refName =>
          this.refs[refName].offSelectIconButton(false)
        )
      }
    */
  }

  componentDidMount() {
    ipcRenderer.send('getThumb', this.props.photos.map(item => ({ digest: item.digest })))
  }

  shouldComponentUpdate(nextProps, nextState) {
    let check = false
    this.props.photos.forEach((item) => { if (!item.path) check = true })
    if (check) return check
    return (!nextProps.isScrolling)
    // return (nextProps.photos !== this.props.photos && !nextProps.isScrolling)
    debug('RenderListByRow update!')
  }

  render() {
    const { style, date, photos, lookPhotoDetail, first, isScrolling } = this.props
    // debug('PhotoListByDate.jsx', this.props)
    return (
      <div style={{ padding: '0 6px 6px 6px' }}>
        {/* 日期 */}
        { first &&
        <div style={{ marginBottom: 15 }}>
          <div style={{ display: 'inline-block' }}>
            <label style={{ fontSize: 12, opacity: 0.87 }}>
              { date }
            </label>
          </div>
        </div>
        }
        {/* 照片 */}
        {/* !isScrolling || this.props.photoSum < 100 ? */}
        <div style={style}>
          { !isScrolling ?
            photos.map((photo, index) => (
              <PhotoItem
                ref={`photoItem${index}`}
                style={{ width: 210, height: 210, marginRight: 6, marginBottom: 6 }}
                width={photo.width}
                height={photo.height}
                lookPhotoDetail={lookPhotoDetail}
                detectIsAllOffChecked={this.detectIsAllOffChecked}
                exifOrientation={photo.exifOrientation}
                onDetectAllOffChecked={this.props.onDetectAllOffChecked}
                selected={() => { this.addCheckedToItem(index) }}
                unselected={() => { this.removeCheckedToItem(index) }}
                date={this.props.date}
                digest={photo.digest}
                path={photo.path}
                key={photo.digest}
                isScrolling={isScrolling}
              />
             )) :
            photos.map((photo, index) => (
              <div
                style={{
                  width: 210,
                  height: 210,
                  marginRight: 6,
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#eeeeee',
                  borderRadius: 2,
                  boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
                }}
              />
            ))
           }
        </div>
      </div>
    )
  }
}

RenderListByRow.propTypes = {
  style: PropTypes.object,
  date: PropTypes.string.isRequired,
  photos: PropTypes.array.isRequired,
  addListToSelection: PropTypes.func.isRequired,
  removeListToSelection: PropTypes.func.isRequired,
  lookPhotoDetail: PropTypes.func.isRequired,
  onAddHoverToList: PropTypes.func,
  onOffSelected: PropTypes.func
}
