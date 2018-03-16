const PouchDB = require('pouchdb').plugin(require('pouchdb-find'))
const Promise = require('bluebird')

const readAll = async (path) => {
  const db = new PouchDB(path)
  const docs = (await db.allDocs({
    include_docs: true
  })).rows.map(r => r.doc)

  return docs
}

const BPath = '/home/lxw/.config/wisnuc/boxCache/Boxes-v1.db'
const TPath = '/home/lxw/.config/wisnuc/boxCache/b20ea9c9-c9a6-4a4f-adde-c8f7c1c11884-Tweets-v1.db'

readAll(BPath).then(docs => console.log(docs)).catch(e => console.log('readAll error', e))
// readAll(TPath).then(docs => console.log(docs.slice(0, 6))).catch(e => console.log('readAll error', e))
