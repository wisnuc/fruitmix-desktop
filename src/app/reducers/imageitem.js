/**
  image_item reducer
**/

export default function (state = [], action) {
  switch (action.type) {
    case 'ADD_DRAG_IMAGEITEM':
      const cloneState = state.slice();
      cloneState.push({
        el: action.el,
        date: action.date,
        index: action.index
      });

      return cloneState;

    case 'ADD_DRAG_IMAGELIST':
      const cloneAddedState = state.slice();
      const date = action.date;
      const cloneEls = [];

      action.els.forEach(el => {
        const elIndex = state.findIndex(ele => ele.el === el);

        if (elIndex < 0) {
          cloneEls.push({ el, date, index: el.dataset.index });
        }
      });

      return cloneAddedState.concat(cloneEls);
    case 'REMOVE_DRAG_IMAGEITEM':
      const dragedItem = state.find(item =>
        item.date === action.date
          && item.index == action.index
      );

      if (!dragedItem) {
        return state;
      }

      return state.filter(item =>
        item !== dragedItem
      );
    case 'REMOVE_DRAG_IMAGELIST':
      return state.filter(item =>
        item.date !== action.date
      );
    case 'CLEAR_DRAG_IMAGEITEM':
      return [];
    default:
      return state;
  }
}
