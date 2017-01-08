/**
  Carousel.jsx
**/

import React, { Component, PropTypes } from 'react';
import CarouselTopBar from './CarouselTopBar';
import CarouselBottomBar from './CarouselBottomBar';
import CarouselList from './CarouselList';
import SlideToAnimate from './SlideToAnimate';

const __MARGIN_DISTANCE__ = 60;
const __PART_HEIGHT__ = 45;

export default class Carousel extends Component {
  render() {
    const { style, items } = this.props;

    return (
      <div style={ style }>
        <div style={{ width: '100%' }}>
          <CarouselTopBar
            onClearHoverToList={this.props.onClearHoverToList}
            style={{ marginLeft: __MARGIN_DISTANCE__, marginRight: __MARGIN_DISTANCE__, height: __PART_HEIGHT__, lineHeight: __PART_HEIGHT__ + 'px' }} />

          <SlideToAnimate
            style={{ marginLeft: __MARGIN_DISTANCE__, marginRight: __MARGIN_DISTANCE__, height: 90 }}
            direLeft={ -45 }
            direRight={ -45 }
            translateCount={ items.length }
            translateGrep={ 10 }
            translateDistance={ 90 }>
            <CarouselList
              items={ items }
              style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-start' }} />
          </SlideToAnimate>

          <CarouselBottomBar
            style={{ marginLeft: __MARGIN_DISTANCE__, marginRight: __MARGIN_DISTANCE__, textAlign: 'center', height: __PART_HEIGHT__, lineHeight: __PART_HEIGHT__ + 'px' }}
            count={ items.length } />
        </div>
      </div>
    );
  }
}

Carousel.propTypes = {
  style: PropTypes.object,
  items: PropTypes.array
};
