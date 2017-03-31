export default (node, parentScrollNode) => {
  const scrollTop = window.pageYOffset;
  const nodeTop = node.getBoundingClientRect().top + scrollTop;
  const parentClientRect = parentScrollNode.getBoundingClientRect();
  const parentTop = parentClientRect.top + scrollTop;

  const actualTop = nodeTop - parentTop - scrollTop;

  return actualTop < parentClientRect.height
};
