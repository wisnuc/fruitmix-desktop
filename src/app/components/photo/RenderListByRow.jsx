import React from 'react'
import PhotoItem from './PhotoItem'

class RenderListByRow extends React.Component {

  shouldComponentUpdate(nextProps) {
    return (!nextProps.isScrolling)
  }

  render() {
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
                style={{ width: 210, height: 210, marginRight: 6, marginBottom: 6, backgroundColor: '#eeeeee' }}
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
            ))
          }
        </div>
      </div>
    )
  }
}

export default RenderListByRow
