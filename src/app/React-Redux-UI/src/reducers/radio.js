/**
  radio reducer
**/

import * as Constant from '../constants/constant';

export default function radio (state = false, action) {
  switch (action.type) {
    case Constant.RADIO_SELECT:
      return action.status;
    default:
      return state;
  }
}
