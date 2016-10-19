//import core module
import { combineReducers } from 'redux'
//define menu reducer
const menu = (state = true, action) => {

  	switch(action.type) {

    	case 'NAV_MENU_TOGGLE':
      		return !state;

  	 default:
     		 return state;
  }
};
//define default data of nav
// let navDefault = [
// { name: '我的所有文件', parent: null, selected: true, type:'leftNav', icon:'cloud' },
// { name: '上传/下载', parent: null, selected: false, type:'leftNav', icon:'transmission' },
// { name: '分享给我的文件', parent: null, selected: false, type:'leftNav', icon:'sharedToMe' },
// { name: '我分享的文件', parent: null, selected: false, type:'leftNav', icon:'sharedByMe' },
// { name: '所有照片', selected: false, type: 'leftNav', icon:'cloud' },
// { name: '相册', selected: false, type: 'leftNav', icon:'transmission' },
// { name: '设置', parent: null, selected: false, type:'leftNav', icon:'settings' },
// { name: '数据迁移', parent: null, selected: false, type:'leftNav', icon:'settings' },
// { name: '相册查看', parent: null, selected: false }
// ];

let navDefault = [
  { name: '文件', parent: null, selected: null, type:'one-level', icon:null },
  { name: '照片', parent: null, selected: null, type:'one-level', icon:null },
  { name: '系统', parent: null, selected: null, type:'one-level', icon:null },
  { name: '我的所有文件', parent: '文件', selected: true, type:'two-level', icon:'cloud' },
  { name: '上传/下载', parent: '文件', selected: false, type:'two-level', icon:'transmission' },
  { name: '分享给我的文件', parent: '文件', selected: false, type:'two-level', icon:'sharedToMe' },
  { name: '我分享的文件', parent: '文件', selected: false, type:'two-level', icon:'sharedByMe' },
  { name: '所有照片', parent: '照片',selected: false, type: 'two-level', icon:'cloud' },
  { name: '相册', parent: '照片',selected: false, type: 'two-level', icon:'transmission' },
  { name: '相册查看', parent: '照片', selected: false, type:'two-level', icon:null },
  { name: '设置', parent: '系统', selected: false, type:'two-level', icon:'settings' },
  { name: '数据迁移', parent: '系统', selected: false, type:'two-level', icon:'settings' }
]

const nav = (state = navDefault, action) => {

  switch (action.type) {

    case 'NAV_SELECT':
        state.forEach(item => {
            item.selected = false
        })
        let item = state.find(item => {
            return item.name == action.select
        })
        item.selected = true
        return state

    default:
      return state
  }
}

// const nav = (state = navDefault, action) => {

//   switch (action.type) {

//     case 'NAV_SELECT':

//       // find select
//       let select = state.find((item) => {
//         return item.name === action.select
//       })

//       if (select === undefined) return state

//       // is menu
//       	if (!select.parent) {

//        	if (select.selected) return state

//         	return state.map((item) => {
//           	// tab is irrelevent
//           	if (item.parent) return item
//           	// only one menu can be selected
//           	// set selected item
//          	if (item === select)
//           		return Object.assign({}, item, {selected: true})
//          	 // unset previously selected item
//         	if (item.selected)
//             		return Object.assign({}, item, {selected: false})
//           	// other menus are irrelevent
//           		return item
//         	})
//       }
//       else { // is tab

//         	let parent = state.find((item) => {
//           		return item.name === select.parent
//         	})

//         	// this is defined as illegal now, may be changed in future
//         	if (!parent.selected) return state
//         	// if already selected
//         	if (select.selected) return state

//         	let result = state.map((item) => {

//           	// menu is irrelevent
//          	if (!item.parent) {
//            		return item
//           	}
//           	// non-siblings irrelevent
//           	if (item.parent !== parent.name) {
//             		return item
//           	}

//           	// set selected tab
//           	if (item === select) {
//             		return Object.assign({}, item, {selected: true})
//           	}
//           	// unset previously selected tab (sibling)
//           	if (item.selected) {
//             		return Object.assign({}, item, {selected: false})
//           	}

//           	return item
//        })

//        return result
//       }
//       break

//     default:
//       return state
//   }
// }

const reducer = combineReducers({
    menu,
 	nav
})

export default reducer
