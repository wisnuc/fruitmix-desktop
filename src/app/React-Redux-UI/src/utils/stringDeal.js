/**
	字符串处理
**/

'use strict';

import { getType } from './getType';
import { placeholderExp, upperExp, templateExp } from './regexps';

function replaceStr (strExp) {
	return function (template, obj) {
		return template.replace(strExp, (match, key) => {
			return obj[key] == null ? '' : obj[key];
		});
	}
}

export const replacePlaceholder = replaceStr(placeholderExp);

export const replaceTemplate = replaceStr(templateExp);

export function parseUpperToCable (str) {
	const cable = '-';

	return str.replace(upperExp, match => {
		return cable + match.toLowerCase();
	});
}

export function parseAnyToString (...args) {
	const array = [];

	for (let value of args) {
		let type = getType(value);

		if (type === 'string' || type === 'number') {
			array.push(value);
		} else if (type === 'array') {
			array.push(parseAnyToString.apply(null, value));
		} else if (type === 'object') {
			array.push(parseAnyToString.apply(null, Object.keys(value)));
		}
	}

	return array.join(' ');
}
