const PouchDB = require('pouchdb').plugin(require('pouchdb-find'))

class DB {
  constructor(path) {
    this.path = path
  }

  start(cb) {
    this.db = new PouchDB(this.path)
    this.db.allDocs({
      include_docs: true,
      attachments: true,
      binary: true
    }).then(res => cb(null, res)).catch(cb)
  }

  save(docs, cb) {
    this.db.bulkDocs(docs).then(res => cb(null, res)).catch(cb)
  }

  delete(cb) {
    this.db.destroy().then(() => cb(null)).catch(cb)
  }
}

module.exports = DB
