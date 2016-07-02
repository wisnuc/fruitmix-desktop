const defaultDirectory = {
	state: 'READY', // READY, BUSY, REJECTED, ERRO
	directory: {},
	children:[],
	parent: [],
	path:[],
	selectAll:false, 
	position:[],
	menu:{show:false,objArr:[]},
	showSize:50,
	shareChildren: [],
	filesSharedByMe: [],
}

const directory = (state=defaultDirectory,action)=> {
	switch (action.type) {
		case 'SET_DIRECTORY':
			let position = action.children.map((item,index)=>{
				return {top:index*51+58+48+8+64,bottom:(index+1)*51+58+48+8+64}
			});

			var obj = {directory:action.directory,children:action.children,parent:action.parent,path:action.path,position:position,state:'READY',selectAll:false,shareChildren:action.shareChildren,filesSharedByMe:action.filesSharedByMe};
			return Object.assign({}, state, obj);

		case 'SELECT_CHILDREN':
		console.log('2  '+(new Date()).getTime());
			var allSelected = true;
			//setSelectedChildren
			var newChildren = state.children.map((item,index)=>{
				return index == action.rowNumber?Object.assign({},item,{checked:!item.checked}):item
			});
			console.log('3  '+(new Date()).getTime());
			// //is all children selected?
			for (let item of newChildren) {
				if (item.checked == false) {
					allSelected = false;
					break;
				}
			}
			console.log('4  '+(new Date()).getTime());
			return Object.assign({},state,{children:newChildren,selectAll:allSelected});
			// state.children[action.rowNumber].checked = !state.children[action.rowNumber].checked; 
			
			// state.selectAll = allSelected;
			// return Object.assign({},state);

		case 'CANCEL_SELECT':
			let children = state.children.map((item,index)=>{
				return Object.assign({},item,{checked:false});
			});
			return Object.assign({},state,{children:children,selectAll:false});

		case 'SELECT_ALL_CHILDREN':
			//setSelect
			var children = state.children.map((item,index)=> {
				return state.selectAll?Object.assign({},item,{checked:false}):Object.assign({},item,{checked:true});
			});
			return Object.assign({},state,{children:children,selectAll:!state.selectAll});

		case 'TOGGLE_MENU':
			if (action.objArr)  {
				//open menu
				if (action.selected) {
					//click item has been selected 
					//put it into menu
					return Object.assign({},state,{menu:{show:true,objArr:action.objArr,x:action.x,y: action.y}});	
				}else {
					//click item is not selected
					//set all children item state of checked to false and select click item
					let children = state.children.map((item,index)=>{
						if (item.uuid == action.objArr[0].uuid) {
							return Object.assign({},item,{checked:true});
						}else {
							 return Object.assign({},item,{checked:false});
						}
					});
					return Object.assign({},state,{children:children,menu:{show:true,objArr:action.objArr,x:action.x,y: action.y}});
				}
				
			}else {
				//close menu
				return Object.assign({},state,{menu:{show:false,objArr:[]}});
			}

		// case 'SET_DETAIL':
		// 	return Object.assign({},state,{detail:action.objArr});

		case 'FILES_LOADING':
			return Object.assign({},state,{state:'BUSY'});

		case 'CLEAN_DETAIL':
			return Object.assign({},state,{detail:[]});

		// case 'ADD_UPLOAD':
		// 	var up = state.upload;
		// 	up.push(action.obj);
		// 	return Object.assign({},state,{upload:up});

		// case 'ADD_DOWNLOAD':
		// 	var dowload = state.dowload.concat([action.obj]);
		// 	//add property status for each item
		// 	for (let i =0; i < dowload.length; i++) {
		// 		dowload[i].status = 0
		// 	}
		// 	return Object.assign({},state,{dowload:dowload});

		case 'REFRESH_DIR':
			var position = action.obj.map((item,index)=>{
				return {top:index*51+58+48+8+64,bottom:(index+1)*51+58+48+8+64}
			})
			return Object.assign({},state,{children:action.obj,position:position});

		// case 'REMOVE':
		// 	for (var i=0;i<state.upload.length;i++) {
		// 		if (state.upload[i].path == action.obj.path) {
		// 			a = state.upload.slice(i,1);
		// 			break
		// 		}
		// 	}
		// 	return Object.assign({},state,{upload:a});
			
		// case 'TOGGLE_DIALOG_FOLDER':
		// 	return Object.assign({},state,{dialogOfFolder:action.isOpen});

		// case 'TOGGLE_SHARE':
		// 	return Object.assign({},state,{dialogOfShare:action.isOpen});

		// case 'REFRESH_STATUS_UPLOAD':
		// 	// var newUploadArr = state.upload;
		// 	// var uploadArrIndex = null;
		// 	// for (let i = 0;i<newUploadArr.length;i++) {
		// 	// 	if (newUploadArr[i].name == action.file.name) {
		// 	// 		uploadArrIndex = i;
		// 	// 		break;
		// 	// 	}
				
		// 	// }
		// 	// newUploadArr[uploadArrIndex].status = action.status;
		// 	// if (uploadArrIndex !=null) {
		// 	// 	return Object.assign({},state,{upload:newUploadArr})
		// 	// }else {
		// 	// 	return state;
		// 	// }
		// 	// for (let item of status.upload) {
		// 	// 	item.map.get();
		// 	// }
		// 	state.upload.forEach(item=>{
		// 		var uploadFIle = item.map.get(action.file);
		// 		if (uploadFIle != undefined) {
		// 			uploadFIle.status = action.status;
		// 		}
		// 	});
		// 	return Object.assign({},state) 

		// case 'REFRESH_STATUS_DOWNLOAD':
		// 	var newDownloadArr = state.dowload;
		// 	var downloadArrIndex = null;
		// 	for (let i=0;i<newDownloadArr.length;i++) {
		// 		console.log(newDownloadArr[i].uuid);
		// 		if (newDownloadArr[i].uuid == action.file.uuid) {
		// 			downloadArrIndex = i;
		// 			break;
		// 		}
				
		// 	}
		// 	newDownloadArr[downloadArrIndex].status = action.status;
		// 	if (downloadArrIndex !=null) {
		// 		return Object.assign({},state,{download:newDownloadArr})
		// 	}else {
		// 		return state
		// 	}
		case 'SET_SHARE_CHILDREN':
			return Object.assign({},state,{shareChildren:action.shareChildren});
		case 'SET_FILES_SIZE':
			var size = state.showSize;
			action.reset?size=50:size+=50
			console.log(size);
			return Object.assign({},state,{showSize:size});
		default:
			return state
	}
}

export default directory;