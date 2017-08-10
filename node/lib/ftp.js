const fs = require('fs')
const FTP = require('ftp')

const ftpGet = (remotePath, tmpPath, localPath) => {
  const fileName = remotePath.replace(/.*\//, '')
  const c = new FTP()
  const promise = new Promise((resolve, reject) => {
    c.on('ready', () => {
      c.get(remotePath, (err, stream) => {
        if (err) return reject()
        console.log(fileName)
        stream.once('close', () => { c.end() })
        const ws = fs.createWriteStream(tmpPath)
        ws.on('finish', () => {
          fs.rename(tmpPath, localPath, (err) => {
            if (!err) return resolve(localPath)
            return reject()
          })
        })
        stream.pipe(ws)
      })
    })
  })
  const op = {
    host: '120.27.108.153',
    port: 83,
    user: 'download',
    password: 'qyeTQMq2DzHAtvHO'
  }
  c.connect(op)
  return promise
}

export { ftpGet }
