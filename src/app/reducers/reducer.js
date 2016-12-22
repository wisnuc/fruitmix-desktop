import { combineReducers } from 'redux'
import login from './login'
import navigation from './navigation'
import multiple from './multiple'
import snack from './snack'
import transimission from './transimission'
import tree from './tree'
import media from './media'
import setting from './setting'
import view from './view'
import file from './file'
import share from './share'
import imageItem from './imageitem';
import largeImages from './largeImage';
import navigationBarTitleTexts from './navigationBarTitleTexts';
import albumHash from './albumHash';
import moveData from './moveData';
import fileInfo from './fileInfo';

import popmenu from './popmenu'
import command from './command'
import node from './node'
import mdns from './mdns'
import maintenance from './maintenance'

// import atom component reducer
import { radio, shareRadio } from '../React-Redux-UI/src/reducers/reducer';

const reducer = combineReducers({
	login,
	navigation,
	multiple,
	snack,
	transimission,
	tree,
	media,
	setting,
	view,
	file,
	share,
	imageItem,
	largeImages,
	navigationBarTitleTexts,
	radio,
	albumHash,
	shareRadio,
	moveData,
	fileInfo,
  command,
  node,
  popmenu,
  mdns,
  maintenance,
})

export default reducer

