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
