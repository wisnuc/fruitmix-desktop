import fs from 'fs'
import { ipcMain } from 'electron'

let testWindow = null
var currentTestCase = null

function testInit() {
	fs.readdir('viewtest', (err, entries) => {
		if (err) {
			testWindow.webContents.send('errorMessage','read directory viewtest failed')
			return
		}

		testWindow.webContents.send('viewtest',entries)

		ipcMain.on('selectTestCase', (err,index) => {
      // dynamic require
			currentTestCase = require(path.join(process.cwd(), 'viewtest', entries[index]))()
			currentTestCase.cases = currentTestCase.cases.map(item => {
				return Object.assign({}, item, {checked : false})
			})
			selectTestCase()
		})

	})
}

function selectTestCase() {
	testWindow.webContents.send('caseList',currentTestCase)
	fs.readFile(path.join(__dirname,'test',currentTestCase.data),{encoding:'utf8'}, (err, data) => {
		if (err) {
			testWindow.webContents.send('errorMessage','read store file failed')
			return	
		}
		mainWindow.webContents.send('stateUpdate', JSON.parse(data))
	})
}

export const initTestWindow = () => {

  ipcMain.on('dispatch', (err, action) => {
    if (!mocha) {return}
    testWindow.webContents.send('receiveDispatch',action)
    if (action === undefined || currentTestCase == null) return
    let mapCaseIndex = currentTestCase.cases.findIndex((item, index) => {
      return deepEqual(item.expectation, action)
    })
    if (mapCaseIndex != -1) {
      currentTestCase.cases[mapCaseIndex].checked = true
      testWindow.webContents.send('caseList',currentTestCase)
    }
  })

  testInit()

  testWindow = new BrowserWindow({
    frame: true,
    height: 768,
    resizable: true,
    width: 1366,
    minWidth:1024,
    minHeight:768,
    title:'WISNUC',
    icon: path.join(__dirname,'180-180.png')
  })
  // testWindow.webContents.openDevTools()
  testWindow.loadURL('file://' + __dirname + '/test/storeTest.html')
}


