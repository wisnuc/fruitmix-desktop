/**
  Carousel.jsx
**/

import React, { Component, PropTypes } from 'react';
import CarouselTopBar from './CarouselTopBar';
import CarouselBottomBar from './CarouselBottomBar';
import CarouselList from './CarouselList';
import SlideToAnimate from './SlideToAnimate';

const __MARGIN_DISTANCE__ = 60;

export default class Carousel extends Component {
  render() {
    const { style, items } = this.props;

    return (
      <div style={ style }>
        <div style={{ width: '100%' }}>
          <CarouselTopBar
            style={{ marginLeft: __MARGIN_DISTANCE__, height: 45 }} />

          <SlideToAnimate style={{ marginLeft: __MARGIN_DISTANCE__, marginRight: __MARGIN_DISTANCE__, height: 90 }}>
            <CarouselList
              items={ items }
              style={{ display: 'flex', flexFlow: 'row no-wrap', stringifyContent: 'space-between' }} />
          </SlideToAnimate>

          <CarouselBottomBar
            style={{ marginLeft: __MARGIN_DISTANCE__, textAlign: 'center' }}
            count={4} />
        </div>
      </div>
    );
  }
}

Carousel.propTypes = {
  style: PropTypes.object,
  items: PropTypes.array
};
