/* Test whether `parent` includes all elements in `child` or not, parent and child are already sort */
export const includeAll = (p, c) => {
  if (c.length > p.length) return false
  let k = 0
  for (let i = 0; i < c.length; i++) {
    let Got = false
    for (let j = k; j < p.length; j++) {
      if (c[i] === p[j]) {
        Got = true
        k = j
        break
      }
    }
    if (!Got) return false
  }
  return true
  // return child.every(v => parent.includes(v))
}

/* renturn the combined array of a and b. */
export const combineElement = (a, b) => [...(new Set([...a, ...b]))]

/* remove any elements found in a from b, renturn the new array. */
export const removeElement = (a, b) => b.filter(e => !a.includes(e))

/* union two Object array by id */
export const unionBy = (a, b, key) => {
  const keys = [...(new Set([...a.map(x => x[key]), ...b.map(x => x[key])].filter(x => !!x)))]
  const union = Array.from({ length: keys.length }).map((v, i) => {
    const id = keys[i]
    const aa = a.find(x => x[key] === id) || {}
    const bb = b.find(x => x[key] === id) || {}
    const ele = Object.assign({}, aa, bb)
    return ele
  })
  return union
}

/* chunk array's element by size, chunk([1,2,3,4,5], 2) => [[1,2], [3,4], [5]] */
export const chunk = (arr, s) => {
  const size = Math.max(s, 0)
  if (!Array.isArray(arr) || !arr.length || !size) return []
  let i = 0
  const array = []
  while (arr.length > i * size) {
    array.push(arr.slice(i * size, i * size + size))
    i += 1
  }
  return array
}
