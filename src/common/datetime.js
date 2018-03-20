import i18n from 'i18n'

/**
 * @param { String } "2016:05:03 17:30:45"
 * @return { String } 2016/05/03
*/
export function toDateString (datetime) {
  const dateStr = datetime.trim().split(/\s+/)[0]

  return dateStr.replace(/:/g, '/').replace(/\//g, '/')
}

/**
 * @param { String } "2016:05:03 17:30:45"
 * @return { String } 2016-05-03
*/
export function formatDate (datetime = '', formatStr = '-') {
  const dateStr = toDateString(datetime || '')

  return dateStr.replace(/\//g, formatStr)
}

/**
 * @param { String } "2016:05:03 17:30:45"
 * @return { String } 1464946245000
*/
export function toTimeSecond (datetime) {
  const dateStr = datetime.trim().split(/[\s:]+/)
  if (!dateStr || dateStr.length !== 6) return 0
  return (new Date(...dateStr).getTime())
}

/**
 * @param { String } "1464946245000"
 * @return { String } 2016-05-03 17:30
*/

export function formatTime (d) {
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

/**
 * parseTime: return a short version timestamp
 *
 */

export function parseTime (time) {
  const d = new Date()
  if (typeof time === 'number') d.setTime(time)
  else return '-'

  const n = new Date() // now
  const [year, mon, day, hour, min] = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]
    .map((a, i) => (i > 2 && a < 10 ? `0${a}` : a))

  const [ye, mo, da] = [n.getFullYear(), n.getMonth() + 1, n.getDate()]

  const [ly, ld] = [new Date(`${ye}`), new Date(`${ye}-${mo}-${da}`)]
    .map(a => a.getTime()) // last year, last month, yesterday

  const t = d.getTime() // target time
  const nt = n.getTime() // now

  if (t < ly) return i18n.__('Year {{year}} {{mon}} {{day}}', { year, mon, day })
  else if (t + 86400000 < ld) return i18n.__('Month {{mon}} {{day}}', { mon, day })
  else if (t < ld) return i18n.__('Yesterday {{hour}} {{min}}', { hour, min })
  else if (t < nt + 18000000) return i18n.__('Hour {{hour}} {{min}}', { hour, min })
  else if (t < nt + 3600000) return i18n.__n('%d Hours Ago', Math.floor((t - nt) / 3600000))
  else if (t < nt) return i18n.__n('%d Minutes Ago', Math.floor((t - nt) / 60000) || 1)
  return i18n.__('Year {{year}} {{mon}} {{day}}', { year, mon, day })
}

/**
 * parseTime: return the full timestamp
*/

export function parseFullTime (time) {
  const d = new Date()
  if (typeof time === 'number') d.setTime(time)
  else return '-'

  const n = new Date() // now
  const [hour, min] = [d.getHours(), d.getMinutes()]
    .map((a, i) => (i > 2 && a < 10 ? `0${a}` : a))

  const [ye, mo, da] = [n.getFullYear(), n.getMonth() + 1, n.getDate()]

  const [ly, ld] = [new Date(`${ye}`), new Date(`${ye}-${mo}-${da}`)]
    .map(a => a.getTime()) // last year, last month, yesterday

  const t = d.getTime() // target time
  const nt = n.getTime() // now

  const locale = i18n.getLocale()
  const op = {}
  op.year = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }
  op.month = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }
  op.hour = { hour: '2-digit', minute: '2-digit', hour12: false }

  if (t < ly) return d.toLocaleString(locale, op.year)
  else if (t + 86400000 < ld) return d.toLocaleString(locale, op.month)
  else if (t < ld) return i18n.__('Yesterday {{hour}} {{min}}', { hour, min })
  else if (t < nt + 18000000) return d.toLocaleString(locale, op.hour)
  return d.toLocaleString(locale, op.year)
}

export function formatMtime (mtime) {
  if (!mtime) return null
  const time = new Date()
  time.setTime(parseInt(mtime, 10))
  return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`
}
