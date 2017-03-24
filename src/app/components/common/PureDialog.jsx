import React, { PropTypes } from 'react'
import EventListener from 'react-event-listener'
import keycode from 'keycode'
import { Paper } from 'material-ui'

const getStyles = props => ({
  dialogRoot: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    top: 0,
    left: props ? 0 : '-100%',
    zIndex: 1500,
    backgroundColor: 'none',
    transition: `left 0ms cubic-bezier(0.23, 1, 0.32, 1) ${props ? '0ms' : '450ms'}`
  },
  dialogWindow: {
    position: 'relative',
    zIndex: 1500,
    width: '75%',
    height: 100,
    maxWidth: '768px',
    margin: '0 auto',
    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    opacity: props ? 1 : 0,
    transform: props ? 'translate(0px, 64px)' : 'translate(0px, 0px)'
  },
  container: {

  },

  dialogContent: {
    zIndex: 1500,
    width: '100%',
    maxWidth: '768px',
    height: '100%',
    color: 'rgba(0, 0, 0, 0.870588)',
    backgroundColor: 'rgb(255, 255, 255)',
    boxSizing: 'border-box',
    boxShadow: 'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px',
    borderRadius: '2px'
  },
  overlay: {
    position: 'fixed',
    height: '100%',
    width: '100%',
    top: 0,
    left: props ? 0 : '-100%',
    opacity: props ? 1 : 0,
    backgroundColor: 'rgba(0, 0, 0, 0.541176)',
    willChange: 'opacity',
    transform: 'translateZ(0px)',
    transition: `left 0ms cubic-bezier(0.23, 1, 0.32, 1) ${props ? '0ms' : '400ms'},
      opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms`,
    zIndex: 1400
  }
})

export default class CDialog extends React.Component {
  static propTypes = {
    modal: PropTypes.bool,
    onRequestClose: PropTypes.func,
    open: PropTypes.bool.isRequired,
    containerClassName: PropTypes.string,
    containerStyle: PropTypes.object,
    overlayClassName: PropTypes.string,
    overlayStyle: PropTypes.object
  }
  constructor(props) {
    super(props)
    this.positionDialog = () => {
      if (!this.props.open) return

      const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      const dialogRoot = this.nodeRoot
      const dialogWindow = this.nodeDialogWindow
      const dialogContent = this.nodeDialogContent
      const minPaddingTop = 16

      dialogContent.style.height = ''
      dialogWindow.style.height = ''

      let paddingTop = ((clientHeight - dialogWindow.offsetHeight) / 2) - 64
      if (paddingTop < minPaddingTop) paddingTop = minPaddingTop
      dialogRoot.style.paddingTop = `${paddingTop}px`
    }

    this.requestClose = (buttonClicked) => {
      if (!buttonClicked && this.props.modal) return
      if (this.props.onRequestClose) {
        this.props.onRequestClose(!!buttonClicked)
      }
    }
    this.handleTouchTapOverlay = () => {
      this.requestClose(false)
    }

    this.handleKeyUp = (event) => {
      if (keycode(event) === 'esc') {
        this.requestClose(false)
      }
    }
    this.handleResize = () => {
      this.positionDialog()
    }
  }

  componentDidMount() {
    this.positionDialog()
  }

  componentDidUpdate() {
    this.positionDialog()
  }

  render() {
    const {
      open,
      containerClassName,
      containerStyle,
      overlayClassName,
      overlayStyle
    } = this.props
    const styles = getStyles(open)
    styles.container = Object.assign(styles.container, containerStyle)
    styles.overlay = Object.assign(styles.overlay, overlayStyle)
    return (
      <div
        style={styles.dialogRoot}
        ref={node => (this.nodeRoot = node)}
      >
        <div
          ref={node => (this.nodeDialogWindow = node)}
          style={styles.dialogWindow}
        >
          <div
            className={containerClassName}
            style={styles.container}
          >
            {
              open &&
                <div
                  ref={node => (this.nodeDialogContent = node)}
                  style={styles.dialogContent}
                >
                  <EventListener
                    target="window"
                    onKeyUp={this.handleKeyUp}
                    onResize={this.handleResize}
                  />
                  <Paper zDepth={4}>
                    {this.props.children}
                  </Paper>
                </div>
            }
          </div>
        </div>
        <div
          className={overlayClassName}
          style={styles.overlay}
          onTouchTap={this.handleTouchTapOverlay}
        />
      </div>
    )
  }
}
