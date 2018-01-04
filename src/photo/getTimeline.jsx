const timelineMargin = 26
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
  let preTop = 0
  let currentYear = null
  let preIsYear = false
  const timeline = [...month].map((data, index) => {
    let percentage = 0
    if (sumCount) {
      percentage = (indexHeightSum[sumCount - 1] - 200) / maxScrollTop
    }
    /* top = percentage * height + headerHeight - adjust */
    let top = percentage * height - 8

    const spacingTop = top - preTop

    sumCount += data[1]
    let date
    const indexYear = parseInt(data[0], 10)
    if (currentYear !== indexYear) date = indexYear
    else date = -1 // render <hr />

    currentYear = indexYear
    if (!index) { // first date
      top = 8
      preTop = top
    } else if (index === month.size - 1) { // last date
      top += 20
      if (top > height - 26) top = height - 26
    } else if (spacingTop > timelineMargin && date === indexYear) { // show years with enough spacing
      preTop = top
      preIsYear = true
    } else if (date === indexYear && !preIsYear) { // hide years without enough spacing
      preTop = top
      preIsYear = true
    } else if (spacingTop > timelineMargin) { // show bar
      preTop = top
      preIsYear = false
    } else date = null

    /* set range of displaying date */
    if (top < 16 && index) date = null
    if (top > (height - 46) && index !== month.size - 1) date = null

    return ({ date, top, percentage, raw: data, spacingTop })
  }).filter(t => t.date !== null) // remove unused data

  /* remove the bar in the near top of year */
  for (let i = timeline.length - 1; i > -1; i--) {
    if (timeline[i].date !== -1 && timeline[i].spacingTop < timelineMargin && i > 0) timeline[i - 1].date = null
  }
  return timeline.filter(t => t.date !== null)
}

export default getTimeline
