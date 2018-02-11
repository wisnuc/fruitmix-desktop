import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar, IconButton, RaisedButton, TextField } from 'material-ui'
import ContentAdd from 'material-ui/svg-icons/content/add'
import FileFolder from 'material-ui/svg-icons/file/folder'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import ForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward'
import UpIcon from 'material-ui/svg-icons/navigation/arrow-upward'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import { ShareIcon, ShareDisk } from '../common/Svg'
import FlatButton from '../common/FlatButton'
import FileContent from '../file/FileContent'
import QuickNav from '../nav/QuickNav'
import ListSelect from './ListSelect'
import renderFileIcon from '../common/renderFileIcon'
import { formatMtime } from '../common/datetime'
import PhotoList from '../photo/PhotoList'
import { combineElement, removeElement } from '../common/array'
import Grid from './Grid'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

class SelectMedia extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedItems: []
    }

    this.selected = []

    this.lookPhotoDetail = (digest) => {
      this.seqIndex = this.state.media.findIndex(item => item.hash === digest)
      this.setState({ openDetail: true })
    }

    this.setAnimation2 = (component, status) => {
      if (component === 'ClearSelected') {
        /* add animation to ClearSelected */
        const transformItem = this.refClearSelected
        const time = 0.4
        const ease = global.Power4.easeOut
        if (status === 'In') {
          TweenMax.to(transformItem, time, { rotation: 180, opacity: 1, ease })
        }
        if (status === 'Out') {
          TweenMax.to(transformItem, time, { rotation: -180, opacity: 0, ease })
        }
      }
    }

    this.keyChange = (event) => {
      this.getShiftStatus(event)
    }

    this.getShiftStatus = (event) => {
      if (event.shiftKey === this.state.shift) return
      this.setState({ shift: event.shiftKey })
    }

    this.memoizeValue = {}

    this.memoize = (newValue) => {
      this.memoizeValue = Object.assign(this.memoizeValue, newValue)
      return this.memoizeValue
    }

    this.addListToSelection = (digests) => {
      this.setState({ selectedItems: combineElement(digests, this.state.selectedItems).sort() })
    }

    this.removeListToSelection = (digests) => {
      this.setState({ selectedItems: removeElement(digests, this.state.selectedItems).sort() })
    }

    this.clearSelect = () => { this.setState({ selectedItems: [] }) }
    this.getHoverPhoto = (digest) => {
      if (!this.state.selectedItems.length) return
      const lastSelect = this.state.selectedItems[this.state.selectedItems.length - 1]
      const lastSelectIndex = this.state.media.findIndex(photo => photo.hash === lastSelect)
      const hoverIndex = this.state.media.findIndex(photo => photo.hash === digest)
      let shiftHoverPhotos = this.state.media.slice(lastSelectIndex, hoverIndex + 1)

      if (hoverIndex < lastSelectIndex) shiftHoverPhotos = this.state.media.slice(hoverIndex, lastSelectIndex + 1)
      this.setState({ shiftHoverItems: shiftHoverPhotos.map(photo => photo.hash) })
    }

    this.requestMedia = async () => {
      const blacklist = await this.props.apis.pureRequestAsync('blacklist')
      const media = await this.props.apis.pureRequestAsync('media')
      return ({ blacklist, media })
    }

    this.processMedia = (media, blacklist) => {
      // console.log('processMedia start', (new Date()).getTime() - this.timeFlag)
      /* no data */
      if (!Array.isArray(media) || !Array.isArray(blacklist)) return null

      /* data not change */
      if (media === this.preMedia && blacklist === this.preBL && this.value) return this.value

      /* store data */
      this.preMedia = media
      this.preBL = blacklist

      const removeBlacklist = (m, l) => {
        if (!m.length || !l.length) return m
        const map = new Map()
        m.filter(item => !!item.hash).forEach(d => map.set(d.hash, d))
        l.forEach(b => map.delete(b))
        return [...map.values()]
      }

      /* remove photos without hash and filter media by blacklist */
      this.value = removeBlacklist(media, blacklist)

      /* formate date */
      this.value.forEach((v) => {
        let date = v.date || v.datetime
        if (!date || date.search(/:/g) !== 4 || date.search(/^0/) > -1) date = ''
        v.date = date
      })

      /* sort photos by date */
      this.value.sort((prev, next) => next.date.localeCompare(prev.date))

      // console.log('processMedia finished', (new Date()).getTime() - this.timeFlag)
      return this.value
    }

    this.fire = () => {
      const args = {
        comment: '',
        type: 'list',
        boxUUID: this.props.boxUUID,
        stationId: this.props.stationId,
        list: this.state.selectedItems.map(d => ({ type: 'media', sha256: d }))
      }

      this.props.onRequestClose()
      this.props.createNasTweets(args)
    }
  }

  renderLoading(size) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} />
      </div>
    )
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyChange)
    document.addEventListener('keyup', this.keyChange)
    this.requestMedia()
      .then(d => this.setState({ media: this.processMedia(d.media, d.blacklist) }))
      .catch(e => console.log('requestMedi error', e))
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyChange)
    document.removeEventListener('keyup', this.keyChange)
  }

  render() {
    // console.log('SelectMedia', this.props, this.state, this.selected)
    const { currentUser, primaryColor, onRequestClose, ipcRenderer } = this.props
    return (
      <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1000, backgroundColor: '#FFF' }}>
        {/* Selected Header */}
        <div
          style={{
            width: '100%',
            height: 64,
            backgroundColor: '#FFF',
            display: 'flex',
            alignItems: 'center',
            zIndex: 200,
            boxShadow: '0px 1px 4px rgba(0,0,0,0.27)'
          }}
        >
          <div style={{ width: 12 }} />
          <div ref={ref => (this.refClearSelected = ref)}>
            <IconButton onTouchTap={onRequestClose}>
              <CloseIcon color="rgba(0,0,0,0.54)" />
            </IconButton>
          </div>
          <div style={{ width: 12 }} />
          <div style={{ color: 'rgba(0,0,0,.54)', fontSize: 20, fontWeight: 500 }} >
            { i18n.__('%s Photo Selected', this.state.selectedItems.length) }
          </div>
          <div style={{ flexGrow: 1 }} />
        </div>
        {/* content */}
        <div style={{ width: '100%', height: 'calc(100% - 64px)', display: 'flex', position: 'relative', marginTop: 8 }}>
          {/* media */}
          <div style={{ flexGrow: 1, height: '100%', backgroundColor: '#FFF', paddingLeft: 80, paddingTop: 2 }}>
            {
              !this.state.media ?
              <div
                style={{
                  position: 'relative',
                  marginTop: -7,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularProgress />
              </div> :
              this.state.media.length ?
              <PhotoList
                hideTimeline
                selecting
                media={this.state.media}
                lookPhotoDetail={this.lookPhotoDetail}
                ipcRenderer={ipcRenderer}
                addListToSelection={this.addListToSelection}
                removeListToSelection={this.removeListToSelection}
                memoize={this.memoize}
                selectedItems={this.state.selectedItems}
                getHoverPhoto={this.getHoverPhoto}
                shiftStatus={{ shift: this.state.shift, items: this.state.shiftHoverItems }}
                headerHeight={186}
              /> :
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                { i18n.__('No Media Text 1') }
              </div>
            }
          </div>
          <div
            style={{
              width: 360,
              height: 'calc(100% - 8px)',
              boxSizing: 'border-box',
              border: '8px solid #F5F5F5',
              backgroundColor: '#FFF'
            }}
          >
            {/* tweeter */}
            <div style={{ height: 72, width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 16 }} />
              {/* Avatar */}
              <div style={{ height: 40, width: 40 }}>
                <Avatar src={currentUser.avatarUrl} size={40} />
              </div>
              <div style={{ width: 16 }} />
              <div style={{ width: 100 }}>
                { currentUser.nickName }
              </div>
            </div>

            {/* comment */}
            <div style={{ height: 61, width: '100%', margin: 8, display: 'flex', alignItems: 'center' }}>
              <TextField
                name="comment"
                value={this.state.comment}
                hintText={i18n.__('Say Something')}
                onChange={e => this.setState({ comment: e.target.value })}
              />
              <ModeEdit color="rgba(0,0,0,.54)" style={{ margin: 8 }} />
            </div>

            {/* media list content */}
            <div style={{ height: 'calc(100% - 221px)', width: '100%', overflowY: 'auto', position: 'relative' }}>
              <Grid
                items={this.state.selectedItems}
                ipcRenderer={ipcRenderer}
                action={digest => this.removeListToSelection([digest])}
                num={3}
                size={100}
              />
            </div>

            {/* action */}
            <div style={{ height: 61, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RaisedButton
                disabled={!this.state.selectedItems.length}
                style={{ width: 'calc(100% - 32px)' }}
                primary
                label={i18n.__('Create Tweet')}
                onTouchTap={this.fire}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default SelectMedia
