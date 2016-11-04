import path from 'path'
import chai from 'chai'

import { fileUploadTask, folderUploadTask } from '../lib/upload'

const expect = chai.expect

const uuid0 = '39016e9c-d21a-4378-8637-2b15a732cef6'
const uuid1 = '17410d50-0253-44e5-93d5-cb8f889239a6'

describe(path.basename(__filename), () => {

  // test group for fileUploadTask
  describe('test fileUploadTask constructor', () => {

    
    let abspath = process.cwd()

    describe('creating root folderUploadTask', () => {

      let task
      beforeEach(() => {
        task = new folderUploadTask(null, process.cwd(), uuid0)
      })

      it('should have null as parent', () => 
        expect(task.parent).to.equal(null))

      it('should have empty array as children', () =>
        expect(task.children).to.deep.equal([]))

      it('should have given abspath', () => 
        expect(task.abspath).to.equal(abspath))

      it('should have given target (uuid)', () => 
        expect(task.target).to.equal(uuid0))

      it('should have initial state as ready', () => 
        expect(task.state).to.equal('ready'))
    })

    describe('creating nonroot folderUploadTask', () => {

      let parentTask
      let parentAbspath = process.cwd()
      let abspath = path.join(parentAbspath, 'tmp')
      let task

      beforeEach(() => {
        parentTask = new folderUploadTask(null, parentAbspath, uuid0)
        task = new folderUploadTask(parentTask, abspath, uuid1)
      })

      it('should have given task as parent', () => 
        expect(task.parent).to.equal(parentTask))

      it("should add itself to parent's children", () =>
        expect(parentTask.children).to.include(task))

      it('should have given abspath', () => 
        expect(task.abspath).to.equal(abspath))

      it('should have given target (uuid)', () => 
        expect(task.target).to.equal(uuid1))

      it('should set state to ready', () => 
        expect(task.state).to.equal('ready'))
    })
  })
})