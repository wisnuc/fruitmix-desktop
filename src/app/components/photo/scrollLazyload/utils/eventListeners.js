function bind(standard, ie) {
  return function (node, eventName, handler) {
    if (node[standard])
      node[standard](eventName, handler, 'false');
    else if (node[ie])
      node[ie](`on${eventName}`, handler);
  }
}

export const add = bind('addEventListener', 'attachEvent');
export const remove = bind('removeEventListener', 'detachEvent');
