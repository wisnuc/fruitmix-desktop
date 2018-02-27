const remote = require('electron').remote

const Pouchdb = remote.require('pouchdb')
const Find = remote.require('pouchdb-find')

const DB = Pouchdb.plugin(Find)

class boxDB {
  constructor(boxesPath, tweetsPath) {
    this.boxesDB = new DB(boxesPath)
    this.tweetsDB = new DB(tweetsPath)
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
}

module.exports = boxDB
