const defaultDirectory = {
	multiple:{isShow:false,left:0,top:0,width:0,height:0},
}
const multiple = (state=defaultDirectory,action)=> {
	switch (action.type) {
		case 'MOUSE_DOWN':
			return Object.assign({},state,{multiple:{isShow:true,left:action.left,top:action.top}});
		case 'MOUSE_MOVE':
			var dom = document.getElementsByClassName('file-area')[0]
			let left = dom.offsetLeft;
			let top = dom.offsetTop+58+48+8;
			let right = left + dom.offsetWidth;
			let bottom = top + dom.offsetHeight;
 			let overX = action.width<left?left:(action.width>right?right:action.width);
 			let overY = action.height<top?top:(action.height>bottom?bottom:action.height);
			return Object.assign({},state,{multiple:{isShow:true,left:state.multiple.left,top:state.multiple.top,width:overX,height:overY}});
		
		
		case 'MOUSE_UP':
			return Object.assign({},state,{multiple:{isShow:false,left:0,top:0,width:0,height:0}});
		default:
			return state
	}
}

export default multiple;