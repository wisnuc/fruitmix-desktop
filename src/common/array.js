/* Test whether `parent` includes all elements in `child` or not. */
export const includeAll = (parent, child) => {
  if (child.length > parent.length) return false
  if (child.length > 10 * Math.log(parent.length)) {
    const c = child.sort()
    const p = parent.sort()
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
  }
  return child.every(v => parent.includes(v))
}

/* renturn the combined array of a and b. */
export const combineElement = (a, b) => [...(new Set([...a, ...b]))]

/* remove any elements found in a from b, renturn the new array. */
export const removeElement = (a, b) => b.filter(e => !a.includes(e))
