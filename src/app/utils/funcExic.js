/**
  函数执行
**/

/**
 * 分时执行自定义函数
 *
 * @param { Array } dataSource 数据源
 * @param { Function } func 待执行的函数
 * @param { Function } finishedFunc
 * @param { Number } count 每次需要执行的数据个数
 * @param { Number } timeout 时间间隙(毫秒单位)
*/
export const timeShare = (dataSource, func, finishedFunc, count = 8, timeout = 200) => {
  let timer;

  function start () {
    const dataList = [];
    const minCount = Math.min(count, dataSource.length);
    let i;

    for (i = 0; i < minCount; i++) {
      dataList.push(dataSource.shift());
    }

    if (i === minCount) {
      func(dataList);
    }
  }

  return () => {
    timer = setInterval(() => {
      if (!dataSource.length) {
        clearInterval(timer);
        return finishedFunc();
      }

      start();
    }, timeout);
  }
}
