/**
  获取变量数据类型
**/

'use strict';

const types = [
	'number',
	'string',
	'boolean',
	'function',
	'array',
	'object'
];

const class2type = {};
const nativeToString = Object.prototype.toString;

for (const value of types) {
	const newValue = value.charAt(0).toUpperCase() + value.slice(1);
	class2type['[object ' + newValue + ']'] = value;
}

export function getType (any) {
	if (any == null)
		return '' + any;

	const type = nativeToString.call(any);

	if (!(type in class2type)) {
		// Window对象
		if (any.self === any)
			return 'window';

		// HTMLElement对象
		if (HTMLElement.prototype.isPrototypeOf(any))
			return 'element';
	}

	return class2type[type];
}
