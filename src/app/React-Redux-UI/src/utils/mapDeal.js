/**
	map处理
**/

'use strict';

export function valuesToArray (map) {
	const array = [];

  for (const [_, value] of map) {
	  array.push(value);
	}

	return array;
}
