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
let navDefault = [
{ name: '我的所有文件', parent: null, selected: true, type:'leftNav', icon:'cloud' },
{ name: '上传/下载', parent: null, selected: false, type:'leftNav', icon:'transmission' },
{ name: '分享给我的文件', parent: null, selected: false, type:'leftNav', icon:'sharedToMe' },
{ name: '我分享的文件', parent: null, selected: false, type:'leftNav', icon:'sharedByMe' },
{ name: '所有照片', selected: false, type: 'leftNav', icon:'cloud' },
{ name: '相册', selected: false, type: 'leftNav', icon:'transmission' },
{ name: '设置', parent: null, selected: false, type:'leftNav', icon:'settings' },
{ name: '数据迁移', parent: null, selected: false, type:'leftNav', icon:'settings' },
];

const nav = (state = navDefault, action) => {

  switch (action.type) {

    case 'NAV_SELECT':

      // find select
      let select = state.find((item) => {
        return item.name === action.select
      })

      if (select === undefined) return state

      // is menu
      	if (!select.parent) {

       	if (select.selected) return state

        	return state.map((item) => {
          	// tab is irrelevent
          	if (item.parent) return item
          	// only one menu can be selected
          	// set selected item
         	if (item === select)
          		return Object.assign({}, item, {selected: true})
         	 // unset previously selected item
        	if (item.selected)
            		return Object.assign({}, item, {selected: false})
          	// other menus are irrelevent
          		return item
        	})
      }
      else { // is tab

        	let parent = state.find((item) => {
          		return item.name === select.parent
        	})

        	// this is defined as illegal now, may be changed in future
        	if (!parent.selected) return state
        	// if already selected
        	if (select.selected) return state

        	let result = state.map((item) => {

          	// menu is irrelevent
         	if (!item.parent) {
           		return item
          	}
          	// non-siblings irrelevent
          	if (item.parent !== parent.name) {
            		return item
          	}

          	// set selected tab
          	if (item === select) {
            		return Object.assign({}, item, {selected: true})
          	}
          	// unset previously selected tab (sibling)
          	if (item.selected) {
            		return Object.assign({}, item, {selected: false})
          	}

          	return item
       })

       return result
      }
      break

    default:
      return state
  }
}

const photoMenu = (state = photoMenuData, action) => {
  switch (action.type) {
    case 'PHOTO_MENU_SELECT':
       const selectedItem = state.find(item =>
         item.name === action.name
       );

       if (!selectedItem) {
         return state;
       }

       if (selectedItem.selected) {
         return state;
       }

       return state.map(item => {
         if (item === selectedItem) {
           return Object.assign({}, item, { selected: true });
         } else {
           return Object.assign({}, item, { selected: false });
         }
       });

    default:
       return state;
  }
}

const reducer = combineReducers({
  menu,
 	nav
})

export default reducer
