/**
  LazyloadBox.jsx
**/

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { add, remove } from './utils/eventListeners';
import throttle from './utils/throttle';
import Lazyload from './Lazyload';

const __DELAY__ = 300;
const __MUSTEXECTIME__ = 200;

export default class LazyloadBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      height: this.props.height
    };

    this.scrollHandler = throttle((parentNodeWidth, scrollTop) => {
      this.setState({ visible: this.inVisualNode(parentNodeWidth, scrollTop) });
    }, __DELAY__, __MUSTEXECTIME__);
    this.inVisualNode = (parentNodeWidth, scrollTop) => {
      const actualTop = this.props.actualTop - scrollTop;
      return actualTop < parentNodeWidth
        && actualTop + this.state.height >= 0;
    };
    this.getStyle = () => ({
      position: 'absolute',
      left: 0,
      width: '100%',
      height: `${this.state.height}px`,
      top: `${this.props.actualTop}px`
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.actualTop !== this.props.actualTop
      || nextState.height !== this.state.height
      || nextState.visible !== this.state.visible;
  }

  render() {
    return this.state.visible
      ? (
          <div style={ this.getStyle() }>
            {React.createElement(this.props.children.type, {
              style: { display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start', marginBottom: 15 },
              key: this.props.key,
              date: this.props.date,
              allPhotos: this.props.allPhotos,
              photos: this.props.list,
              addListToSelection: this.props.addListToSelection,
              lookPhotoDetail: this.props.lookPhotoDetail,
              removeListToSelection: this.props.removeListToSelection
            })}
          </div>
        )
      : null;
  }
}

LazyloadBox.propTypes = {
  date: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  actualTop: PropTypes.number.isRequired
};
