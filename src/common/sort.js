import { toTimeSecond } from '../common/datetime'

const sort = (a, b, sortType) => {
  if (a.type === 'directory' && b.type === 'file') return -1
  if (a.type === 'file' && b.type === 'directory') return 1
  switch (sortType) {
    case 'nameUp':
      return a.name.localeCompare(b.name)
    case 'nameDown':
      return b.name.localeCompare(a.name)
    case 'sizeUp':
      return (a.size !== undefined && b.size !== undefined) ? (a.size - b.size) : a.name.localeCompare(b.name)
    case 'sizeDown':
      return (a.size !== undefined && b.size !== undefined) ? (b.size - a.size) : a.name.localeCompare(b.name)
    case 'timeUp':
      return (a.mtime && b.mtime) ? (a.mtime - b.mtime) : a.name.localeCompare(b.name)
    case 'timeDown':
      return (a.mtime && b.mtime) ? (b.mtime - a.mtime) : a.name.localeCompare(b.name)
    case 'takenUp':
      if (a.metadata && a.metadata.date && !(b.metadata && b.metadata.date)) return -1
      if (!(a.metadata && a.metadata.date) && b.metadata && b.metadata.date) return 1
      return (a.metadata && a.metadata.date && b.metadata && b.metadata.date)
        ? toTimeSecond(a.metadata.date) - toTimeSecond(b.metadata.date) : a.name.localeCompare(b.name)
    case 'takenDown':
      if (a.metadata && a.metadata.date && !(b.metadata && b.metadata.date)) return -1
      if (!(a.metadata && a.metadata.date) && b.metadata && b.metadata.date) return 1
      return (a.metadata && a.metadata.date && b.metadata && b.metadata.date)
        ? toTimeSecond(b.metadata.date) - toTimeSecond(a.metadata.date) : a.name.localeCompare(b.name)
    default:
      return a.name.localeCompare(b.name)
  }
}

export default sort
