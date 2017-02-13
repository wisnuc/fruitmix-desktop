import path from 'path'
import { expect } from 'chai'
global.electron = {ipcRenderer:{}}
import { Job } from '../src/app/reducers/command'

describe('cammand module test', () => {
	var testJob

	before(() => {
		console.log('test before')
	})

	it('init a command job', () => {
		testJob = new Job('testKey', {cmd: 'testCmd',args:{testArg1:'testArg1'}})
	})
})