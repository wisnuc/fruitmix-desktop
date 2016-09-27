var EventEmitter = require('events')

var mdns = require('mdns-js')
var validator = require('validator')
var request = require('superagent')

mdns.excludeInterface('0.0.0.0')

// return null if not wisnuc device
// otherwise return { model, serial }
const parseHostname = (hostname) => {

  if (typeof hostname !== 'string') return null

  var split = hostname.split('.')
  if (split.length !== 2) return null

  var name = split[0]
  var domain = split[1]

  split = split[0].split('-')
  if (split.length !== 3 || split[0] !== 'wisnuc')
    return null

  return {
    name,
    domain, 
    host: hostname,
    model: split[1],
    serial: split[2]
  }
}

class StationBrowser extends EventEmitter {

  constructor(browser) {

    super()

    browser.on('update', data => {

      if (!Array.isArray(data.addresses) || typeof data.host !== 'string')  
        return

      // check if ws host
      var parsed = parseHostname(data.host) 
      if (!parsed) return

      // set up hostname => ip address map
      data.addresses
        .filter(addr => validator.isIP(addr, 4))
        .forEach(addr => this.map.set(data.host, addr))

      // 
      let obj = Object.assign(parsed, {
        address: data.addresses[0]
      })

      this.updateStation(obj)
    }) 

    browser.on('ready', function () {
      console.log('mdns browser start discovering')
      browser.discover() 
    })

    this.browser = browser
    this.map = new Map()    
    this.stations = []
  }  

  updateStation (obj) {

    var index = this.stations.findIndex(stn => stn.name === obj.name)   
    if (index === -1) {
      this.stations = [...this.stations, obj]
      this.signal(null, obj)
    }
    else {
      var prev = this.stations[index]
      var curr = Object.assign({}, prev, obj)
      this.stations = [...this.stations.slice(0, index), curr, 
        ...this.stations.slice(index + 1)]
      this.signal(prev, curr)
    }

    var copy = [...this.stations]
    Object.freeze(copy)
    this.emit('stationUpdate', copy)
  }

  signal (prev, curr) {
    // when new station created
    if (prev === null) {

      request
        .get(`${curr.address}:3000/server`)
        .set('Accept', 'application/json')
        .end((err, res) => {

          if (err) 
            return this.updateStation({ name: curr.name, appifi: err })

          if (!res.ok)
            return this.updateStation({ name: curr.name, appifi: 'BAD' }) 

          let server = res.body

          // check appifi.docker object or null
          this.updateStation({ name: curr.name, appifi: res.body })
        })

      return
    }  

    // when station.appifi updated, AND docker started
    if (prev.appifi === undefined &&
        typeof curr.appifi === 'object' &&
        curr.appifi.docker) {

      request
        .get(`${curr.address}:3721/login`) 
        .set('Accept', 'application/json')
        .end((err, res) => {

          if (err || !res.ok)
            return this.updateStation({name: curr.name, fruitmix: 'ERROR'})

          let list = res.body
          this.updateStation({
            name: curr.name, 
            fruitmix: list.length ? 'INITIALIZED' : 'INITIAL'
          })
        })

      return
    }
  }

} // END OF CLASS

const createStationBrowser = () => {

  var browser = mdns.createBrowser(mdns.tcp('http'))
  return new StationBrowser(browser)
}

module.exports = createStationBrowser

var x = createStationBrowser().on('stationUpdate', data => console.log(data))

