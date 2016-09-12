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
	}
}

module.exports = actions;