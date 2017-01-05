//define default state
const defaultState = {
	currentMediaImage:{status:'notReady',path:null,open: false},
	toggle: false,
	showAppBar: true,
	showLeftNav: true
}

const loginState = (state = defaultState, action) => {

	switch (action.type) {

		case 'TOGGLE_APPBAR':
			return Object.assign({}, state, { showAppBar: !state.showAppBar })

		case 'TOGGLE_SOMETHING':
			return Object.assign({}, state, { toggle: !state.toggle })

		case 'TOGGLE_LEFTNAV':
			return Object.assign({}, state, { showLeftNav: !state.showLeftNav })

		case 'TOGGLE_MEDIA':
			let imgObj = {}
			if (action.open == false) {
				imgObj = {status:'notReady',path:null,open: false};
			}else {
				imgObj = {status:'notReady',path:null,open: true}
			}
			return Object.assign({},state,{currentMediaImage:imgObj});

		case 'SET_MEDIA_IMAGE':
			var newCurrentImage = Object.assign({}, state.currentMediaImage)
			newCurrentImage.status = 'ready'
			newCurrentImage.path = action.item.path
			newCurrentImage.exifOrientation = action.item.exifOrientation
			return Object.assign({},state,{currentMediaImage:newCurrentImage})

		case 'CLEAR_MEDIA_IMAGE':
		  const newCurrentImage = Object.assign({}, state.currentMediaImage);
			newCurrentImage.path = '';

			return Object.assign({}, state, { currentMediaImage: newCurrentImage });

		default:
			return state
	}
};

export default loginState;
