/**
  正则集合
**/

'use strict';

export const numberExp = /^\d+|\d*\.\d*$/;
export const placeholderExp = /\{([^{}]+)\}/g;
export const upperExp = /[A-Z]/g;
export const templateExp = /\$\s*\{([a-zA-Z_-]+)\}/g;
