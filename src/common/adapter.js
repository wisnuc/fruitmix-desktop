const EventEmitter = require('eventemitter3')
const remote = require('electron').remote

const path = remote.require('path')
const Pouchdb = remote.require('pouchdb')
const Find = remote.require('pouchdb-find')

const DB = Pouchdb.plugin(Find)

class Adapter extends EventEmitter {
  constructor(ctx) {
    super(ctx)
    this.ctx = ctx

    this.state = {
      boxes: null,
      tweets: []
    }

    this.storeTweets = (docs, cb = () => {}) => {
      console.log('this.storeTweets', docs)
      this.tweetsDB.bulkDocs(docs).then(res => cb(null, res)).catch(cb)
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
    this.boxesDB = new DB(path.join(boxDir, `${guid}-Boxes`))
    this.tweetsDB = new DB(path.join(boxDir, `${guid}-Tweets`))

    /* load stored boxes data */
    this.loadBoxes().then(boxes => this.setState('boxes', boxes)).catch(e => this.error('loadBoxes', e))
    this.reqBoxes().catch(e => this.error('reqBoxes', e)) // TODO
  }

  error(type, err) {
    console.log('Error in Adapter', type, err)
  }

  async deleteBox(boxUUID) {
    const doc = await this.boxesDB.get(boxUUID)
    await this.boxesDB.remove(doc)
  }

  /* request boxes, and save to boxesDB */
  async reqBoxes() {
    const res = await this.ctx.reqAsync('boxes', null)
    const boxes = res.map(x => Object.assign({}, x, { _id: x.uuid, __v: undefined }))
    this.storeBoxes(boxes).catch(e => console.log('storeBoxes error', e))
  }

  /* request tweets, and save to tweetsDB */
  async reqTweets(args) {
    const { boxUUID, stationId } = args
    const box = await this.boxesDB.get(boxUUID)
    console.log('reqTweets box', box)
    const lti = box.tweet.index // last tweet's index
    const lri = box.lri || 0 // last read index
    const ltsi = box.ltsi || 0 // the latest stored tweet's index
    const res = await this.ctx.reqAsync('tweets', { boxUUID, stationId, first: 0, last: ltsi, count: 0 })
    const tweets = res.map(x => Object.assign({}, x, { _id: x.uuid, boxUUID }))
    this.storeTweets(tweets)
  }

  async storeBoxes(docs) {
    console.log('this.storeBoxes', docs)
    await this.boxesDB.bulkDocs(docs)
  }

  async loadBoxes() {
    let boxes = this.state.boxes
    if (!boxes) {
      const res = await this.boxesDB.allDocs({
        include_docs: true,
        attachments: true,
        binary: true
      })
      boxes = res.rows.map(r => r.doc)
      console.log('first loadBoxes', boxes)
    }
    return boxes
  }

  async loadTweets(boxUUID) {
    await this.tweetsDB.createIndex({ index: { fields: ['ctime'] } })
    const tweets = (await this.tweetsDB.find({
      selector: { boxUUID, ctime: { $gte: null } },
      sort: ['ctime']
    })).docs

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
