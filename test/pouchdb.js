const fs = require('fs')
const rimraf = require('rimraf')
const PouchDB = require('pouchdb').plugin(require('pouchdb-find'))
const Promise = require('bluebird')

const rimrafAsync = Promise.promisify(rimraf)
const docs = JSON.parse(fs.readFileSync('../../Documents/metadata.json').toString()).map(d => Object.assign({ _id: d.hash }, d))

console.log('docs', docs.length, docs[0])

const fire = async () => {
  await rimrafAsync('./my_db')

  const db = new PouchDB('my_db')

  console.log('bulkDocs start')

  await db.bulkDocs(docs.slice(0, 3000))
  console.log('put doc success')

  const res = await db.createIndex({ index: { fields: ['m'] } })
  console.log('res', res)

  const find = await db.find({
    selector: { m: 'GIF' },
    fields: ['m']
  })
  console.log('find doc success', find)


  // await db.remove(res._id, res._rev)
  // console.log('del doc success')
}

fire().then(() => {}).catch(e => console.log('fire error', e))
