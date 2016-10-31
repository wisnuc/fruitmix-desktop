/**
  查看大图 reducer
**/

export default function (state = {}, action) {
  switch (action.type) {
    case 'LARGE_IMAGE':
      const ret = {};

      if (action.largeImageEls.length) {
        ret.currentThumbIndex = action.currentThumbIndex;
        ret.date = action.date;
        ret.hash = action.hash;
        ret.data = [];
      }

      action.largeImageEls.forEach(el =>
        ret.data.push(el.dataset.hash)
      );

      return ret;
    case 'REMOVE_LARGE_IMAGE':
      return {};
    default:
      return state;
  }
}
