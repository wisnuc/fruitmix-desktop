import React from 'react'
import Debug from 'debug'
import PDF, { Page } from 'react-pdf-pages'
import { List, AutoSizer } from 'react-virtualized'
import 'pdfjs-dist'

PDFJS.workerSrc = '../node_modules/pdfjs-dist/build/pdf.worker.js'
PDFJS.cMapUrl = '../node_modules/pdfjs-dist/cmaps/'
PDFJS.cMapPacked = true

const debug = Debug('component:file:preview: ')

class PDFView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pages: null,
      show: null
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

  render() {
    // debug('PDFView render', this.state, this.props)
    return (
      <div style={{ height: '100%', width: '100%' }} >
        <PDF
          onError={e => debug(e)}
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
                      <Page key={this.state.pages[index].key} page={this.state.pages[index]} onError={e => debug(e)} />
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
