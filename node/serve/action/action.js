var actions = {

  // used in lib/misc, TODO
	setDownloadPath(path) {
		return {
			type : 'SET_DOWNLOAD_PATH',
			path : path
		}
	},

  // should be removed TODO
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
}

module.exports = actions;
