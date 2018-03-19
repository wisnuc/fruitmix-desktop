const mdns = require('mdns-js')
const { ipcMain } = require('electron')

mdns.excludeInterface('0.0.0.0')

/** mdns data example
{
  addresses: [ '192.168.5.60' ],
  query: [ '_http._tcp.local' ],
  type: [
    {
      name: 'http',
      protocol: 'tcp',
      subtypes: [],
      description: 'Web Site'
    },
    {
      name: 'http',
      protocol: 'tcp',
      subtypes: [],
      description: 'Web Site'
    }
  ],
  txt: [ '', '' ],
  port: 3000,
  fullname: 'WISNUC AppStation #2._http._tcp.local',
  host: 'wisnuc-generic-04AF2BFC.local',
  interfaceIndex: 0,
  networkInterface: 'enp14s0'
}
*/

/* return null if not wisnuc device, otherwise return { model, serial } */
const parseHostname = (hostname) => {
  if (typeof hostname !== 'string') return null

  let split = hostname.split('.')
  if (split.length !== 2) return null

  const name = split[0]
  const domain = split[1]

  split = split[0].split('-')
  if (split.length < 3 || split[0] !== 'wisnuc') { return null }

  return {
    name,
    domain,
    host: hostname,
    model: split[1],
    serial: split[2]
  }
}

let browser = null

ipcMain.on('MDNS_SCAN', (event, session) => {
  if (browser) browser.stop()
  const b = mdns.createBrowser(mdns.tcp('http'))
  b.on('ready', () => b.discover())
  b.on('update', (data) => {
    if (!Array.isArray(data.addresses) || data.addresses.length === 0 || typeof data.host !== 'string') return

    const parsed = parseHostname(data.host)
    if (parsed) {
      const message = Object.assign(parsed, { address: data.addresses[0] })
      // console.log('mdns send message', message)

      event.sender.send('MDNS_UPDATE', session, message)
    }
  })

  browser = b
})

module.exports = browser
