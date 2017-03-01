
/* 
 * modify debug filter before application starts'
 */

console.log('localStorage.debug, old', localStorage.debug)

// localStorage.debug = 'main,lib:*,view:*,app:*,reducer:*,component:*'
localStorage.debug = 'nothing'

console.log('localStorage.debug, new', localStorage.debug)

require('./fruitmix')

