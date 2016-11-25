/**
 * @component Main content
 * @description main interface
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react'
 import CSS from '../../utils/transition'
// import Component
import AllFile from '../mainContent/AllFiles'
import Collection from '../mainContent/Collection'
import Transimission from '../mainContent/Transimission'
import SharedFiles from '../mainContent/SharedFiles'
import SharedByMe from '../mainContent/SharedByMe'
import AllPhotos from '../mainContent/AllPhotos'
import Albums from '../mainContent/Albums'
import AlbumView from '../mainContent/AlbumView'
import Setting from '../mainContent/Setting'
import DataMove from '../mainContent/DataMove'
import Media from '../mainContent/Media'
import AlbumOrPhotoShare from '../mainContent/AlbumOrPhotoShare';
import AlbumOrPhotoShareView from '../mainContent/AlbumOrPhotoShareView';

class MainContent extends Component {

	getContentSelected() {
		// define the content is selected
		let selectedItem = this.props.state.navigation.nav.find((item, index, arr) => {
			return item.selected == true
		});

		return selectedItem.name;
	}

	render() {
/**
		let componentMap = {
			'我的所有文件' : <AllFile dispatch={this.props.dispatch} state={this.props.state} key={'a'}></AllFile>,
			'上传/下载' : <Transimission key={'b'}></Transimission>,
			// '上传/下载' : <Collection dispatch={this.props.dispatch} state={this.props.state} key={'b'}></Collection>,
			'分享给我的文件' : <SharedFiles dispatch={this.props.dispatch} state={this.props.state} key={'c'}></SharedFiles>,
			'我分享的文件' : <SharedByMe dispatch={this.props.dispatch} state={this.props.state} key={'d'}></SharedByMe>,
			'所有照片' : <AllPhotos key={'e'}></AllPhotos>,
			'相册' : <Albums key={'f'}></Albums>,
			'分享' : <AlbumOrPhotoShare key={'j'} dispatch={this.props.dispatch}></AlbumOrPhotoShare>,
			'相册查看' : <AlbumView dispatch={this.props.dispatch} state={this.props.state} key={'g'}></AlbumView>,
      		'分享查看' : <AlbumOrPhotoShareView dispatch={this.props.dispatch} state={this.props.state} key={'g'}></AlbumOrPhotoShareView>,
			'设置' : <Setting dispatch={this.props.dispatch} state={this.props.state} key={'h'}></Setting>,
			'数据迁移' : <DataMove dispatch={this.props.dispatch} state={this.props.state} key={'i'}></DataMove>
		}
		return (
			<div>
        <div className="content">
          <CSS opts={['content', true, true, false, 800, 800, 500]}>
            {componentMap[this.getContentSelected()]}
          </CSS>
        </div>
			</div>
		)
**/
  return <AllFile dispatch={window.store.dispatch} state={window.store.getState()} key='my-drive' />
	}
}

export default MainContent;
