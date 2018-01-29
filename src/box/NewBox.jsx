import React from 'react'
import i18n from 'i18n'
import { Checkbox, Divider } from 'material-ui'
import FlatButton from '../common/FlatButton'

class NewBox extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selected: []
    }

    this.fire = () => {
      this.setState({ loading: true })
      const args = { name: '', users: this.state.selected }
      this.props.apis.pureRequest('createBox', args, (err) => {
        if (err) {
          console.log('Create Box error', err)
          this.setState({ errorText: i18n.__('Create Box Failed'), loading: false })
        } else {
          this.props.onRequestClose(true)
          this.props.openSnackBar(i18n.__('Create Box Success'))
          this.props.refresh()
        }
      })
    }
  }

  renderUser(user) {
    const { name } = user
    return (
      <div style={{ height: 48, width: '100%' }}>

      </div>
    )
  }

  togglecheckAll() {
    const users = this.props.apis.users && this.props.apis.users.data.filter(u => !!u.global) || []
    if (this.state.selected.length < users.length) {
      this.setState({ selected: users.map(u => u.global.id) })
    } else {
      this.setState({ selected: [] })
    }
  }

  handleCheck(userUUID) {
    const sl = this.state.selected
    const index = sl.indexOf(userUUID)
    if (index === -1) this.setState({ selected: [...sl, userUUID] })
    else this.setState({ selected: [...sl.slice(0, index), ...sl.slice(index + 1)] })
  }

  render() {
    const users = this.props.apis.users && this.props.apis.users.data.filter(u => !!u.global) || []
    return (
      <div style={{ width: 336, padding: '24px 24px 0px 24px', zIndex: 2000 }}>

        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>{ i18n.__('Create New Box') }</div>

        <div style={{ height: 24 }} />

        <div
          style={{
            height: 32,
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(0,0,0,0.54)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          { i18n.__('Select Users') }
        </div>

        <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key="all" >
          <Checkbox
            label={i18n.__('All Users')}
            labelStyle={{ fontSize: 14 }}
            iconStyle={{ fill: this.state.selected.length === users.length ? this.props.primaryColor : 'rgba(0, 0, 0, 0.54)' }}
            checked={this.state.selected.length === users.length}
            onCheck={() => this.togglecheckAll()}
          />
        </div>
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ maxHeight: 40 * 8, overflow: 'auto' }}>
          {
            users.map(user =>
              (
                <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username} >
                  <Checkbox
                    label={user.username}
                    iconStyle={{ fill: this.state.selected.includes(user.global.id) ? this.props.primaryColor : 'rgba(0, 0, 0, 0.54)' }}
                    labelStyle={{ fontSize: 14 }}
                    checked={this.state.selected.includes(user.global.id)}
                    onCheck={() => this.handleCheck(user.global.id)}
                  />
                </div>
              ))
          }
          <div style={{ height: 8 }} />
        </div>

        {/* button */}
        <div style={{ height: 16 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton
            primary
            label={i18n.__('Cancel')}
            onTouchTap={this.props.onRequestClose}
          />
          <FlatButton
            primary
            label={i18n.__('Create')}
            disabled={!!this.state.errorText || this.state.loading || !this.state.selected.length}
            onTouchTap={this.fire}
          />
        </div>
      </div>
    )
  }
}

export default NewBox
