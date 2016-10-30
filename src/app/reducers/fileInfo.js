// fileInfo.js

export default function (state = {}, action) {
  switch(action.type) {
    case 'CREATE_FILE_INFO':
      return Object.assign({}, state, action.fileInfo);
    case 'CLEAR_FILE_INFO':
      return {};
    default:
      return state;
  }
}
