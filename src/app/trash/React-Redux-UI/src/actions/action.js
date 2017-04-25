/**
  action
**/

import * as Constant from '../constants/constant';

export default {
  changeRadioStatus(status) {
    return {
      type: Constant.RADIO_SELECT,
      status
    };
  },

  showShareRadios(value) {
    return {
      type: Constant.SHARE_RADIO_DATA,
      value
    };
  }
};
