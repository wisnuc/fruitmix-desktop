const EventEmitter = require('eventemitter3')
const remote = require('electron').remote

const path = remote.require('path')

const boxDB = require('./boxDB')

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
    this.DB = new boxDB(boxesPath, tweetsPath)

    /* load stored boxes data */
    this.getBoxes(guid).then(boxes => this.setState('boxes', boxes)).catch(e => this.error('getBoxes', e))
    this.reqBoxes(guid).catch(e => this.error('reqBoxes', e)) // TODO
  }

  error(type, err) {
    console.log('Error in Adapter', type, err)
  }

  /* request boxes, union previous data, and save to DB */
  async reqBoxes(guid) {
    const newboxes = await this.ctx.reqAsync('boxes', null)
    const preboxes = await this.getBoxes(guid)
    const boxes = newboxes // TODO
    await this.DB.saveBoxes(guid, boxes)
    this.setState('boxes', boxes)
  }

  /* request tweets, and save to tweetsDB */
  async reqTweets(args) {
    const { boxUUID, stationId } = args
    console.log('reqTweets box', args, this.state.boxes)
    const box = this.state.boxes.find(b => b.uuid === boxUUID)
    const lti = box.tweet.index // last tweet's index
    const lri = box.lri || 0 // last read index
    const ltsi = box.ltsi || 0 // the latest stored tweet's index
    const res = await this.ctx.reqAsync('tweets', { boxUUID, stationId, first: 0, last: ltsi, count: 0 })
    const docs = res.map(x => Object.assign({}, x, { _id: x.uuid, boxUUID, stationId }))
    await this.DB.saveTweets(docs)
  }

  async getBoxes(guid) {
    const boxes = this.state.boxes || (await this.DB.loadBoxes(guid))
    return boxes
  }

  async getTweets(boxUUID) {
    const tweets = await this.DB.loadTweets(boxUUID)

    /* update last read index */
    const lri = tweets.length ? tweets.slice(-1)[0].index : 0
    const index = this.state.boxes.findIndex(b => b.uuid === boxUUID)
    this.state.boxes[index].lri = lri
    // this.setState('boxes', this.state.boxes)
    console.log('loadTweets', boxUUID, this.state.boxes, tweets)
    return tweets
  }
}

module.exports = Adapter
