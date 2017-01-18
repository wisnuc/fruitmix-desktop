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

	setDevice(device) {
		return {
			type: 'SET_DEVICE',
			device: device
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

	//media-----------------------------------------------
	setMedia(data) {
		return {
			type: 'SET_MEDIA',
			data: data
		}
	},

	setMediaShare(data) {
		return {
			type : 'SET_MEDIA_SHARE',
			data : data
		}
	},

	//DataMove
	setMoveData(data) {
		return {
			type : 'SET_MOVE_DATA',
			data : data
		}
	},
}

module.exports = actions;