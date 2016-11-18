/**
  photo.js
  @description  photo相关的数据和组件状态统一抽象成方法
**/

export default {
  initialState: {
    // 是否显示预加载
    preloadVisible: false,
    // 数据总数
    total: null,
    // 当前页
    current: 1,
    // 每页多少条
    pageSize: 30,
    // 是否显示hover渐变
    gradientVisible: false,
    // 数据源
    dataSource: []
  },

  reducers: {
    querySuccess(state, action) {
      return Object.assign({}, state, action.payload, { preloadVisible: false });
    }

    showPreload(state) {
      return Object.assign({}, state, { preloadVisible: true });
    },

    hidePreload(state) {
      return Object.assign({}, state, { preloadVisible: false });
    },

    showGradient(state) {
      return Object.assign({}, state, { gradientVisible: true });
    },

    hideGradient() {
      return Object.assign({}, state, { gradientVisible: false });
    }
  }
};
