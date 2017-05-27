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
      <div style={{ padding: 8 }}>
        { first &&
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'inline-block', color: 'rgba(0,0,0,0.87)', fontSize: 13, fontWeight: 500 }}>{ date }</div>
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
              />
            ))
          }
        </div>
      </div>
    )
  }
}

export default RenderListByRow
