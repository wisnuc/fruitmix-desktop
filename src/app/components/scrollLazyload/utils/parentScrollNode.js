const getStyle = (node, attr) =>
  node.style[attr] || getComputedStyle(node, null).getPropertyValue(attr);

  const getOverflowStyle = (node) =>
    getStyle(node, 'overflow') + getStyle(node, 'overflow-y');

export default (node) => {
  let parent = node;

  while(parent) {
    if (!parent.offsetParent)
    break;

    if (/scroll|auto/.test(getOverflowStyle(parent)))
    break;

    parent = parent.parentNode;
  }

return parent;
};
