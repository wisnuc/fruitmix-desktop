/**
  dom操作
**/

'use strict';

import { parseUpperToCable } from './stringDeal';

export function getScrollTop (el = document) {
  return el.nodeType === 9
	  ? el.compatMode === 'CSS1Compat'
		  ? el.body.scrollTop
			: el.documentElement.scrollTop
		: el.scrollTop;
}

export function computedStyle (el, attr) {
	attr = parseUpperToCable(attr);

	return el.currentStyle
		? el.currentStyle[attr]
		: document
		    .defaultView
			  .getComputedStyle(el, null)
			  .getPropertyValue(attr);
}

export function offset (el) {
  const boundClientRect = el.getBoundingClientRect();

	return {
		left: boundClientRect.left + window.pageXOffset,
		top: boundClientRect.top + window.pageYOffset
	}
}
