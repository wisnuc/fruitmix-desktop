/**
  相册hash
**/

export default function (state = '', action) {
  switch (action.type) {
    case 'GET_ALBUM_HASH':
      return action.hash;
    default:
      return state;
  }
}
