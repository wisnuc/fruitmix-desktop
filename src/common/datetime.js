/**
 * @param { String } "2016:05:03 17:30:45"
 * @return { String } 2016/05/03
*/
export function toDateString(datetime) {
  const dateStr = datetime.trim().split(/\s+/)[0]

  return dateStr.replace(/:/g, '/').replace(/\//g, '/')
}

/**
 * @param { String } "2016:05:03 17:30:45"
 * @return { String } 2016-05-03
*/
export function formatDate(datetime = '', formatStr = '-') {
  const dateStr = toDateString(datetime || '')

  return dateStr.replace(/\//g, formatStr)
}

/**
 * @param { String } "2016:05:03 17:30:45"
 * @return { String } 1464946245000
*/
export function toTimeSecond(datetime) {
  const dateStr = datetime.trim().split(/[\s:]+/)
  if (!dateStr || dateStr.length !== 6) return 0
  return (new Date(...dateStr).getTime())
}

/**
 * @param { String } "1464946245000"
 * @return { String } 2016-05-03 17:30
*/

export function formatTime(d) {
  const date = new Date()
  if (typeof d === 'number') {
    date.setTime(d)
  } else {
    return '-'
  }
  const year = date.getFullYear()
  const mouth = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${year}-${mouth}-${day} ${hour}:${minute}`
}
