/**
  所有照片
**/

import React, { Component, PropTypes } from 'react';

import ImageByDate from './ImageByDate.jsx';

export default class AllPhotos extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <ImageByDate imageInfo={ [1] } date="2016-8-12"></ImageByDate>  
      </div>
    );
  }
}
