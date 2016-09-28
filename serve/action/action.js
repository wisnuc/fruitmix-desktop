var actions = {
	loggedin(obj) {
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

	deleteServer(item) {
		return {
			type : 'DELETE_SERVER',
			item : item
		}
	},

	setDeviceUsedRecently(ip) {
		return {
			type: 'SET_DEVICE_USED_RECENTLY',
			ip: ip
		}
	},

	setDownloadPath(path) {
		return {
			type : 'SET_DOWNLOAD_PATH',
			path : path
		}
	},
	// files
	loadingFile() {
		return {
			type : 'LOADING'
		}
	},

	setDir(directory,children,dirPath) {
		return {
			type : 'SET_DIR',
			directory : directory,
			children : children,
			path : dirPath
		}
	},

	//media
	// setMedia(data) {
	// 	return {
	// 		type: 'SET_MEDIA',
	// 		data: data
	// 	}
	// },

	//DataMove
	setMoveData(data) {
		return {
			type : 'SET_MOVE_DATA',
			data : data
		}
	},

	//share
	setShareChildren(shareChildren,sharePath) {
		return {
			type: 'SET_SHARE_CHILDREN',
			shareChildren: shareChildren,
			sharePath:sharePath
		}
	},

	setFilesSharedWithMe(files) {
		return {
			type: 'FILES_SHARED_BY_ME',
			files:files
		}
	},
}

module.exports = actions;