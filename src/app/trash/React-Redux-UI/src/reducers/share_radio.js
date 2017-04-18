/**
  share component radio raducer
**/

import * as Constant from '../constants/constant';

const shareRadioData = [
  { value: 'all_people', text: '给所有人', readOnly: false, checked: true },
  { value: 'custom', text: '自定义', readOnly: false, checked: false }
];

export default function shareRadio (state = shareRadioData, action) {
  switch (action.type) {
    case Constant.SHARE_RADIO_DATA:
      const selectedItem = state.find(item =>
        item.value === action.value
      );

      if (!selectedItem) {
        return state;
      }

      return state.map(item => {
        if (item === selectedItem) {
          return Object.assign({}, item, { checked: !item.checked });
        } else {
          return Object.assign({}, item, { checked: false });
        }
      });

    default:
      return state;
  }
}
