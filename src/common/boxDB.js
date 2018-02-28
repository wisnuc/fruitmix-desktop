const remote = require('electron').remote

const Pouchdb = remote.require('pouchdb')
const Find = remote.require('pouchdb-find')

const DB = Pouchdb.plugin(Find)

class boxDB {
  constructor(boxesPath, tweetsPath, draftsPath) {
    this.boxesDB = new DB(boxesPath)
    this.tweetsDB = new DB(tweetsPath)
    this.draftsDB = new DB(draftsPath)
    this.bRev = undefined // _rev of boxes
  }

  async loadBoxes(guid) {
    let boxes = []
    try {
      const doc = await this.boxesDB.get(`_local/${guid}`) // use local doc
      this.bRev = doc._rev
      boxes = doc.boxes
    } catch (e) {
      console.log('loadBoxes error', e)
    }
    return boxes
  }

  async saveBoxes(guid, boxes) {
    const doc = { _id: `_local/${guid}`, _rev: this.bRev, boxes }
    const res = await this.boxesDB.put(doc)
    this.bRev = res.rev
    return res.rev
  }

  async saveTweets(docs) {
    await this.tweetsDB.bulkDocs(docs)
  }

  async loadTweets(boxUUID) {
    await this.tweetsDB.createIndex({ index: { fields: ['ctime'] } })
    const tweets = (await this.tweetsDB.find({
      selector: { boxUUID, ctime: { $gte: null } },
      sort: ['ctime']
    })).docs

    return tweets
  }

  async updateDraft(data) {
    let doc = null
    try {
      doc = await this.draftsDB.get(data._id)
    } catch (e) {
      console.log('get drafts error', e)
    }
    if (doc) await this.draftsDB.put(Object.assign({}, data, { _rev: doc._rev }))
    else await this.draftsDB.put(data)
  }

  async deleteDraft(id) {
    const doc = await this.draftsDB.get(id)
    const res = await this.draftsDB.remove(doc)
    return res
  }

  async loadDrafts(boxUUID) {
    await this.draftsDB.createIndex({ index: { fields: ['ctime'] } })
    const drafts = (await this.draftsDB.find({
      selector: { boxUUID, ctime: { $gte: null } },
      sort: ['ctime']
    })).docs

    return drafts
  }
}

module.exports = boxDB
