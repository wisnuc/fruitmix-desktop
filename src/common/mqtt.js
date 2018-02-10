const mqtt = require('mqtt')

const server = 'mqtt://test.siyouqun.com:1883'

class MQTT {
  constructor(clientId, topic, onMessage) {
    this.clientId = this.clientId
    this.topic = topic
    this.onMessage = onMessage

    this.args = {
      clientId,
      clean: true,
      keepalive: 3,
      reconnectPeriod: 5 * 1000,
      connectTimeout: 10 * 1000
    }

    this.client = mqtt.connect(server, this.args)

    this.client.on('connect', (data) => {
      console.log('connected, current topic is', topic, data)
      this.client.subscribe(topic)
    })

    this.client.on('message', (tpc, message) => {
      console.log('receive:', tpc, JSON.parse(message.toString())[0])
      try {
        const msg = JSON.parse(message.toString())
        this.onMessage(msg)
      } catch (e) {
        console.log('handle mqtt msg error', e)
      }
    })
  }
}

export default MQTT
