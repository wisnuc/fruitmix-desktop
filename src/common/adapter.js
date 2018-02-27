const EventEmitter = require('eventemitter3')
const remote = require('electron').remote

const path = remote.require('path')

const BoxDB = require('./boxDB')

const unionBox = (a, b) => {
  const key = '_id'
  const keys = [...(new Set([...a.map(x => x[key]), ...b.map(x => x[key])].filter(x => !!x)))]
  const union = Array.from({ length: keys.length }).map((v, i) => {
    const id = keys[i]
    const aa = a.find(x => x[key] === id)
    const bb = b.find(x => x[key] === id)
    return !aa ? bb : !bb ? Object.assign({ deleted: true }, aa) : Object.assign({}, aa, bb)
  })
  return union
}

class Adapter extends EventEmitter {
  constructor(ctx) {
    super(ctx)
    this.ctx = ctx

    this.state = {
      boxes: null,
      tweets: []
    }
  }

  setState(name, nextState) {
    if (nextState && nextState[0]) console.log('this.updateBoxes in setState', name, nextState, nextState[0].lri, nextState[0].ltsi)
    const state = this.state
    this.state = Object.assign({}, state, { [name]: nextState })
    /* name, preState, nextState */
    this.emit(name, state, this.state)
  }

  init() {
    console.log('init', this, this.state, this.ctx)
    const { boxDir, guid } = this.ctx
    const boxesPath = path.join(boxDir, 'Boxes-v1.db')
    const tweetsPath = path.join(boxDir, `${guid}-Tweets-v1.db`)
    this.DB = new BoxDB(boxesPath, tweetsPath)

    this.getBoxes(guid).then(boxes => this.setState('boxes', boxes)).catch(e => this.error('getBoxes', e))
  }

  error(type, err) {
    console.log('Error in Adapter', type, err)
  }

  /* request boxes, union previous data, and save to DB */
  async reqBoxes(guid) {
    const newBoxes = await this.ctx.reqAsync('boxes', null)
    const preBoxes = await this.getBoxes(guid)
    const boxes = unionBox(preBoxes, newBoxes)
    await this.DB.saveBoxes(guid, boxes)
    this.setState('boxes', boxes)
  }

  /* request tweets, and save to tweetsDB */
  async reqTweets(args) {
    const { boxUUID, stationId } = args
    const box = this.state.boxes.find(b => b.uuid === boxUUID)
    const lti = box.tweet.index // last tweet's index
    const lri = box.lri > -1 ? box.lri : -1 // last read index
    const ltsi = box.ltsi > -1 ? box.ltsi : -1 // the latest stored tweet's index
    const props = { boxUUID, stationId }
    if (ltsi > -1) Object.assign(props, { first: 0, last: ltsi, count: 0 })
    const res = await this.ctx.reqAsync('tweets', props)
    console.log('reqTweets res', props, res)
    if (Array.isArray(res) && res.length) {
      const docs = [...res]
        .map(x => Object.assign({}, x, { _id: x.uuid, boxUUID, stationId }))
        .sort((a, b) => (a.index - b.index))
      await this.DB.saveTweets(docs)

      /* update the latest stored tweet's index */
      const bs = this.state.boxes
      const i = bs.findIndex(b => b.uuid === boxUUID)
      bs[i].ltsi = docs.slice(-1)[0].index
      this.setState('boxes', bs)
    }
  }

  async getBoxes(guid) {
    let boxes = this.state.boxes
    if (!boxes) {
      boxes = await this.DB.loadBoxes(guid)
      boxes.forEach(b => b.station.isOnline = true)
    }
    return boxes
  }

  async getTweets(boxUUID) {
    const tweets = await this.DB.loadTweets(boxUUID)

    /* update last read index */
    const lri = tweets.length ? tweets.slice(-1)[0].index : 0
    const index = this.state.boxes.findIndex(b => b.uuid === boxUUID)
    if (this.state.boxes[index].lri !== lri) {
      this.state.boxes[index].lri = lri
      this.setState('boxes', this.state.boxes)
    }
    return tweets
  }
}

module.exports = Adapter
