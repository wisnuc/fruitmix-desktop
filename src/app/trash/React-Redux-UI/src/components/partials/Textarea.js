/**
  TextArea(多行输入框) | 不可再分组件
**/

'use strict';

import React, { Component, PropTypes } from 'react';
import { pick, computedStyle } from '../../utils';

class Textarea extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: props.rows
    }
  }

  getSingleLineHeight() {
    const cloneNode = this.el.cloneNode();

    cloneNode.rows = 1;
    cloneNode.style.minHeight = 'inherit';

    document.body.appendChild(cloneNode);

    const paddingTop = parseInt(computedStyle(cloneNode, 'paddingTop'));
    const paddingBottom = parseInt(computedStyle(cloneNode, 'paddingBottom'));
    const clientHeight = cloneNode.clientHeight;

    document.body.removeChild(cloneNode);

    return clientHeight - paddingTop - paddingBottom;
  }

  getScrollHeight() {
    return this.el.scrollHeight;
  }

  getClientHeight() {
    return this.el.clientHeight;
  }

  adaptHeight() {
    const { textareaAdaptRows } = this.props;
    const { rows } = this.state;
    const singleLineHeight = this.getSingleLineHeight();
    const scrollHeight = this.getScrollHeight();
    const clientHeight = this.getClientHeight();
    const changeRows = Math.floor(scrollHeight / singleLineHeight);

    if (scrollHeight > clientHeight) {
      this.setState({ rows: this.state.rows + 1 });
    }
  }

  handleChange(e) {
	  const { changeEventHandle, readOnly, defaultValue } = this.props;

		if (readOnly) {
      return;
    }

    this.adaptHeight();

    const value = e.target.value;

    setTimeout(() => {
      changeEventHandle && changeEventHandle.call(this, value);
    }, 0);
	}

	render() {
		const textareaProps = [
      'className',
      'style',
      'defaultValue',
      'placeholder',
      'readOnly'
    ];

		return (
			<textarea
        ref={ el => this.el = el }
        { ...pick(this.props, textareaProps) }
        rows={ this.state.rows }
        onChange={ this.handleChange.bind(this) }>
      </textarea>
		);
	}
}

Textarea.propTypes = {
  className: PropTypes.string,
	style: PropTypes.object,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
	defaultValue: PropTypes.string,
	readOnly: PropTypes.bool,
	changeEventHandle: PropTypes.func,
  textareaAdaptRows: PropTypes.func
};

Textarea.defaultProps = {
  defaultValue: '',
  rows: 10,
  style: { resize: 'none', outline: 'none', overflowY: 'hidden' },
	readOnly: false
};

export default Textarea;
