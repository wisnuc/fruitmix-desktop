/**
  image_item reducer
**/

export default function (state = [], action) {
  switch (action.type) {
    case 'ADD_DRAG_IMAGEITEM':
      const cloneState = state.slice(0);
      cloneState.push({
        el: action.el,
        date: action.date,
        index: action.index
      });
      console.log(cloneState, 'gg');

      return cloneState;
    case 'REMOVE_DRAG_IMAGEITEM':
      const dragedItem = state.find(item =>
        item.date === action.date
          && item.index === action.index
      );

      if (!dragedItem) {
        return state;
      }

      return state.filter(item =>
        item !== dragedItem
      );
    default:
      return state;
  }
}
