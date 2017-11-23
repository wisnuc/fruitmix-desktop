/* test of node/lib/db.js */

const fs = require('fs')
const uuid = require('uuid')
const expect = require('chai').expect
const db = require('../node/lib/db')

const dir = fs.mkdtempSync('./tmp')

const somedata = 'just a test string'
const id = uuid.v4()

let DB = null

describe('db function test', () => {

  it('should initialize success', done => {
    DB = new db(dir)
    DB.initialize(error => {
      if (error) done(error)
      done()
    })
  })

  it('should save data', done => {
    DB.save(id, somedata, error => {
      if (error) done(error)
      done()
    })
  })

  it('should get data', done => {
    DB.load(id, (error, data) => {
      if (error) done(error)
      expect(data).to.be.equal(somedata)
      done()
    })
  })

  it('should remove data', done => {
    DB.remove(id, (error) => {
      if (error) done(error)
      done()
    })
  })

  it('should clear dir', done => {
    DB.clear((error) => {
      if (error) done(error)
      done()
    })
  })
})
