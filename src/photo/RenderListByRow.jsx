import React from 'react'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'
import PhotoItem from './PhotoItem'
import { includeAll } from '../common/array'

class RenderListByRow extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selected: this.props.list.first && this.props.selectedItems.length >= this.props.photoListWithSameDate.photos.length &&
      includeAll([...this.props.selectedItems].sort(), this.props.photoListWithSameDate.photos.map(photo => photo.hash).sort())
    }

    this.onSelectIconButton = () => {
      // console.log('this.onSelectIconButton', this.props)
      if (!this.state.selected) {
        this.setState({ selected: true }, () => {
          this.props.addListToSelection(this.props.photoListWithSameDate.photos.map(p => p.hash))
        })
      } else {
        this.setState({ selected: false }, () => {
          this.props.removeListToSelection(this.props.photoListWithSameDate.photos.map(p => p.hash))
        })
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.selectedItems.length !== this.props.selectedItems.length) {
      this.setState({
        selected: nextProps.list.first && nextProps.selectedItems.length >= nextProps.photoListWithSameDate.photos.length &&
        includeAll([...nextProps.selectedItems].sort(), nextProps.photoListWithSameDate.photos.map(photo => photo.hash).sort())
      })
    }
  }

  shouldComponentUpdate (nextProps) {
    return (!nextProps.isScrolling)
  }

  render () {
    const { list, lookPhotoDetail, isScrolling, rowSum } = this.props
    const { photos, first, date } = list
    const selected = this.props.selectedItems.length > 0
    return (
      <div style={{ padding: 8 }}>
        { first &&
          <div
            style={{
              position: 'relative',
              height: 48,
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(0,0,0,0.87)',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            <div
              style={{
                opacity: selected ? 1 : 0,
                transition: selected ? 'all .1s .1s cubic-bezier(0.0, 0.0, 0.2, 1)' : 'all .1s cubic-bezier(0.0, 0.0, 0.2, 1)'
              }}
              onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}
            >
              <CheckIcon
                style={{ margin: 8 }}
                color={this.state.selected ? '#1E88E5' : 'rgba(0,0,0,0.54)'}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                left: selected ? 40 : 0,
                transition: selected ? 'all .1s cubic-bezier(0.0, 0.0, 0.2, 1)' : 'all .1s .1s cubic-bezier(0.0, 0.0, 0.2, 1)'
              }}
            >
              { date }
            </div>
          </div>
        }
        <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start' }}>
          { isScrolling && rowSum > 500
            ? photos.map(photo => (
              <div
                style={{ width: this.props.size, height: this.props.size, marginRight: 8, marginBottom: 8, backgroundColor: '#eeeeee' }}
                key={photo.hash}
              />))
            : photos.map(photo => (
              <PhotoItem
                style={{ width: this.props.size, height: this.props.size, marginRight: 8, marginBottom: 8 }}
                lookPhotoDetail={lookPhotoDetail}
                digest={photo.hash}
                key={photo.hash}
                item={photo}
                ipcRenderer={this.props.ipcRenderer}
                addListToSelection={this.props.addListToSelection}
                removeListToSelection={this.props.removeListToSelection}
                selectedItems={this.props.selectedItems}
                getHoverPhoto={this.props.getHoverPhoto}
                shiftStatus={this.props.shiftStatus}
                size={this.props.size}
                selecting={this.props.selecting}
              />
            ))
          }
        </div>
      </div>
    )
  }
}

export default RenderListByRow
