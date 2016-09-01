var actions = {
	login(obj) {
		return {
			type: 'LOGGEDIN',
			obj: obj
		}
	},

	loginFailed() {
		return {
			type: 'REJECTED'
		}
	},

	loginoff() {
		return {
			type: 'LOGIN_OFF'
		}
	},

	setDevice(device) {
		return {
			type: 'SET_DEVICE',
			device: device
		}
	},

	toggleDevice() {
		return {
			type: 'TOGGLE_DEVICE'
		}
	},

	toggleAddDevice() {
		return {
			type: 'TOGGLE_ADD_DEVICE'
		}
	},

	setDeviceUsedRecently(ip) {
		return {
			type: 'SET_DEVICE_USED_RECENTLY',
			ip: ip
		}
	},

	navToggle() {
		return {
			type: 'NAV_MENU_TOGGLE' 
		}
	},
	//select left navigation
	changeSelectedNavItem(name,index) {
		return {
			type: 'NAV_SELECT',
			select: name
		}
	},

	setDirctory(dir,children,parent,path) {
		return {
			type: 'SET_DIRECTORY',
			directory: dir,
			children: children,
			parent: parent,
			path:path
		}
	},

	selectChildren(rowNumber) {
		return {
			type: 'SELECT_CHILDREN',
			rowNumber:rowNumber
		}
	},

	selectAllChildren() {
		return {
			type: 'SELECT_ALL_CHILDREN',
		}
	},

	cancelSelect() {
		return {
			type: 'CANCEL_SELECT',
		}
	},

	toggleMenu(objArr,x,y,selected) {
		return {
			type: 'TOGGLE_MENU',
			objArr : objArr,
			x: x,
			y: y,
			selected:selected
		}
	},
	//open detail of files
	setDetail(objArr) {
		return {
			type : 'SET_DETAIL',
			objArr : objArr
		}
	},

	mouseDown(left,top) {
		return {
			type: 'MOUSE_DOWN',
			left: left,
			top: top
		}
	},

	mouseMove(width,height) {
		return {
			type: 'MOUSE_MOVE',
			width: width,
			height:height
		}
	},

	mouseUp() {
		return {
			type: 'MOUSE_UP'
		}
	},

	filesLoading() {

		return {
			type: 'FILES_LOADING'
		}
		
	},

	cleanDetail() {
		return {
			type: 'CLEAN_DETAIL'
		}
	},

	addUpload(obj) {
		return {
			type: 'ADD_UPLOAD',
			obj: obj
		}
	},

	addDownload(obj) {
		return {
			type: 'ADD_DOWNLOAD',
			obj: obj
		}
	},

	refreshDir(obj) {
		return {
			type: 'REFRESH_DIR',
			obj: obj,
		}
	},

	removeFile(obj) {
		return {
			type: 'REMOVE',
			obj: obj
		}
	},

	toggleDialogOfUploadFolder(open) {
		return {
			type: 'TOGGLE_DIALOG_FOLDER',
			isOpen: open
		}
	},

	toggleShare(open) {
		return {
				type: 'TOGGLE_SHARE',
				isOpen: open
		}
	},

	cancelUserCheck() {
		return {
			type:'CANCEL_USER_CHECK',
		}
	},

	refreshStatusOfUpload(file,status) {
		return {
			type: 'REFRESH_STATUS_UPLOAD',
			file: file,
			status: status
		}
	},

	refreshStatusOfDownload(file,status) {
		return {
			type: 'REFRESH_STATUS_DOWNLOAD',
			file: file,
			status: status
		}
	},

	refreshDownloadStatusOfFolder(key,status) {
		return {
			type: 'DOWNLOAD_STATUS_OF_FOLDER',
			key: key,
			status: status
		}
	},

	refreshUploadStatusOfFolder(key,status) {
		return {
			type: 'UPLOAD_STATUS_OF_FOLDER',
			key: key,
			status: status
		}
	},

	checkUser(uuid,b) {
		return {
			type: 'CHECK_USER',
			uuid: uuid,
			b: b
		}
	},

	setSnack(message,open) {
		return {
			type: 'SET_SNACK',
			text: message,
			open: open
		}
	},

	cleanSnack() {
		return {
			type: 'CLEAN_SNACK'
		}
	},

	toggleMove(open,x,y) {
		return {
			type: 'TOGGLE_MOVE',
			open: open,
			x: x,
			y: y
		}
	},

	setTree(tree) {
		return {
			type: 'SET_TREE',
			tree: tree
		}
	},

	closeMove() {
		return {
			type: 'CLOSE_MOVE'
		}
	},

	setMedia(data) {
		return {
			type: 'SET_MEDIA',
			data: data
		}
	},

	setThumb(item,status) {
		return {
			type: 'SET_THUMB',
			data: item,
			status:status
		}
	},

	toggleMedia(open) {
		return {
			type: 'TOGGLE_MEDIA',
			open: open
		}
	},

	setMediaImage(item) {
		return {
			type: 'SET_MEDIA_IMAGE',
			item: item
		}
	},

	setShareChildren(shareChildren,sharePath) {
		return {
			type: 'SET_SHARE_CHILDREN',
			shareChildren: shareChildren,
			sharePath:sharePath
		}
	},

	setFilesSize(reset) {
		return {
			type: 'SET_FILES_SIZE',
			reset: reset
		}
	},

	setMediaSize(reset) {
		return {
			type: 'SET_MEDIA_SIZE',
			reset: reset
		}
	},
	logOut() {
		return {
			type: 'LOG_OUT'
		}
	},

	setFilesSharedByMe(files) {
		return {
			type: 'FILES_SHARED_BY_ME',
			files:files
		}
	},

	adapter(data) {
		return {
			type: 'ADAPTER',
			store: data
		}
	}
}

module.exports = actions;