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
}

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
  { name: '分享', parent: '照片',selected: false, type: 'two-level', icon:'transmission' },
  { name: '相册查看', parent: '照片', selected: false, type:'two-level', icon:null },
  { name: '分享', parent: '照片', selected: false, type:'two-level', icon:null },
  { name: '设置', parent: '系统', selected: false, type:'two-level', icon:'settings' },
  { name: '数据迁移', parent: '系统', selected: false, type:'two-level', icon:'settings' }
]

const nav = (state = navDefault, action) => {

  switch (action.type) {

    case 'NAV_SELECT':
        var newNav = cloneFun(state)

        newNav.forEach(item => {
            item.selected = false
        })
        let item = newNav.find(item => {
            return item.name == action.select
        })
        item.selected = true
        return newNav

    default:
      return state
  }
}

function cloneFun(obj){
  if(!obj||"object" != typeof obj){
    return null;
  }
  var result = (obj instanceof Array)?[]:{};
  for(var i in obj){
    result[i] = ("object" != typeof obj[i])?obj[i]:cloneFun(obj[i]);
  }
  return result;
}

const reducer = combineReducers({
    menu,
 	nav
})

export default reducer
