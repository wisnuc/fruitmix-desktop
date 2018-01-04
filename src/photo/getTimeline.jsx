import React from 'react'

const getTimeline = (photoDates, indexHeightSum, maxScrollTop, height) => {
  const month = new Map()
  let dateUnknown = 0
  /* parse data to list of month */
  photoDates.forEach((date) => {
    if (!date) return (dateUnknown += 1)
    const b = date.split(/-/)
    const mix = `${b[0]}-${b[1]}`
    if (month.has(mix)) {
      month.set(mix, month.get(mix) + 1)
    } else {
      month.set(mix, 1)
    }
    return null
  })
  if (dateUnknown) month.set('0', dateUnknown)

  let sumCount = 0
  let spacingCount = 0
  let currentYear = null
  const timeline = [...month].map((data, index) => {
    let percentage = 0
    if (sumCount) {
      percentage = (indexHeightSum[sumCount - 1] - 200) / maxScrollTop
    }
    /* top = percentage * height + headerHeight - adjust */
    let top = percentage * height - 8

    const spacingPercentage = (indexHeightSum[spacingCount] - 200) / maxScrollTop
    const spacingTop = spacingPercentage * height

    sumCount += data[1]
    spacingCount += data[1]
    let date
    let zIndex = 2
    if (currentYear !== parseInt(data[0], 10)) {
      date = parseInt(data[0], 10)
    } else {
      date = <hr style={{ width: 8 }} />
    }
    currentYear = parseInt(data[0], 10)
    if (!index) { // first date
      top = 8
      spacingCount = 0
    } else if (index === month.size - 1) { // last date
      top += 20
      if (top > height - 26) top = height - 26
    } else if (spacingTop > 32 && date === parseInt(data[0], 10)) { // show years with enough spacing
      spacingCount = 0
    } else if (date === parseInt(data[0], 10)) { // hide years without enough spacing
      date = null
    } else { // show bar
      zIndex = 1
    }

    /* set range of displaying date */
    if (top < 16 && index) date = null
    if (top > (height - 46) && index !== month.size - 1) date = null
    return [date, top, zIndex, percentage]
  })
  return timeline
}

export default getTimeline
