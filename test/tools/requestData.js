const os = require('os')
const fs = require('fs')
const path = require('path')
const request = require('superagent')

const url = 'http://10.10.9.249:3000/media'
const datePath = path.resolve(os.homedir(), 'data.json')
const token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiZDBhNGViZDYtMmFjMi00MGU4LWI2ZWQtZTMxMzNjZGEyMmY2In0.aFdiMiisuI2xcmAp5mvXfYWyuDKUv_VwzoOOPac3SsI'

request.get(url).set('Authorization', token).end((err, res) => {
  if (err) return console.log('Error: ', err)
  fs.writeFileSync(datePath, JSON.stringify(res.body))
})
