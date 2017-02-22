import { expect } from 'chai'
import jobFactory from '../src/app/reducers/commandJobCreater'
import taskFactory from '../node/lib/commandTaskCreater'

let testJob
let task
let result = false
let nodeResult = false
let commandMap = new Map()

let initJob = () => {
	testJob = jobFactory(
		'testKey', 
		{
			cmd: 'testCmd',
			args:{testArg1:'testArg1'},
			timeout:2000
		}, 
		(err, data) => {
			if (err) return result = err
				result = data
		})
	result = false
	nodeResult = false
}

commandMap.set('testCmd',(args, callback) => {
	nodeResult = args.testArg1
	callback(null, nodeResult)
})


describe('command test in reducer', () => {
	
	describe('init a command job', () => {

		before(() => {
			initJob()	
		})

		it('should be an object', () => {
			expect(typeof testJob).to.equal('object')
		})

		it('should be a string as id', () => {
			expect(typeof testJob.id).to.equal('string')
		}) 

		it('should be a string as key', () => {
			expect(typeof testJob.key).to.equal('string')
		})

		it('should be a string as cmd', () => {
			expect(typeof testJob.cmd).to.equal('string')
		})

		it('should be 3000 as timeout', () => {
			expect(testJob.timeout).to.equal(2000)
		})

		it('should be an object as args', () => {
			expect(typeof testJob.args).to.equal('object')
		})
	})

	describe('abort command', () => {

		before(() => {
			initJob()
			testJob.abort()
		})

		it('shoud be Error as name', () => {
			expect(result.name).to.equal('Error')
		})

		it('shoud be aborted as message', () => {
			expect(result.message).to.equal('aborted')
		})
	})

	describe('command timeout', () => {

		before(() => {
			initJob()
		})

		it('should be false as timeout', () => {
			setTimeout(() => {
				expect(testJob.isTimeout()).to.equal(false) 
				done()
			},1500)
		})

		it('should be true as timtout', () => {
			setTimeout(() => {
				expect(testJob.isTimeout()).to.equal(true)
				done()
			},2000)
		})

		it('should be Error as name', () => {
			setTimeout(() => {
				if (testJob.isTimeout()) {
					testJob.fireTimeout()
				}
				expect(result.name).to.equal('Error')
				done()
			},2000)
		})
	})
})

describe('command test in node', () => {
	describe('init a command task', () => {
		before(() => {
			initJob()
			task = taskFactory({sender:{send:'aaa'}}, testJob.id, {cmd:testJob.cmd,args:testJob.args}, commandMap)
		})

		it('should return a object', () => {
			expect(typeof task).to.equal('object')
		})

		it('should have same value as id', () => {
			expect(task.id).to.equal(testJob.id)
		})
	})

	describe('run a normal command task', () => {
		before(() => {
			initJob()
			task = taskFactory({sender:{send:(string, {err,id, data})=>{
				testJob.callback(err,data)
			}}}, testJob.id, {cmd:testJob.cmd,args:testJob.args}, commandMap)
			task.isIDExist()
		})

		it('command task should have been run' , () => {
			expect(nodeResult).to.equal('testArg1')
		})

		it('command callback should have been run' , () => {
			expect(result).to.equal('testArg1')
		})
	})

	describe('run a no handler command task', () => {
		before(() => {
			initJob()
			task = taskFactory({sender:{send:(string, {err, id, data})=>{
				testJob.callback(err,data)
			}}}, testJob.id, {cmd: 'wrongCMD', args:testJob.args}, commandMap)
			task.isIDExist()
		})

		it('command should return ERROR with ENOCOMMAND' , () => {
			expect(result.code).to.equal('ENOCOMMAND')
		})
	})
})