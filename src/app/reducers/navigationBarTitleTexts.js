/**
  导航条 reducer
**/

export default function (state=['所有照片'], action) {
  switch(action.type) {
    case 'TOGGLE_NAVIGATOR':
      return action.titleTexts.slice();
    default:
      return state;
  }
}
