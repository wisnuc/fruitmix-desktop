/**
  日期时间处理
* */

/**
 * 日期时间字符串转换成日期字符串
 *
 * @param { String } 日期时间 "2016:05:03 17:30:45"
 * @return { String } 返回 2016/05/03
*/
export function toDateString(datetime) {
  const dateStr = datetime.trim().split(/\s+/)[0]

  return dateStr.replace(/:/g, '/').replace(/\//g, '/')
}

/**
 * 日期时间字符串格式化 最后结果为格式好的日期字符串
 *
 * @param { String } 日期时间 "2016:05:03 17:30:45"
 * @return { String } 返回 2016-05-03
*/
export function formatDate(datetime = '', formatStr = '-') {
  const dateStr = toDateString(datetime || '')

  return dateStr.replace(/\//g, formatStr)
}

/**
 * 日期时间字符串格式化 最后结果为按秒计算的时间
 *
 * @param { String } 日期时间 "2016:05:03 17:30:45"
 * @return { String } 返回 1464946245000
*/
export function toTimeSecond(datetime) {
  const dateStr = datetime.trim().split(/[\s:]+/)
  if (!dateStr || dateStr.length !== 6) return 0
  return (new Date(...dateStr).getTime())
}
