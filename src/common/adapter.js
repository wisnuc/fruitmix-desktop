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
      boxes: null
    }
  }

  updateBoxes(boxes, noSave) {
    const state = this.state
    this.state = Object.assign({}, this.state, { boxes })
    if (!noSave) {
      this.DB.saveBoxes(this.ctx.guid, boxes).catch(e => console.log('saveBoxes error', boxes, e))
    }
    this.emit('boxes', state, this.state)
  }

  init() {
    console.log('init', this, this.state, this.ctx)
    const { boxDir, guid } = this.ctx
    const boxesPath = path.join(boxDir, 'Boxes-v1.db')
    const tweetsPath = path.join(boxDir, `${guid}-Tweets-v1.db`)
    const draftsPath = path.join(boxDir, `${guid}-Drafts-v1.db`)
    this.DB = new BoxDB(boxesPath, tweetsPath, draftsPath)

    this.getBoxes(guid).then(boxes => this.updateBoxes(boxes, true)).catch(e => this.error('getBoxes', e))
  }

  error(type, err) {
    console.log('Error in Adapter', type, err)
  }

  /* request boxes, union previous data, and save to DB */
  async reqBoxes() {
    const newBoxes = await this.ctx.reqAsync('boxes', null)
    const preBoxes = await this.getBoxes()
    const boxes = unionBox(preBoxes, newBoxes)
    this.updateBoxes(boxes)
    console.log('reqBoxes', boxes)
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const ltsi = box.ltsst && box.ltsst.index
      const lti = box.tweet && box.tweet.index || Infinity // last tweet's index
      if (ltsi === undefined || (box.tweet.index > ltsi)) {
        await this.reqTweets({ boxUUID: box.uuid, stationId: box.stationId })
      }
    }
  }

  async deleteBox(boxUUID) {
    const boxes = await this.getBoxes()
    const index = boxes.findIndex(b => b.uuid === boxUUID)
    if (index > -1) {
      const rest = [...boxes.slice(0, index), ...boxes.slice(index + 1)]
      this.updateBoxes(rest)
    } else throw Error(`no such box with uuid: ${boxUUID}`)
  }

  /* request tweets, and save to tweetsDB */
  async reqTweets(args) {
    const { boxUUID, stationId } = args
    const box = this.state.boxes.find(b => b.uuid === boxUUID)
    const ltsi = box.ltsst && box.ltsst.index // the latest stored tweet's index
    const props = { boxUUID, stationId }
    if (ltsi !== undefined) Object.assign(props, { first: 0, last: ltsi, count: 0 })
    const res = await this.ctx.reqAsync('tweets', props)
    console.log('reqTweets res', props, res)
    if (Array.isArray(res) && res.length) {
      const docs = [...res]
        .map(x => Object.assign({}, x, { _id: x.uuid, boxUUID, stationId }))
        .sort((a, b) => (a.index - b.index))
      await this.DB.saveTweets(docs)

      /* update the latest stored tweet and its index */
      const bs = this.state.boxes
      const i = bs.findIndex(b => b.uuid === boxUUID)
      bs[i].ltsst = docs.slice(-1)[0] // latest stored tweet
      console.log('update latest stored tweet', bs[i].ltsst)
      this.updateBoxes(bs)
    }
  }

  async getBoxes() {
    let boxes = this.state.boxes
    if (!boxes) {
      boxes = await this.DB.loadBoxes(this.ctx.guid)
      boxes.forEach(b => b.station.isOnline = true)
    }
    return boxes
  }

  async getTweets(boxUUID) {
    const trueTweets = await this.DB.loadTweets(boxUUID)
    const drafts = await this.DB.loadDrafts(boxUUID)

    console.log('async getTweets trueTweets drafts', boxUUID, trueTweets, drafts)

    /* remove finished drafts */
    for (let i = 0; i < drafts.length; i++) {
      const t = drafts[i]
      if (t.trueUUID) { // already finished
        const index = trueTweets.findIndex(tt => tt.uuid === t.trueUUID) // already stored
        if (index > -1) await this.DB.deleteDraft(t._id)
        drafts[i] = null
      } else if (new Date().getTime() - t.ctime > 120000) { // set old tweets to failed state
        drafts[i].failed = true
      }
    }

    const tweets = [...trueTweets, ...drafts.filter(v => !!v)]

    console.log('getTweets', trueTweets, drafts)

    /* update last read index */
    const lri = tweets.length ? tweets.slice(-1)[0].index : -1
    const index = this.state.boxes.findIndex(b => b.uuid === boxUUID)
    if (!this.state.boxes[index].lri || (this.state.boxes[index].lri !== lri)) {
      this.state.boxes[index].lri = lri
      this.updateBoxes(this.state.boxes)
    }
    return tweets
  }

  async createDraft(doc) {
    await this.DB.createDraft(doc)
  }

  async updateDraft(boxUUID, data) {
    console.log('updateDraft', boxUUID, data)
    await this.DB.updateDraft(data)
    const tweets = await this.getTweets(boxUUID)
    return tweets
  }
}

module.exports = Adapter
