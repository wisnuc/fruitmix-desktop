import React from 'react'
import PDF, { Page } from 'react-pdf-pages'
import { List, AutoSizer } from 'react-virtualized'
import 'pdfjs-dist'

window.PDFJS.workerSrc = '../node_modules/pdfjs-dist/build/pdf.worker.js'
window.PDFJS.cMapUrl = '../node_modules/pdfjs-dist/cmaps/'
window.PDFJS.cMapPacked = true

class PDFView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pages: null
    }
    this.handlePages = (pages) => {
      let count = pages.length
      pages.forEach((page) => {
        const { key, file } = page
        file
          .getPage(key)
          .then((p) => {
            page.width = p.getViewport(1).width
            page.height = p.getViewport(1).height
            count -= 1
            if (count < 1) this.setState({ pages })
          })
          .catch((error) => { throw error })
      })
    }
  }

  render () {
    return (
      <div style={{ height: '100%', width: '100%' }} >
        <PDF
          onError={e => console.error('pdf error', e)}
          url={this.props.filePath}
          style={{ height: '100%', width: '100%' }}
          onComplete={pages => this.handlePages(pages)}
        >
          {
            this.state.pages &&
              <AutoSizer>
                {({ height, width }) => {
                  const rowRenderer = ({ key, index, style }) => (
                    <div style={style} key={key}>
                      <Page
                        page={this.state.pages[index]}
                        key={this.state.pages[index].key}
                        onError={e => console.error('pdf page error', e)}
                      />
                    </div>
                  )
                  const rowHeight = ({ index }) => {
                    const page = this.state.pages[index]
                    return width * page.height / page.width
                  }
                  return (
                    <div key={height + width}>
                      <List
                        style={{ outline: 'none' }}
                        height={height - 8}
                        width={width}
                        rowCount={this.state.pages.length}
                        rowHeight={rowHeight}
                        rowRenderer={rowRenderer}
                      />
                    </div>
                  )
                }}
              </AutoSizer>
          }
        </PDF>
      </div>
    )
  }
}

export default PDFView
