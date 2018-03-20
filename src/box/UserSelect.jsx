import React from 'react'
import i18n from 'i18n'
import { Checkbox, Divider, CircularProgress } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import FlatButton from '../common/FlatButton'

class UserSelect extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: !this.props.users,
      fired: false,
      selected: [],
      users: this.props.users,
      defaultUsers: this.props.defaultUsers
    }

    this.fire = () => {
      this.setState({ fired: true })
      this.props.fire(this.state.selected)
    }

    this.getUsers = () => {
      this.props.getUsers((error, users) => {
        if (error) {
          console.error('this.getUsers error', error)
          this.setState({ loading: false, error: 'getUsers' })
        } else {
          const defaultUsers = this.props.defaultUsers.map(id => users.find(u => u.id === id)).filter(u => !!u)
          this.setState({ defaultUsers, users, loading: false })
        }
      })
    }
  }

  componentDidMount () {
    if (!this.props.users) this.getUsers()
  }

  togglecheckAll () {
    const { defaultUsers, users } = this.state
    if (this.state.selected.length < users.length - defaultUsers.length) {
      this.setState({ selected: users.filter(u => !defaultUsers.includes(u)) })
    } else {
      this.setState({ selected: [] })
    }
  }

  handleCheck (user) {
    const sl = this.state.selected
    const index = sl.indexOf(user)
    if (index === -1) this.setState({ selected: [...sl, user] })
    else this.setState({ selected: [...sl.slice(0, index), ...sl.slice(index + 1)] })
  }

  renderError () {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 180,
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.54)' }} />
          <div style={{ height: 8 }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.54)' }}> { i18n.__('Load Friends Error Text') } </div>
        </div>
      </div>
    )
  }

  renderLoading (size) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} />
      </div>
    )
  }

  render () {
    // console.log('UserSelect.jsx', this.props, this.state)
    const { title, onRequestClose, actionLabel, primaryColor } = this.props
    const { users, defaultUsers, loading, selected, error } = this.state
    const allSelected = users && defaultUsers && !loading &&
      this.state.selected.length === (users.length - defaultUsers.length) // TODO when users not includes defaultUsers

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

        {
          error ? this.renderError() : loading ? this.renderLoading(32)
            : (
              <div style={{ height: 40 * users.length + 48, maxHeight: 360 }}>
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
                <div style={{ height: 40 * users.length + 8, maxHeight: 320, overflow: 'auto' }}>
                  {
                    users.map(user =>
                      (
                        <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.id}>
                          <Checkbox
                            label={user.nickName}
                            iconStyle={{ fill: selected.includes(user) ? primaryColor : 'rgba(0, 0, 0, 0.54)' }}
                            labelStyle={{ fontSize: 14 }}
                            checked={selected.includes(user) || defaultUsers.includes(user)}
                            disabled={defaultUsers.includes(user)}
                            onCheck={() => this.handleCheck(user)}
                          />
                        </div>
                      ))
                  }
                  <div style={{ height: 8 }} />
                </div>
              </div>
            )
        }

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
            disabled={this.state.fired || (!this.props.nolenlmt && !this.state.selected.length) || loading || error}
          />
        </div>
      </div>
    )
  }
}

export default UserSelect
