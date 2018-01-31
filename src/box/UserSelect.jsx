import React from 'react'
import i18n from 'i18n'
import { Checkbox, Divider } from 'material-ui'
import FlatButton from '../common/FlatButton'

class UserSelect extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      fired: false,
      selected: []
    }

    this.fire = () => {
      this.setState({ fired: true })
      this.props.fire(this.state.selected)
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
    const { defaultUsers, users } = this.props
    if (this.state.selected.length < users.length - defaultUsers.length) {
      this.setState({ selected: users.filter(u => !defaultUsers.includes(u)) })
    } else {
      this.setState({ selected: [] })
    }
  }

  handleCheck(user) {
    const sl = this.state.selected
    const index = sl.indexOf(user)
    if (index === -1) this.setState({ selected: [...sl, user] })
    else this.setState({ selected: [...sl.slice(0, index), ...sl.slice(index + 1)] })
  }

  render() {
    console.log('UserSelect.jsx', this.props)
    const { users, title, onRequestClose, actionLabel, primaryColor, defaultUsers } = this.props
    const allSelected = this.state.selected.length === (users.length - defaultUsers.length) // TODO when users not includes defaultUsers
    return (
      <div style={{ width: 336, padding: '24px 24px 0px 24px', zIndex: 2000 }}>

        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>{ title }</div>

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
            iconStyle={{ fill: allSelected ? primaryColor : 'rgba(0, 0, 0, 0.54)' }}
            checked={allSelected}
            onCheck={() => this.togglecheckAll()}
          />
        </div>
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ maxHeight: 40 * 8, overflow: 'auto' }}>
          {
            users.map(user =>
              (
                <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username || user} >
                  <Checkbox
                    label={user.username || user}
                    iconStyle={{ fill: this.state.selected.includes(user) ? primaryColor : 'rgba(0, 0, 0, 0.54)' }}
                    labelStyle={{ fontSize: 14 }}
                    checked={this.state.selected.includes(user) || this.props.defaultUsers.includes(user)}
                    disabled={this.props.defaultUsers.includes(user)}
                    onCheck={() => this.handleCheck(user)}
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
            onTouchTap={onRequestClose}
          />
          <FlatButton
            primary
            label={actionLabel}
            onTouchTap={this.fire}
            disabled={this.state.fired || !this.state.selected.length}
          />
        </div>
      </div>
    )
  }
}

export default UserSelect
