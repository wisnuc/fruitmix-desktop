import i18n from 'i18n'
import NewFolderDialog from '../file/NewFolderDialog'

class NewBox extends NewFolderDialog {
  constructor(props) {
    super(props)

    this.handleChange = (value) => {
      this.setState({ value, errorText: '' })
    }

    this.fire = () => {
      this.setState({ loading: true })
      const args = { name: this.state.value, users: [this.props.guid] }
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
}

export default NewBox
