/**
  PhotoToolBar.jsx
**/

import React, { Component } from 'react';
import { Paper } from 'material-ui';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right';

const toolbarStyle = {

  activeIcon: {
    color: '#000',
    opacity: 0.54
  },

  inactiveIcon: {
    color: '#000',
    opacity: 0.26
  },

  whiteIcon: {
    color: '#FFF',
    opacity: 1
  },

  hiddenIcon: {
    color: '#FFF',
    opacity: 0
  }
};

export default class PhotoToolBar extends Component {
  buildBreadCrumb(path) {
    if (!path) return null;

    let list = []

    path.forEach((node, index, arr) => {
      list.push(
        <span
          style={{
            fontSize: 21,
            fontWeight: 'medium',
            color: '#FFF',
            opacity: index === arr.length - 1 ? 1 : 0.7,
          }}>
          {index === 0 ? '照片' :  node.name}
        </span>
      )

      if (index !== arr.length - 1)
        list.push(<NavigationChevronRight />)
    })

    return list;
  }

  render() {
    let { action, state } = this.props;

    return (
      <Paper
        style={{
          position: 'absolute', width: '100%', height: 56,
          backgroundColor: '#2196F3',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start'
        }}
        rounded={ false }
        transitionEnabled={ false }>

        <IconButton style={{marginLeft: 4}}
          iconStyle={toolbarStyle.activeIcon}
          onTouchTap={action}>
          <NavigationMenu />
        </IconButton>

        <div style={{marginLeft: 20, flex: '0 0 138px', fontSize: 21, whiteSpace: 'nowrap', color: '#FFF'}}>
          { this.buildBreadCrumb(state) }
        </div>

      </Paper>
    );
  }
}
