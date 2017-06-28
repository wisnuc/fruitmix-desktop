import React from 'react'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'
import PhotoItem from './PhotoItem'

const includeAll = (parent, child) => {
  let Got = 0
  child.forEach((item) => {
    if (parent.includes(item)) Got += 1
  })
  return (Got === child.length)
}

class RenderListByRow extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      selected: includeAll(this.props.selectedItems, this.props.photoListWithSameDate.photos.map(photo => photo[0]))
    }

    this.onSelectIconButton = () => {
      // console.log('this.onSelectIconButton', this.props)
      if (!this.state.selected) {
        this.setState({ selected: true }, () => {
          this.props.photoListWithSameDate.photos.forEach(photo => this.props.addListToSelection(photo[0]))
        })
      } else {
        this.setState({ selected: false }, () => {
          this.props.photoListWithSameDate.photos.forEach(photo => this.props.removeListToSelection(photo[0]))
        })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItems.length !== this.props.selectedItems.length) {
      this.setState({
        selected: includeAll(nextProps.selectedItems, nextProps.photoListWithSameDate.photos.map(photo => photo[0]))
      })
    }
  }

  shouldComponentUpdate(nextProps) {
    return (!nextProps.isScrolling)
  }

  render() {
    const { list, lookPhotoDetail, isScrolling } = this.props
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
          { isScrolling ?
            photos.map(photo => (
              <div
                style={{ width: 210, height: 210, marginRight: 8, marginBottom: 8, backgroundColor: '#eeeeee' }}
                key={photo[0]}
              />)) :
            photos.map(photo => (
              <PhotoItem
                style={{ width: 210, height: 210, marginRight: 8, marginBottom: 8 }}
                lookPhotoDetail={lookPhotoDetail}
                digest={photo[0]}
                key={photo[0]}
                ipcRenderer={this.props.ipcRenderer}
                addListToSelection={this.props.addListToSelection}
                removeListToSelection={this.props.removeListToSelection}
                selectedItems={this.props.selectedItems}
                getHoverPhoto={this.props.getHoverPhoto}
                shiftStatus={this.props.shiftStatus}
              />
            ))
          }
        </div>
      </div>
    )
  }
}

export default RenderListByRow
