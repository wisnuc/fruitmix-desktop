const Promise = require('bluebird')
const remote = require('electron').remote

const DB = remote.require('nedb')

class boxDB {
  constructor(boxesPath, tweetsPath, draftsPath) {
    this.boxesDB = new DB({ filename: boxesPath, autoload: true })
    this.tweetsDB = new DB({ filename: tweetsPath, autoload: true })
    this.draftsDB = new DB({ filename: draftsPath, autoload: true })
  }

  async loadBoxes(guid) {
    let doc = null
    let boxes = []
    try {
      doc = await Promise.promisify(this.boxesDB.findOne)({ _id: guid })
    } catch (e) {
      console.log('async loadBoxes error', guid, e)
    }
    if (doc) boxes = doc.boxes
    return boxes
  }

  async saveBoxes(guid, boxes) {
    const doc = await Promise.promisify(this.boxesDB.findOne)({ _id: guid })
    if (doc) await Promise.promisify(this.boxesDB.update)({ _id: guid }, { boxes })
    else await Promise.promisify(this.boxesDB.insert)({ _id: guid, boxes })
  }

  async saveTweets(docs) {
    await Promise.promisify(this.tweetsDB.insert)(docs)
  }

  async loadTweets(boxUUID) {
    const tweets = await Promise.promisify(this.tweetsDB.find)({ boxUUID })
    return tweets.sort((a, b) => a.ctime - b.ctime)
  }

  async createDraft(doc) {
    const res = await Promise.promisify(this.draftsDB.insert)(doc)
    console.log('createDraft', doc, res)
  }

  async updateDraft(doc) {
    const res = await Promise.promisify(this.draftsDB.update)({ _id: doc._id }, doc)
    console.log('updateDraft', doc, res)
  }

  async deleteDraft(id) {
    const res = await Promise.promisify(this.draftsDB.remove)({ _id: id }, {})
    console.log('deleteDraft', id, res)
  }

  async loadDrafts(boxUUID) {
    const drafts = await Promise.promisify(this.draftsDB.find)({ boxUUID })
    console.log('loadDraft', boxUUID, drafts)
    return drafts.sort((a, b) => a.ctime - b.ctime)
  }
}

module.exports = boxDB
