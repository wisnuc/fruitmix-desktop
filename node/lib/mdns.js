var EventEmitter = require('events')
var request = require('request')
var mdns = require('mdns-js')
var validator = require('validator')
var request = require('superagent')
var UUID = require('node-uuid')
var debug = require('debug')('mdns')

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
      // console.log(data)

      debug('mdns update', data)

      if (!Array.isArray(data.addresses) || typeof data.host !== 'string')  
        return

      debug('mdns addresses', data.addresses)

      if (data.addresses.includes('192.168.5.65')) {
        // 801L5C00748
        let mock = { 
          name: 'wisnuc-ws215i-801L5C00748',
          domain: 'local',
          host: 'wisnuc-ws215i-801L5C00748.local',
          model: 'ws215i',
          serial: '801L5C00748',
          address: '192.168.5.65' 
        }

        return this.updateStation(mock)
      }

      // check if ws host
      var parsed = parseHostname(data.host) 
      if (!parsed) {
        debug('parse host name failed', data.host)
        return 
      }

      // set up hostname => ip address map
      data.addresses
      .filter(addr => validator.isIP(addr, 4))
      .forEach(addr => this.map.set(data.host, addr))

      // 
      let obj = Object.assign(parsed, {
        address: data.addresses[0]
      })


      debug('new station found', obj)
      this.updateStation(obj)
    }) 

    browser.on('ready', function () {
      console.log('mdns browser start discovering')
      browser.discover() 
    })

    this.browser = browser
    this.map = new Map()    
    this.stations = []

    this.interval = -1
  }  

  updateStation (obj) {

    var index = this.stations.findIndex(stn => stn.name === obj.name)   
    if (index === -1) {
      this.stations = [...this.stations, obj]
      this.signal(null, obj)

      // TODO
      if (this.interval === -1) {
        this.interval = setInterval(() => {
          this.watch()
        }, 3000)
      }
    }
    else {
      var prev = this.stations[index]
      var curr = Object.assign({}, prev, obj)
      this.stations = [...this.stations.slice(0, index), curr, 
      ...this.stations.slice(index + 1)]
      this.signal(prev, curr)

      if (prev.appifi && curr.appifi && 
        !!prev.appifi.docker === !!curr.appifi.docker &&
        prev.fruitmix === curr.fruitmix)
        return

      var copy = [...this.stations]

      debug('station update', copy)
      Object.freeze(copy)
      this.emit('stationUpdate', copy)
    }
  }

  signal (prev, curr) {
    // when new station created
    if (prev === null) {

      request
      .get(`${curr.address}:3000/server`)
      .set('Accept', 'application/json')
      .end((err, res) => {

        if (err) 
          return this.updateStation({ name: curr.name, appifi: 'ERROR' })

        if (!res.ok)
          return this.updateStation({ name: curr.name, appifi: 'ERROR' }) 

        this.getBlockMessage(curr.address,(data) => {
            // check appifi.docker object or null
            this.updateStation({ name: curr.name, appifi: res.body, mir:data.mir, boot:data.boot })
          })
      })

      return
    }  
    if (curr.appifi == 'ERROR') {
      return
    }
    // if (curr.boot == undefined) {
    //   return
    // }
    // when station.appifi updated, AND docker started
    if (prev.appifi === undefined &&
      typeof curr.appifi === 'object') {

      request
        .get(`${curr.address}:3721/login`) 
        .set('Accept', 'application/json')
        .end((err, res) => {

          if (err || !res.ok)
            return this.updateStation({name: curr.name, fruitmix: 'ERROR'})

          let list = res.body
          var colorArr = ['#FFC107','#8BC34C','#00bcd4']
          list.forEach(item => {
            item.checked = false
            let randomNumber = Math.random()
            if (randomNumber< 0.33) {
              item.color = colorArr[0]
            }else if (randomNumber < 0.66) {
              item.color = colorArr[1]
            }else {
              item.color = colorArr[2]
            }
          })
          this.updateStation({
            name: curr.name, 
            fruitmix: list.length ? 'INITIALIZED' : 'INITIAL',
            users:list.length?list:[]
          })
        })

      return
    }
  }

  getBlockMessage(ip,callback) {
    let mir = null
    let boot = null
    request
    .get(`${ip}:3000/system/storage`)
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (!err && res.ok) {
        mir = res.body
      }else {
        mir = null
      }
      request
      .get(`${ip}:3000/system/boot`)
      .set('Accept', 'application/json')
      .end((err, b) => {
        if (!err && res.ok) {
          boot = b.body
        }else {
          boot = null
        }
        callback({mir,boot})
      })
    })
  }

// EHOSTUNREACH
// ECONNRESET
// ECONNREFUSED

watch () {
    // console.log('watch...')

    this.stations.forEach(stn => {

      let appifi, fruitmix, mir, boot, list
      if (stn.appifi) {

        request
        .get(`${stn.address}:3000/server`)
        .set('Accept', 'application/json')
        .end((err, res) => {

          if (err || !res.ok) 
            return this.updateStation({ name: stn.name, appifi: 'ERROR' })

          appifi = res.body
            // if (!appifi.docker) {
            //   return this.updateStation({ name: stn.name, appifi, fruitmix: undefined })  
            // }
            this.getBlockMessage(stn.address,(data) => {

              mir = data.mir
              boot = data.boot

              request
              .get(`${stn.address}:3721/login`) 
              .set('Accept', 'application/json')
              .end((err, res) => {

                if (err || !res.ok)
                  return this.updateStation({name: stn.name, appifi, fruitmix: 'ERROR', mir, boot})

                list = res.body
                if (!stn.users) {
                  var colorArr = ['#FFC107','#8BC34C','#00bcd4']
                  list.forEach(item => {
                    item.checked = false
                    let randomNumber = Math.random()
                    if (randomNumber< 0.33) {
                      item.color = colorArr[0]
                    }else if (randomNumber < 0.66) {
                      item.color = colorArr[1]
                    }else {
                      item.color = colorArr[2]
                    }
                  })
                }else {
                  list = stn.users
                }
                this.updateStation({
                  name: stn.name, 
                  appifi,
                  fruitmix: list.length ? 'INITIALIZED' : 'INITIAL',
                  users:list,
                  mir:mir,
                  boot:boot
                })
              })
            })
          })
      } 
    })
  }

} // END OF CLASS

const createStationBrowser = () => {

  var browser = mdns.createBrowser(mdns.tcp('http'))
  return new StationBrowser(browser)
}

module.exports = createStationBrowser

// var x = createStationBrowser().on('stationUpdate', data => {
//   console.log(new Date())
//   console.log(data)
// })
