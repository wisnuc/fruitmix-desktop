import i18n from 'i18n'

/**
 * @param { Object } node props
 * @return { String } i18n message
*/

export function xcopyMsg(props) {
  const getName = (node) => {
    let name
    switch (node.type) {
      case 'home':
        name = i18n.__('Home Title')
        break
      case 'public':
        name = node.name !== undefined ? node.name : i18n.__('Share Title')
        break
      case 'share':
        name = i18n.__('Share Title')
        break
      default:
        name = node.name
    }
    if (name.length > 20) return `${name.slice(0, 17)}...`
    return name
  }

  const { type, srcDir, dstDir, entries } = props
  const action = type === 'move' ? i18n.__('Moved') : type === 'copy' ? i18n.__('Copied') : i18n.__('Shared')
  const srcName = getName(srcDir)
  const dstName = getName(dstDir)
  const target = entries.length > 1 ? i18n.__('%s Items Have Been', entries.length) : i18n.__('%s Has Been', getName(entries[0]))
  return i18n.__('xcopyMsg {{action}} {{srcName}} {{dstName}} {{target}}', { action, srcName, dstName, target })
}
