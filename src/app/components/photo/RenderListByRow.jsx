import React, { Component, PropTypes } from 'react'
import Debug from 'debug'
import PhotoItem from './PhotoItem'

const debug = Debug('component:photoApp:RenderListByRow.jsx')

class RenderListByRow extends Component {
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
    // ipcRenderer.send('getThumb', this.props.photos.map(item => ({ digest: item.digest })))
  }

  shouldComponentUpdate(nextProps, nextState) {
    // let check = false
    // this.props.photos.forEach((item) => { if (!item.path) check = true })
    // if (check) return check
    // return false
    return (!nextProps.isScrolling)
    // return (nextProps.photos !== this.props.photos && !nextProps.isScrolling)
  }

  render() {
    // debug('render row')
    const { list, lookPhotoDetail, isScrolling } = this.props
    const { photos, first, date } = list
    return (
      <div style={{ padding: '0 6px 6px 6px' }}>
        { first &&
          <div style={{ marginBottom: 15 }}>
            <div style={{ display: 'inline-block' }}>{ date }</div>
          </div>
        }
        <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start' }}>
          { isScrolling ?
            photos.map(photo => (
              <div
                style={{
                  width: 210,
                  height: 210,
                  marginRight: 6,
                  marginBottom: 6,
                  backgroundColor: '#eeeeee'
                }}
                key={photo[0]}
              />)) :
            photos.map(photo => (
              <PhotoItem
                style={{ width: 210, height: 210, marginRight: 6, marginBottom: 6 }}
                lookPhotoDetail={lookPhotoDetail}
                digest={photo[0]}
                key={photo[0]}
                ipcRenderer={this.props.ipcRenderer}
                addListToSelection={this.props.addListToSelection}
                removeListToSelection={this.props.removeListToSelection}
              />
            )
            )
          }
        </div>
      </div>
    )
  }
}

export default RenderListByRow
