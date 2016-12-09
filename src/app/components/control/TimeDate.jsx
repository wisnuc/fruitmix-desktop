import React from 'react'
import { CircularProgress } from 'material-ui'
import request from 'superagent'

class TimeDate extends React.Component {

  constructor(props) {

    super(props)
    this.state = { data: null }

    this.properties = [
      'Local time',
      'Universal time',
      'RTC time',
      'Time zone',
      'NTP synchronized',
      'Network time on'
    ]

    let { device, selectIndex } = window.store.getState().login
    if (Array.isArray(device) && Number.isInteger(selectIndex) && device[selectIndex])
      this.address = device[selectIndex].address
    else
      this.address = null
  }

  componentDidMount() {

    if (!this.address) return

    this.timer = setInterval(() => 
      request
        .get(`http://${this.address}:3000/system/timedate`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) return
          this.setState(Object.assign({}, this.state, { data: res.body }))
        })     
    , 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
    delete this.timer
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{paddingTop: 48, paddingLeft: 72, width: 440}}>
          { this.state.data ? 
            this.properties.map(prop => ({
              key: prop,
              value: this.state.data[prop] || '(none)' 
            }))
            .reduce((prev, curr) => [...prev, (
              <div style={{width: '100%', height: 40, display: 'flex', alignItems: 'center',
                fontSize: 14, color: 'rgba(0, 0, 0, 0.87)'}}>
                <div style={{flex: '0 0 160px'}}>{curr.key}</div>
                <div>{curr.value}</div> 
              </div>
            )], []) : <CircularProgress />
          }
        </div>
      </div>
    )
  }
}

export default TimeDate

