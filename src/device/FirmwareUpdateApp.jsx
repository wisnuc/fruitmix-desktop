import React from 'react'
import i18n from 'i18n'
import { Divider, CircularProgress } from 'material-ui'
import UpdateIcon from 'material-ui/svg-icons/action/system-update-alt'
import NewReleases from 'material-ui/svg-icons/av/new-releases'
import CheckIcon from 'material-ui/svg-icons/navigation/check'
import { green500, orange500, grey500 } from 'material-ui/styles/colors'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'
import ErrorBox from '../common/ErrorBox'

const compareVerison = (a, b) => {
  const aArray = a.split('.')
  const bArray = b.split('.')

  const len = Math.min(aArray.length, bArray.length)
  for (let i = 0; i < len; i++) {
    if (parseInt(aArray[i], 10) > parseInt(bArray[i], 10)) return 1
    if (parseInt(aArray[i], 10) < parseInt(bArray[i], 10)) return -1
  }
  if (aArray.length > bArray.length) return 1
  if (aArray.length < bArray.length) return -1
  return 0
}

class Firm extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      showError: false
    }

    this.toggleDialog = (op) => {
      this.setState({ [op]: !this.state[op] })
    }

    this.refresh = () => {
      this.props.refresh()
    }

    this.install = (tagName) => {
      this.setState({ loading: true, confirm: false })
      this.props.selectedDevice.pureRequest('installAppifi', { tagName }, (error) => {
        if (error) {
          console.log('install appifi error', error)
          this.props.openSnackBar(i18n.__('Operation Failed'))
        } else {
          this.props.openSnackBar(i18n.__('Operation Success'))
        }
        this.setState({ loading: 'false' })
        this.refresh()
      })
    }

    this.handleAppifi = (state) => {
      this.props.selectedDevice.pureRequest('handleAppifi', { state }, (error) => {
        if (error) {
          console.log('handleAppifi error', error)
          this.props.openSnackBar(i18n.__('Operation Failed'))
        } else {
          this.props.openSnackBar(i18n.__('Operation Success'))
        }
        this.refresh()
      })
    }

    this.handleRelease = (tagName, state) => {
      this.props.selectedDevice.pureRequest('handleRelease', { tagName, state }, (error) => {
        if (error) {
          console.log('handleRelease error', error)
          this.props.openSnackBar(i18n.__('Operation Failed'))
        } else {
          this.props.openSnackBar(i18n.__('Operation Success'))
        }
        this.refresh()
      })
    }

    this.confirmInstall = (tagName) => {
      this.setState({ confirm: tagName })
    }
  }

  componentDidMount() {
    this.timer = setInterval(() => this.refresh(), 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  parseReleaseState(state, tagName) {
    let label = ''
    let action = null
    let text = ''
    let color = ''
    switch (state) {
      case 'Idle':
        label = i18n.__('Download')
        action = () => this.handleRelease(tagName, 'Ready')
        text = i18n.__('Release Idle')
        color = grey500
        break
      case 'Failed':
        label = i18n.__('Retry')
        action = () => this.handleRelease(tagName, 'Ready')
        text = i18n.__('Release Failed')
        color = orange500
        break
      case 'Ready':
        label = i18n.__('Install')
        action = () => this.confirmInstall(tagName)
        text = i18n.__('Release Ready')
        color = green500
        break
      case 'Downloading':
        label = i18n.__('Stop Download')
        action = () => this.handleRelease(tagName, 'Idle')
        text = i18n.__('Release Downloading')
        color = grey500
        break
      case 'Repacking':
        text = i18n.__('Release Repacking')
        color = grey500
        break
      case 'Verifying':
        text = i18n.__('Release Verifying')
        color = grey500
        break
      default:
    }
    return ({ label, text, color, action })
  }

  parseAppifiState(state, tagName) {
    let label = ''
    let color = ''
    let text = ''
    let action = null
    switch (state) {
      case 'Failed':
        label = i18n.__('Retry')
        text = i18n.__('Appifi Failed')
        color = orange500
        action = () => this.install(tagName)
        break
      case 'Started':
        label = i18n.__('Stop')
        text = i18n.__('Appifi Stared')
        color = green500
        action = () => this.handleAppifi('Stopped')
        break
      case 'Starting':
        label = i18n.__('Stop')
        text = i18n.__('Appifi Starting')
        color = green500
        break
      case 'Stopping':
        label = i18n.__('Start')
        text = i18n.__('Appifi Stopping')
        color = grey500
        break
      case 'Stopped':
        label = i18n.__('Start')
        text = i18n.__('Appifi Stopped')
        color = grey500
        action = () => this.handleAppifi('Started')
        break
      default:
    }
    return ({ label, color, text, action })
  }

  renderReleases(release, current) {
    const { state, view, remote, local } = release
    const rel = remote || local
    if (!rel) return (<div />)

    const show = !current || compareVerison(rel.tag_name, current) > 0
    const date = rel.published_at.split('T')[0]
    const { label, text, color, action } = this.parseReleaseState(state, rel.tag_name)
    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ flex: '0 0 24px' }} />
        <div style={{ flex: '0 0 56px', marginTop: 12 }} >
          { show ? <NewReleases color={this.props.primaryColor} /> : <CheckIcon color={this.props.primaryColor} /> }
        </div>
        {
          show ?
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
                <div style={{ fontSize: 20, marginRight: 32 }}>
                  { i18n.__('New Version Detected %s', rel.tag_name) }
                </div>
                <div style={{ fontSize: 14, color, marginRight: 8, border: `1px ${color} solid`, padding: '0px 8px' }}> { text } </div>
                {
                  state === 'Failed' && <ErrorBox
                    error={view}
                    iconStyle={{ color: orange500 }}
                  />
                }
                {
                  view && view.length !== 'unknown' && !!view.bytesWritten &&
                    <div style={{ marginLeft: 24 }}> { `${Math.round(view.bytesWritten * 100 / view.length)} %` } </div>
                }
              </div>
              <div style={{ display: 'flex', alignItems: 'center', height: 44 }}>
                {
                  action ? <FlatButton primary label={label} onTouchTap={action} style={{ margin: '8px 0px 0px -8px' }} />
                  : <CircularProgress size={24} thickness={2} style={{ marginLeft: 8 }} />
                }
              </div>
              <div style={{ height: 16 }} />
              <div> { i18n.__('Publish Date %s', date) } </div>
              <div style={{ height: 16 }} />
              {/*
              <div> { i18n.__('Updates') } </div>
              <div style={{ height: 8 }} />
              {
                rel.body ? rel.body.split(/[1-9]\./).map(list => list && (
                  <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }} key={list}>
                    { '*' }
                    <div style={{ width: 16 }} />
                    { list }
                  </div>
                ))
                  :
                <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }}>
                  { '*' }
                  <div style={{ width: 16 }} />
                  { i18n.__('Bug Fixes') }
                </div>
              }
              */}
              <div style={{ height: 16 }} />
              <Divider style={{ marginLeft: -60 }} />
            </div>
            :
            <div style={{ marginTop: 12 }} >
              { i18n.__('Already LTS Text') }
            </div>
        }
      </div>
    )
  }

  renderFirm(firm) {
    const { appifi, releases } = firm
    const { state, tagName } = appifi || {}
    const { label, color, text, action } = this.parseAppifiState(state, tagName)
    return (
      <div>
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ flex: '0 0 24px' }} />
          <div style={{ flex: '0 0 56px' }} >
            <UpdateIcon color={this.props.primaryColor} />
          </div>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: 20, marginRight: 32 }}>
                { tagName ? i18n.__('Current Firmware Version %s', tagName) : i18n.__('No Appifi') }
              </div>
              {
                text &&
                  <div style={{ fontSize: 14, color, marginRight: 8, border: `1px ${color} solid`, padding: '0px 8px' }}>
                    { text }
                  </div>
              }
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: 44 }}>
              {
                appifi && (
                  action ? <FlatButton primary label={label} onTouchTap={action} style={{ margin: '8px 0px 0px -12px' }} />
                  : <CircularProgress size={24} thickness={2} style={{ marginLeft: 8 }} />
                )
              }
            </div>
            <div style={{ height: 16 }} />
            <Divider style={{ marginLeft: -60 }} />
            <div style={{ height: 16 }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { releases[0] && this.renderReleases(releases[0], tagName) }
        </div>
      </div>
    )
  }

  renderError() {
    const error = this.props.error
    console.log('error', error)
    return (
      <div>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <div style={{ flex: '0 0 24px' }} />
          <div style={{ flex: '0 0 56px', display: 'flex', alignItems: 'center' }} >
            <UpdateIcon color={this.props.primaryColor} />
          </div>
          <div style={{ width: '100%' }}>
            <ErrorBox
              error={error}
              iconStyle={{ color: orange500 }}
              text={i18n.__('Get Firmware Data Error Text')}
              style={{ display: 'flex', width: '100%', alignItems: 'center', marginTop: -6 }}
            />
          </div>
        </div>
        {/* Error Tips */}
        <div style={{ margin: '8px 0px 8px 80px' }}>
          { i18n.__('Firmware Error Text') }
        </div>
      </div>
    )
  }

  renderLoading() {
    return (
      <div style={{ width: '100%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={32} thickness={3} />
      </div>
    )
  }

  render() {
    const { firm, error } = this.props
    if (!firm && !error) return this.renderLoading()

    return (
      <div style={{ height: '100%', margin: 16 }}>
        <div style={{ height: 24 }} />
        { error ? this.renderError() : this.renderFirm(firm) }
        {/* dialog */}
        <DialogOverlay open={!!this.state.confirm} >
          {
            this.state.confirm &&
              <div style={{ width: 560, padding: '24px 24px 0px 24px' }}>
                <div style={{ fontSize: 21, fontWeight: 500 }}>
                  { i18n.__('Install Firmware') }
                </div>
                <div style={{ height: 20 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
                  { i18n.__('Install Firmware Text 1 %s', this.state.confirm) }
                </div>
                <div style={{ height: 8 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }} >
                  { i18n.__('Install Firmware Text 2') }
                </div>
                <div style={{ height: 24 }} />
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                  <FlatButton
                    label={i18n.__('Cancel')}
                    primary
                    onTouchTap={() => this.toggleDialog('confirm')}
                  />
                  <FlatButton
                    label={i18n.__('Confirm')}
                    primary
                    onTouchTap={() => this.install(this.state.confirm)}
                  />
                </div>
              </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Firm
