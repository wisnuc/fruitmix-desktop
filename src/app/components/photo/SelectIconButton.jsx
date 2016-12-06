/**
  SelectIconButton.jsx
**/

import React, { Component, PropTypes } from 'react';

function getStyles () {
  return {
    root: {
      display: 'block',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: '100%',
      cursor: 'pointer',
      height: '100%',
      width: '100%',
      verticalAlign: 'middle'
    },
    firstLine: {
      display: 'inline-block',
    	height: 2,
    	lineHeight: 0,
    	fontSize: 0,
    	transform: 'rotate(41deg) translateX(5px)',
    	width: 7,
    	verticalAlign: 'middle'
    },
    lastLine: {
      display: 'inline-block',
    	width: 10,
    	height: 2,
    	transform: 'rotate(-40deg) translate(1px,1px)'
    },
    onActive: {
      borderColor: '#576bc0',
      backgroundColor: '#576bc0'
    },
    offActive: {
      borderColor: '#757575',
      backgroundColor: '#757575'
    },
    onActiveByLine: {
      backgroundColor: '#fff'
    },
    offActiveByLine: {
      backgroundColor: '#eee'
    }
  }
}

export default class SelectIconButton extends Component {
  constructor(props) {
    super(props);

    this.style = getStyles();
    this.state = {
      action: 'off'
    };

    this.onActiveByRootStyle = Object.assign({}, this.style.root, this.style.onActive);
    this.offActiveByRootStyle = Object.assign({}, this.style.root, this.style.offActive);
    this.onActiveByFirstLineStyle = Object.assign({}, this.style.firstLine, this.style.onActiveByLine);
    this.offActiveByFirstLineStyle = Object.assign({}, this.style.firstLine, this.style.offActiveByLine);
    this.onActiveByLastLineStyle = Object.assign({}, this.style.lastLine, this.style.onActiveByLine);
    this.offActiveByLastLineStyle = Object.assign({}, this.style.lastLine, this.style.offActiveByLine);

    this.handleClick = (e) => {
      let actionName = this.state.action === 'off'
        ? 'on'
        : 'off';
      this[actionName + 'Selected']();
      e.stopPropagation();
    };
    this.selectBehavior = props.selectBehavior || (() => {});
  }

  onSelected() {
    this.setState({ action: 'on' }, () => this.selectBehavior(this.state.action));
  }

  offSelected() {
    this.setState({ action: 'off' }, () => this.selectBehavior(this.state.action));
  }

  render() {
    return (
      <div style={ this.props.style } onClick={ this.handleClick }>
        <span style={ this[this.state.action + 'ActiveByRootStyle'] }>
          <i style={ this[this.state.action + 'ActiveByFirstLineStyle'] }></i>
          <i style={ this[this.state.action + 'ActiveByLastLineStyle'] }></i>
        </span>
      </div>
    );
  }
}

SelectIconButton.propTypes = {
  style: PropTypes.object,
  selectBehavior: PropTypes.func
};
