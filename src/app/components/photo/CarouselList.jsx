/**
  CarouselList.jsx
**/

import React, { Component, PropTypes } from 'react';

const CarouselItem = ({ style, path }) => (
  <div style={ style }>
    <div style={{ borderRadius: 4, width: 90, height: 90, overflow: 'hidden' }}>
      <img src={ path } style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
    </div>
  </div>
);

export default class CarouselList extends Component {
  constructor() {
    super();

    this.style = {
      carouselItem: {
        flexShrink: 0,
        flexGrow: 0,
        marginRight: 10
      }
    };
  }

  render() {
    let { style, items } = this.props;

    return (
      <div style={ style }>
        { items.map((item, index) => (
            <CarouselItem
              key={ item + index }
              path={ item }
              style={ this.style.carouselItem } />
            )
          )
        }
      </div>
    );
  }
}

CarouselList.propTypes = {
  style: PropTypes.object,
  items: PropTypes.array.isRequired
}
