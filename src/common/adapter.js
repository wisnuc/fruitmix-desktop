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

const isSameArray = (a, b) => {
  let res = false
  if (!Array.isArray(a) || !Array.isArray(b)) return res
  try {
    const aj = JSON.stringify(a)
    const bj = JSON.stringify(b)
    res = aj === bj
  } catch (e) {
    console.error('isSameArray JSON.parse error', e)
  }
  return res
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
      this.DB.saveBoxes(this.ctx.guid, boxes).catch(e => console.error('saveBoxes error', boxes, e))
    }
    console.log('updateBoxes state', this.state)
    this.emit('boxes', state, this.state)
  }

  init() {
    const { guid } = this.ctx
    const boxesPath = path.join('Boxes-v1.db')
    const tweetsPath = path.join(`${guid}-Tweets-v1.db`)
    const draftsPath = path.join(`${guid}-Drafts-v1.db`)
    this.DB = new BoxDB(boxesPath, tweetsPath, draftsPath)

    this.getBoxes(guid).then(boxes => this.updateBoxes(boxes, true)).catch(e => this.error('getBoxes', e))
  }

  error(type, err) {
    console.error('Error in Adapter', type, err)
  }

  /* request boxes, union previous data, and save to DB */
  async reqBoxes() {
    const newBoxes = await this.ctx.reqAsync('boxes', null)
    const preBoxes = await this.getBoxes()
    const boxes = unionBox(preBoxes, newBoxes)
    if (!isSameArray(boxes, preBoxes)) this.updateBoxes(boxes)
    const promises = []
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const ltsi = box.ltsst && box.ltsst.index
      const lti = box.tweet ? box.tweet.index : 0 // last tweet's index
      if (ltsi === undefined || (lti > ltsi)) {
        promises.push(this.reqTweets({ boxUUID: box.uuid, stationId: box.stationId }))
      }
    }
    await Promise.all(promises)
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

    if (Array.isArray(res) && res.length) {
      const docs = [...res]
        .map(x => Object.assign({}, x, { _id: x.uuid, boxUUID, stationId }))
        .sort((a, b) => (a.index - b.index))
      await this.DB.saveTweets(docs)

      /* update the latest stored tweet and its index */
      const bs = this.state.boxes
      const i = bs.findIndex(b => b.uuid === boxUUID)
      bs[i].ltsst = docs.slice(-1)[0] // latest stored tweet
      this.updateBoxes(bs)
    }
  }

  async getBoxes() {
    let boxes = this.state.boxes
    if (!boxes) {
      boxes = await this.DB.loadBoxes(this.ctx.guid)
      boxes.forEach(b => b.station.isOnline = 1)
    }
    return boxes
  }

  async getTweets(boxUUID) {
    console.time('getTweets')
    const trueTweets = await this.DB.loadTweets(boxUUID)
    const drafts = await this.DB.loadDrafts(boxUUID)

    /* remove finished drafts */
    for (let i = 0; i < drafts.length; i++) {
      const t = drafts[i]
      if (t.trueUUID) { // already finished
        const index = trueTweets.findIndex(tt => tt.uuid === t.trueUUID) // already stored
        t.finished = true
        if (index > -1) {
          trueTweets[index].ctime = t.ctime
          await this.DB.updateTweet(t.trueUUID, { ctime: t.ctime })
          await this.DB.deleteDraft(t._id)
          drafts[i] = null
        }
      } else if (new Date().getTime() - t.ctime > 120000) { // set old tweets to failed state
        t.failed = true
      }
    }

    const tweets = [...trueTweets, ...drafts.filter(v => !!v)].sort((a, b) => a.ctime - b.ctime)

    // console.log('getTweets', trueTweets, drafts)

    /* update last read index */
    const lri = tweets.length - 1
    const index = this.state.boxes.findIndex(b => b.uuid === boxUUID)
    if (index > -1 && (this.state.boxes[index].lri !== lri)) {
      this.state.boxes[index].lri = lri
      this.updateBoxes(this.state.boxes)
    }
    console.timeEnd('getTweets')
    return tweets
  }

  async createDraft(doc) {
    await this.DB.createDraft(doc)
  }

  async updateDraft(boxUUID, data) {
    await this.DB.updateDraft(data)
    const tweets = await this.getTweets(boxUUID)
    return tweets
  }
}

module.exports = Adapter
