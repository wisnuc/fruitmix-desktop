var actions = {

	selectedNavItem(name) {
    return {
			type: 'PHOTO_MENU_SELECT',
			name
		};
	},

	createFileInfo(fileInfo) {
		return {
			type: 'CREATE_FILE_INFO',
			fileInfo
		}
	},

	clearFileInfo() {
		return {
			type: 'CLEAR_FILE_INFO'
		}
	},

	addDragImageItem(el, date, index) {
    return {
			type: 'ADD_DRAG_IMAGEITEM',
			el,
			date,
			index
		};
	},

	addDragImageList(els, date) {
		return {
			type: 'ADD_DRAG_IMAGELIST',
			els,
			date
		}
	},

	removeDragImageItem(date, index) {
		return {
      type: 'REMOVE_DRAG_IMAGEITEM',
      date,
      index
    }
	},

	removeDragImageList(date) {
		return {
			type: 'REMOVE_DRAG_IMAGELIST',
			date
		}
	},

	clearDragImageItem() {
		return {
			type: 'CLEAR_DRAG_IMAGEITEM'
		}
	},

	getLargeImageList(largeImageEls, currentThumbIndex, date, hash) {
	  return {
			type: 'LARGE_IMAGE',
			date,
			largeImageEls,
			currentThumbIndex,
			hash
		};
	},

	removeLargeImageList() {
		return {
			type: 'REMOVE_LARGE_IMAGE'
		};
	},

	toggleSelectStatusImageItem(checked) {
    return {
			type: 'TOGGLE_SELECT_STATUS_IMAGEITEM',
			checked
		}
	},

	toggleNavigator(titleTexts) {
		return {
			type: 'TOGGLE_NAVIGATOR',
			titleTexts
		}
	},

	getAlbumHash(hash) {
		return {
			type: 'GET_ALBUM_HASH',
			hash
		};
	},

	refreshStatusOfUpload(tasks, finish) {
		return {
			type: 'REFRESH_STATUS_UPLOAD',
			tasks: tasks,
			uploadFinish: finish
		}
	},

	refreshStatusOfDownload(tasks, finish) {
		return {
			type: 'REFRESH_STATUS_DOWNLOAD',
			tasks : tasks,
			downloadFinish: finish
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
	//media ---------------------------------------------

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

	// transimission

}

module.exports = actions;
