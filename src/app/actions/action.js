var actions = {
	//files
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
	//view
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

	toggleMenu(obj,x,y,selected) {
		return {
			type: 'TOGGLE_MENU',
			obj : obj,
			x: x,
			y: y,
			selected:selected
		}
	},

	openDetail() {
		return {
			type : 'OPEN_DETAIL'
		}
	},

	cleanDetail() {
		return {
			type: 'CLEAN_DETAIL'
		}
	},
	//left navigation
	changeSelectedNavItem(name,index) {
		return {
			type: 'NAV_SELECT',
			select: name
		}
	},

	navToggle() {
		return {
			type: 'NAV_MENU_TOGGLE'
		}
	},

	// no using
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

	// refreshDir(obj) {
	// 	return {
	// 		type: 'REFRESH_DIR',
	// 		obj: obj,
	// 	}
	// },

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
	},

	/**
    v0.2.0
	**/
	changeSelectedPhotoMenuItem(name) {
		return {
			type: 'PHOTO_MENU_SELECT',
			select: name
		};
	}
}

module.exports = actions;
