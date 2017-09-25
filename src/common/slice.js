const slice = (str, start, end) => {
  const arr = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
  return arr.slice(start, end).join('');
} 

export default slice
