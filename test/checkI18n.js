/*
 * cd fruitmix-desktop
 * node test/checkI18n.js
 */

const child = require('child_process')
const string = 'i18n.__'
const dir = './src ./node'
const lines_src = child.execSync(`grep -r ${string} ${dir}`).toString().split('\n').map(l => l.trim()).filter(l => l.length)
const keys_src = lines_src.map(l => l.split('i18n.')).join('__').split('__').filter(l => l.startsWith('(\'')).map(l => l.split('\'')[1])
const unique_src = new Set([...keys_src.sort()])

const fs = require('fs')
const filePath = './locales/en-US.json'
// const filePath = './locales/zh-CN.json'
const lines_loc = fs.readFileSync(filePath).toString().split('\n').map(l => l.trim()).filter(l => l.length)
const filtered_loc = lines_loc.filter(l => !(/====/.test(l)))
const keys_loc = filtered_loc.map(l => l.split('"')[1]).filter(k => !!k)
const unique_loc = new Set([...keys_loc.sort()])

const not_loc = [...unique_src].filter(k => !unique_loc.has(k))
const not_src = [...unique_loc].filter(k => !unique_src.has(k))
const dup_loc = [...keys_loc].filter((l, index) => keys_loc.findIndex(k => k === l) < index)

const all = child.execSync(`grep -r '' ${dir}`).toString().split('\n').map(l => l.trim()).filter(l => l.length)
const chinese = all.filter(l => /[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/.test(l))

console.log('keys in src but not in locale:\n', not_loc, '\n')
console.log('keys in locale but not in src:\n', not_src, '\n')
console.log('lines dupped in locale:\n', dup_loc, '\n')
// console.log('Chinese line in src:\n', chinese, '\n')

