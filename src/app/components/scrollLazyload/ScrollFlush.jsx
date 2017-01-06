import React, { Component, PropTypes, Children } from 'react';
import { findDOMNode } from 'react-dom';
import { add, remove } from './utils/eventListeners';
import throttle from './utils/throttle';
import LazyloadBox from './LazyloadBox';
import PhotoListByDate from '../photo/PhotoListByDate';

const __DELAY__ = 300;
const __MUSTEXECTIME__ = 200;

export default class ScrollFlush extends Component {
	constructor(props) {
		super(props);

		this.isFirstLoad = true;
		this.isCallering = false;
		this.pageCount = Math.ceil(this.props.list.length / this.props.pageSize);
		this.currentPage = 0;
		this.singleItemHeight = 158;
		this.singleItemWidth = 150;
		this.state = {
			lazyloadBoxs: []
		};
		this.lazyloadBoxs = [];
		this.getStyle = () => ({
			position: 'absolute',
			left: 0,
			top: 6,
			width: '100%',
			height: 'calc(100% - 56px)',
			bottom: 0,
			overflow: 'auto'
		});

	  this.scrollHandler = throttle(() => {
			// 调用子组件scrollHandler
			//this.callerChildScrollHandler();
			if (this.isFirstLoad || (!this.isCallering && this.isToBottom())) {
				if (this.currentPage >= this.pageCount) {
					alert('没有更多了');
					return;
				}

				const skip = (this.currentPage++) * this.props.pageSize;

				this.isCallering = true;
			  this.setState({
					lazyloadBoxs: [
						...this.state.lazyloadBoxs,
						...this.props.list.slice(skip, skip + this.props.pageSize)
					]
				}, () => {
					this.isCallering = false;
				});
			}
			this.isFirstLoad = false;
	  }, __DELAY__, __MUSTEXECTIME__);
	}

	isToBottom() {
    const visualHeight = this.node.getBoundingClientRect().height;
		const artualHeight = this.node.scrollHeight;
		const artualScrollTop = this.node.scrollTop;

		return visualHeight + artualScrollTop >= artualHeight;
	}

	render() {
    return React.createElement(this.props.nodeName, {
			style: this.getStyle(this.state.height)
		}, (
			<div ref={innerEl => this.innerEl = innerEl}>
			  {this.state.lazyloadBoxs.map((lazyloadBox, index) => {
					let __LazyloadBox__ = (
						<LazyloadBox
							ref={'lazyloadBox' + index}
							key={index}
							date={lazyloadBox.date}
							list={this.props.list[index].photos}
							allPhotos={this.props.allPhotos}
							addListToSelection={this.props.addListToSelection}
							lookPhotoDetail={this.props.lookPhotoDetail}
							removeListToSelection={this.props.removeListToSelection}
							onDetectAllOffChecked={() => this.props.onDetectAllOffChecked(Object.keys(this.refs).map(refName => this.refs[refName].refs['photoListByDate']))}
							onGetPhotoListByDates={() => this.props.onGetPhotoListByDates(Object.keys(this.refs).map(refName => this.refs[refName].refs['photoListByDate']))}
							onAddHoverToList={() => this.props.onAddHoverToList(Object.keys(this.refs).map(refName => this.refs[refName].refs['photoListByDate']))}
							onRemoveHoverToList={() => this.props.onRemoveHoverToList(Object.keys(this.refs).map(refName => this.refs[refName].refs['photoListByDate']))}>
							<PhotoListByDate />
						</LazyloadBox>
					);
					return __LazyloadBox__;
				})}
			</div>
		));
	}

	componentDidMount() {
	  this.node = findDOMNode(this);
		this.scrollHandler();

		//console.log(Object.keys(this.refs).filter(refName => refName.indexOf('lazyloadBox') >= 0).forEach(refName => this.lazyloadBoxs.push(this.refs[refName].props.children)), 'm,dddfd');

	  add(this.node, 'scroll', this.scrollHandler);
	}

	componentWillUnmount() {
    remove(this.node, 'scroll', this.scrollHandler);
	}
}

ScrollFlush.propTypes = {
  nodeName: PropTypes.string,
	pageSize: PropTypes.number,
	list: PropTypes.array.isRequired
};

ScrollFlush.defaultProps = {
  nodeName: 'div',
	pageSize: 10
};
