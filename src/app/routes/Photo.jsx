/**
  照片 Route Component
**/

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

function Photo ({ photos }) {
  //const photo
}

Photo.propTypes = {
  photos: PropTypes.Array
};

const mapStateToProps = ({ photos }) => ({ photos });

export default connect(mapStateToProps)(Photo);
