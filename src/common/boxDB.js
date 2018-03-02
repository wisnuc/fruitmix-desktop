const remote = require('electron').remote

const Pouchdb = remote.require('pouchdb')
const Find = remote.require('pouchdb-find')

const DB = Pouchdb.plugin(Find)

class boxDB {
  constructor(boxesPath, tweetsPath, draftsPath) {
    this.boxesDB = new DB(boxesPath)
    this.tweetsDB = new DB(tweetsPath)
    this.draftsDB = new DB(draftsPath)
  }

  async loadBoxes(guid) {
    let boxes = []
    try {
      const doc = await this.boxesDB.get(`_local/${guid}`) // use local doc
      boxes = doc.boxes
    } catch (e) {
      console.log('loadBoxes error', e)
    }
    return boxes
  }

  async saveBoxes(guid, boxes) {
    let doc = {}
    try {
      doc = await this.boxesDB.get(`_local/${guid}`)
    } catch (e) {
      console.log('get boxes error in saveBoxes', e)
    }
    try {
      const res = await this.boxesDB.put(Object.assign({}, doc, { boxes, _id: `_local/${guid}` }))
    } catch (e) {
      console.log('saveBoxes put', e, doc)
    }
  }

  async saveTweets(docs) {
    try {
      await this.tweetsDB.bulkDocs(docs)
    } catch (e) {
      console.log('saveTweets error', e, docs)
    }
  }

  async loadTweets(boxUUID) {
    await this.tweetsDB.createIndex({ index: { fields: ['ctime'] } })
    let tweets = []
    try {
      tweets = (await this.tweetsDB.find({
      selector: { boxUUID, ctime: { $gte: null } },
      sort: ['ctime']
    })).docs
    } catch (e) {
      console.log('loadTweets find error', e)
    }

    return tweets
  }

  async updateDraft(data) {
    return
    let doc = null
    let res = null
    try {
      doc = await this.draftsDB.get(data._id)
    } catch (e) {
      console.log('get draft error in updateDraft', e)
    }
    try {
      if (doc) res = await this.draftsDB.put(Object.assign({}, data, { _rev: doc._rev }))
      else res = await this.draftsDB.put(data)
    } catch (e) {
      console.log('updateDraft put', e)
    }
    return res
  }

  async deleteDraft(id) {
    let doc = null
    try {
      doc = await this.draftsDB.get(id)
    } catch (e) {
      console.log('get drafts error in deleteDraft', e)
      return false
    }
    await this.draftsDB.remove(doc)
    return true
  }

  async loadDrafts(boxUUID) {
    await this.draftsDB.createIndex({ index: { fields: ['ctime'] } })
    let drafts = []
    try {
      drafts = (await this.draftsDB.find({
        selector: { boxUUID, ctime: { $gte: null } },
        sort: ['ctime']
      })).docs
    } catch (e) {
      console.log('load drafts error find', e)
    }

    return drafts
  }
}

module.exports = boxDB
