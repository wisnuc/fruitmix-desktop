import React from 'react'
import UUID from 'node-uuid'
import { Paper } from 'material-ui'

class Layout extends React.PureComponent {

  constructor(props) {
    super(props)
    this.uuid = UUID.v4()
  }

  componentDidMount() {
    console.log(`Layout mounted ${this.uuid}`)
  }

  componentWillUnmount() {
    console.log(`Layout unmounting ${this.uuid}`)
  }

  render() {
    return (
      <div 
        id="this-is-layout"
        key="this-is-layout"
        style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
      >
        <Paper style={{width: this.props.hello ? '80%' : '60%', height: this.props.hello ? '80%' : '60%', transition: 'all 1s'}} onTouchTap={this.props.toggle}>
          { this.props.title }
          { this.props.children}
        </Paper> 
      </div>
    )
  }
}

class Frame01 extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Layout {...this.props.layoutProps} title="I am frame01" hello={true}>
        <div>Hello</div>
      </Layout>
    )
  }
}

class Frame02 extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Layout {...this.props.layoutProps} title="I am frame02" hello={false}>
        <div>Foo</div>
      </Layout>
    )
  }
}

class Frame extends React.Component {

  constructor(props) {
    super(props)

    this.state = { select: false }

    this.toggle = () => this.setState({ select: !this.state.select })
    this.layoutProps = { toggle: this.toggle }
  }

  render() {
   
    return this.state.select 
      ? <Frame01 layoutProps={this.layoutProps} />
      : <Frame02 layoutProps={this.layoutProps} />
  }
}

export default Frame
