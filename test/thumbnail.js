const thumb = require('node-thumbnail').thumb

const source = '/home/lxw/Desktop/Tests/uploadTest/Media/20140725_170402.jpg'
const destination = '/home/lxw/Desktop/'

thumb({
  source,
  destination,
  suffix: '',
  width: 200 * 200 / 57,
  basename: 'test_thumbnail.jpg'
}).catch((e) => {
  console('catch thumb error', e)
})
