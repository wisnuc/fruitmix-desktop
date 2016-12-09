/**
  CarouselList.jsx
**/

import React, { Component, PropTypes } from 'react';

const CarouselItem = ({ style, path }) => (
  <div style={ style }>
    <img src={ path } style={{ objectFit: 'contain' }} />
  </div>
);

export default class CarouselList extends Component {
  constructor() {
    super();
    
    this.style = {
      carouselItem: {
        width: 90,
        height: 90,
        marginRight: 10
      }
    };
  }

  render() {
    let { style, items } = this.props;

    return (
      <div style={ style }>
        { items.map(item => ( <CarouselItem path={ item } style={ this.style.carouselItem } /> )) }
      </div>
    );
  }
}

CarouselList.propTypes = {
  style: PropTypes.object,
  items: PropTypes.array.isRequired
}
