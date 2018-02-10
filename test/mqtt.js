const mqtt = require('mqtt')

// const client = mqtt.connect('mqtt://test.mosquitto.org')

const args = {
  clientId: 'client_pc_' + 'b20ea9c9-c9a6-4a4f-adde-c8f7c1c11884',
  clean: true,
  keepalive: 3,
  reconnectPeriod: 5 * 1000,
  connectTimeout: 10 * 1000
}

const client = mqtt.connect('mqtt://test.siyouqun.com:1883', args)

const topic = 'client/user/b20ea9c9-c9a6-4a4f-adde-c8f7c1c11884/box'

client.on('connect', (data) => {
  console.log('connected, current topic is', topic, data)
  client.subscribe(topic)

  client.publish(topic, `Hello mqtt, ${Math.round(Math.random() * 10)} !`)

  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
      // client.publish(topic, chunk.toString().replace(/^\s+|\s+$/g, ""))
    }
  })
})

client.on('message', (tpc, message) => {
  console.log('receive:', tpc, JSON.parse(message.toString())[0])
  // client.publish('presence', `Hello mqtt, ${Math.round(Math.random() * 10)}`)
  // client.end()
})
