const mqtt = require('mqtt')
const { ipcMain } = require('electron')
const { getMainWindow } = require('./window')

const server = 'mqtt://mqtt.siyouqun.com:1883'

class MQTT {
  constructor (clientId, topic, onMessage) {
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
  }

  start () {
    this.client = mqtt.connect(server, this.args)

    this.client.on('connect', (data) => {
      // console.log('connected, current topic is', this.topic, data)
      this.client.subscribe(this.topic)
    })

    this.client.on('message', (tpc, message) => {
      // console.log('receive:', tpc, JSON.parse(message.toString()))
      const msg = JSON.parse(message.toString())
      this.onMessage(msg)
    })
  }
}

const startMqtt = (event, args) => {
  // console.log('startMqtt', args)
  const { clientId, topic, session } = args
  const onMessage = msg => getMainWindow().webContents.send('MQTT_MSG', { session, msg })
  const handle = new MQTT(clientId, topic, onMessage)
  handle.start()
}

ipcMain.on('START_MQTT', startMqtt)
