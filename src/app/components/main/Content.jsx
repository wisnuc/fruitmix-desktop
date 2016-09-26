/**
 * @component Main content
 * @description main interface
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import CSS from '../../utils/transition';
// import Component
import AllFile from '../mainContent/AllFiles';
import Collection from '../mainContent/Collection';
import SharedFiles from '../mainContent/SharedFiles';
import SharedByMe from '../mainContent/SharedByMe';
import Setting from '../mainContent/Setting';
import Media from '../mainContent/Media';

import AllPhoto from '../mainContent/AllPhotos';

class MainContent extends Component {

	getContentSelected() {
		let component = [];
		component.push(<AllFile dispatch={this.props.dispatch} state={this.props.state} key={'a'}></AllFile>);
		component.push(<Collection dispatch={this.props.dispatch} state={this.props.state} key={'b'}></Collection>);
		component.push(<SharedFiles dispatch={this.props.dispatch} state={this.props.state} key={'c'}></SharedFiles>);
		component.push(<SharedByMe dispatch={this.props.dispatch} state={this.props.state} key={'d'}></SharedByMe>);

		// component.push(<AllFile dispatch={this.props.dispatch} state={this.props.state} key={'f'}></AllFile>);
		// component.push(<AllFile dispatch={this.props.dispatch} state={this.props.state} key={'g'}></AllFile>);
		// component.push(<Media dispatch={this.props.dispatch} state={this.props.state} key={'e'}></Media>);
		// component.push(<Setting dispatch={this.props.dispatch} state={this.props.state} key={'f'}></Setting>);
    component.push(<AllPhoto dispatch={ this.props.dispatch } state={ this.props.state }></AllPhoto>);

		// define the content is selected
		let selectedItem = this.props.state.navigation.nav.findIndex( (item, index, arr) => {
			return item.selected == true
		});

		return component[selectedItem];
	}

	render() {
		return (
			<div className=''>
				<CSS opts={['content', true, true, false, 800, 800, 500]}>
				{this.getContentSelected()}
				</CSS>
			</div>
		)
	}
}

export default MainContent;
