const Promise = require('bluebird')
const DB = require('./nedb')

class boxDB {
  constructor (boxesPath, tweetsPath, draftsPath) {
    this.boxesDB = new DB({ filename: boxesPath, autoload: true })
    this.tweetsDB = new DB({ filename: tweetsPath, autoload: true })
    this.draftsDB = new DB({ filename: draftsPath, autoload: true })
    this.tweetsDB.ensureIndex({ fieldName: 'boxUUID' }, err => err && console.error('nedb indexing error', err))
  }

  async loadBoxes (guid) {
    let doc = null
    let boxes = []
    try {
      doc = await Promise.promisify(this.boxesDB.findOne, { context: this.boxesDB })({ _id: guid })
    } catch (e) {
      console.error('async loadBoxes error', guid, e)
    }
    if (doc) boxes = doc.boxes
    return boxes
  }

  async saveBoxes (guid, boxes) {
    const doc = await Promise.promisify(this.boxesDB.findOne, { context: this.boxesDB })({ _id: guid })
    if (doc) await Promise.promisify(this.boxesDB.update, { context: this.boxesDB })({ _id: guid }, { boxes })
    else await Promise.promisify(this.boxesDB.insert, { context: this.boxesDB })({ _id: guid, boxes })
  }

  async saveTweets (docs) {
    try {
      await Promise.promisify(this.tweetsDB.insert, { context: this.tweetsDB })(docs)
    } catch (e) {
      console.error('async saveTweets error', docs)
    }
  }

  async updateTweet (_id, value) {
    await Promise.promisify(this.tweetsDB.update, { context: this.tweetsDB })({ _id }, { $set: value })
  }

  async loadTweets (boxUUID) {
    const tweets = await Promise.promisify(this.tweetsDB.find, { context: this.tweetsDB })({ boxUUID })
    return tweets
  }

  async createDraft (doc) {
    await Promise.promisify(this.draftsDB.insert, { context: this.draftsDB })(doc)
  }

  async updateDraft (doc) {
    await Promise.promisify(this.draftsDB.update, { context: this.draftsDB })({ _id: doc._id }, doc)
  }

  async deleteDraft (id) {
    await Promise.promisify(this.draftsDB.remove, { context: this.draftsDB })({ _id: id }, {})
  }

  async loadDrafts (boxUUID) {
    const drafts = await Promise.promisify(this.draftsDB.find, { context: this.draftsDB })({ boxUUID })
    return drafts
  }
}

module.exports = boxDB
