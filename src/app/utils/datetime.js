/**
  日期时间处理
**/

/**
 * 日期时间字符串转换成日期字符串
 *
 * @param { String } 日期时间 "2016:05:03 17:30:45"
 * @return { String }
*/
export function toDateString (datetime) {
  const dateStr = datetime.trim().split(/\s+/)[0];

  return dateStr.replace(/:/g, '/').replace(/\/0/g, '/');
}

/**
 * 日期时间字符串格式化 最后结果为格式好的日期字符串
 *
 * @param { String } 日期时间 "2016:05:03 17:30:45"
 * @return { String }
*/
export function formatDate (datetime = '', formatStr = '-') {
  const dateStr = toDateString(datetime || '');

  return dateStr.replace(/\//g, formatStr);
}
