const mqtt = require('mqtt')

// const client = mqtt.connect('mqtt://test.mosquitto.org')
const client = mqtt.connect('mqtt://10.10.9.90')

client.on('connect', () => {
  console.log('connected, current topic is \'presence\'')
  client.subscribe('presence')
  client.publish('presence', `Hello mqtt, ${Math.round(Math.random() * 10)} !`)

  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
      client.publish('presence', chunk.toString().replace(/^\s+|\s+$/g, ""))
    }
  })
})

client.on('message', (topic, message) => {
  console.log('receive:', message.toString())
  // client.publish('presence', `Hello mqtt, ${Math.round(Math.random() * 10)}`)
  // client.end()
})
