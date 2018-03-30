import { formatDate } from '../common/datetime'

let width = 0
let size = 218
let allPhotos = []
let photoDates = []
let photoMapDates = []
let photoListWithSameDate = []
let allHeight = []
let rowHeightSum = 0
let indexHeightSum = []
let maxScrollTop = 0

const getPhotoInfo = (height, w, media, dateUnknownText) => {
  if ((allPhotos !== media || width !== w) && w) {
    /* init */
    width = w
    allPhotos = media
    photoDates = []
    photoMapDates = []
    photoListWithSameDate = []
    allHeight = []
    rowHeightSum = 0
    indexHeightSum = []
    maxScrollTop = 0
    size = Math.floor((w - 60) / Math.floor((w - 60) / 218 + 0.5))

    /* calculate photoMapDates and photoDates */
    const MAX = Math.floor((width - 60) / size) - 1
    let MaxItem = MAX
    let lineIndex = 0
    const dateUnknown = []
    allPhotos.forEach((item) => {
      const date = item.date || item.datetime
      if (!date || date.search(/:/g) !== 4 || date.search(/^0/) > -1) { // only allow format: "2017:06:17 17:31:18"
        dateUnknown.push(item)
        return
      }
      const formatExifDateTime = formatDate(date)
      const isRepeat = photoDates[photoDates.length - 1] === formatExifDateTime
      if (!isRepeat || MaxItem === 0) {
        MaxItem = MAX
        photoDates.push(formatExifDateTime)
        photoMapDates.push({
          first: !isRepeat,
          index: lineIndex,
          date: formatExifDateTime,
          photos: [item]
        })
        if (!isRepeat) {
          photoListWithSameDate.push({
            date: formatExifDateTime,
            photos: [item]
          })
        } else {
          photoListWithSameDate[photoListWithSameDate.length - 1].photos.push(item)
        }
        lineIndex += 1
      } else {
        MaxItem -= 1
        photoMapDates[photoMapDates.length - 1].photos.push(item)
        photoListWithSameDate[photoListWithSameDate.length - 1].photos.push(item)
      }
    })
    if (dateUnknown.length > 0) {
      photoListWithSameDate.push({ date: dateUnknownText, photos: [] })
      MaxItem = 0
      lineIndex += 1
      let isRepeat = false
      dateUnknown.forEach((item) => {
        photoListWithSameDate[photoListWithSameDate.length - 1].photos.push(item)
        if (MaxItem === 0) {
          MaxItem = MAX
          photoDates.push(0)
          photoMapDates.push({
            first: !isRepeat,
            index: lineIndex,
            date: dateUnknownText,
            photos: [item]
          })
          lineIndex += 1
          isRepeat = true
        } else {
          MaxItem -= 1
          photoMapDates[photoMapDates.length - 1]
            .photos
            .push(item)
        }
      })
    }

    /* calculate each row's heigth and their sum */
    photoMapDates.forEach((list) => {
      const tmp = size * Math.ceil(list.photos.length / Math.floor((width - 60) / size)) + !!list.first * 48
      allHeight.push(tmp)
      rowHeightSum += tmp
      indexHeightSum.push(rowHeightSum)
    })

    maxScrollTop = rowHeightSum - height
    if (rowHeightSum > 1500000) {
      const r = rowHeightSum / 1500000
      indexHeightSum = indexHeightSum.map(h => h / r)
      maxScrollTop = 1500000 - height
    }
  }
  return ({ photoDates, photoMapDates, indexHeightSum, allHeight, maxScrollTop, rowHeightSum, photoListWithSameDate, size: size - 8 })
}

export default getPhotoInfo
