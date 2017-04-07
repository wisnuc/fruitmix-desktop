var crypto = require('crypto')
var fs = require('fs')
var path = require('path')
var streams = require('stream')
var superagent = require('superagent')
var request = require('request')
var http = require('http')

let absPath = path.normalize('E:\\下载\\好先生第1集[高清].qsv')
let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiNWRhOTIzMDMtMzNhMS00Zjc5LThkOGYtYTdiNmJlY2RlNmMzIn0.79bUgRf9-m0KYP42_BV06yjtxaxgqYIiNdiIJIXfRMM'
let segmentsize = 10000000
let allHash = crypto.createHash('sha256')
let obj = {
	absPath: absPath,
	name: path.basename(absPath),
	parts: [],
	size: 0,
	seek: 0,
	taskid: ''
}

fs.stat(absPath, (err, stat) => {
	if(err) return console.log(err)
	obj.size = stat.size
	obj.parts = splice(obj.size, segmentsize)
	console.log('计算HASH')
	console.log('----------------------------------------------')
	
	hashFile(obj, 0, (err) => {
		if(err) return console.log(err)
		obj.sha = allHash.digest('hex')
		console.log(obj)
		createTask()
	})
})

function splice(size, partSize) {
	let part = []
	let position = 0
	while(position < size) {
		if (position + partSize >= size) {
			part.push({start: position, end: size-1})
			break
		}else {
			part.push({start: position, end: position + partSize -1})
			position = position + partSize
		}
	}
	return part
}

function hashFile(obj, index, callback) {
	if(!obj.parts[index]) return callback(null)
	let part = obj.parts[index]
	let hash = crypto.createHash('sha256')
	hash.setEncoding('hex')
	let fileStream = fs.createReadStream(obj.absPath, {start: part.start, end: part.end})
	console.log('正在计算第 ' + index + '块数据')
	fileStream.on('end', (err) => {
		if (err) throw new Error(err)
		hash.end()
		obj.parts[index].sha = hash.read()
		hashFile(obj, ++index, callback)
	})

	let t = new streams.Transform({
		transform: function(chunk, encoding, next) {
			allHash.update(chunk)
			this.push(chunk)
			next()
		}
	})

	fileStream.pipe(t).pipe(hash)
}

function createTask() {
	console.log('创建任务')
	console.log('----------------------------------------------')
	let options = {
      	url:'http://192.168.5.187:3721'+'/filemap/123',
      	method:'post',
      	headers: {
        	Authorization: 'JWT ' + token,
        	'Content-Type': 'application/json'
      	},
      	body: JSON.stringify({
        	filename :obj.name,
        	size:obj.size,
        	segmentsize: segmentsize,
        	sha256: obj.sha

      	})
    }

    request(options, (err,res, body) => {
    	console.log(err)
    	if (err) return console.log('err')
    	if (res.statusCode !== 200) {
    		console.log(body)
    		return console.log('codeErr : ' + res.statusCode)
    	}
    	let b = JSON.parse(body)
    	console.log(b)
    	obj.taskid = b.taskid
    	upload(obj, () => {
    		console.log('upload finish')
    	})
    })
}

function upload(obj, callback) {
	console.log('开始上传第' + obj.seek + '块')
	console.log('----------------------------------------------')
	if (obj.seek == obj.parts.length) return callback(null)
	let s = obj.seek
	var url = 'http://192.168.5.187:3721' + 
			'/filemap/123?' + 
			'segmenthash=' + obj.parts[s].sha + 
			'&start=' + s + 
			'&taskid=' + obj.taskid
			
	var stream = fs.createReadStream(obj.absPath, {start:obj.parts[s].start, end: obj.parts[s].end,autoClose:true})
	stream.on('error', err => {
		console.log('第' + s +'块 ' + 'stream: '+ err)
	})
	stream.on('open',() => {
		console.log('第' + s +'块 ' + 'stream: open')
	})
	stream.on('close',() => {
		console.log('第' + s +'块 ' + 'stream: close')
	})

	stream.on('end',() => {
		console.log('第' + s +'块 ' + 'stream: end')
	})

	var options = {
		host: '192.168.5.187',
		port: 3721,
		headers: {
			Authorization: 'JWT ' + token
		},
		method: 'PUT',
		path: encodeURI('/filemap/123?filename=' + obj.name + 
			'&segmenthash=' + obj.parts[s].sha + 
			'&start=' + s + 
			'&taskid=' + obj.taskid)
	}

	let req = http.request(options).on('error',(err) => {
		console.log('第' + s +'块 ' + 'req : err')
		console.log(err)
	}).on('response',(res) => {
		console.log('第' + s +'块 ' + 'req : response')
		console.log(res.statusCode)
		if(res.statusCode == 200) {
			obj.seek++
			upload(obj, callback)
		}
	}).on('abort', () => {
		console.log('第' + s +'块 ' + 'req : abort')
	}).on('aborted', () => {
		console.log('第' + s +'块 ' + 'req : aborted')
	}).on('connect', () => {
		console.log('第' + s +'块 ' + 'req : connect')
	}).on('socket', () => {
		console.log('第' + s +'块 ' + 'req : socket')
	}).on('upgrade', () => {
		console.log('第' + s +'块 ' + 'req : upgrade')
	}).on('pipe', () => {
		console.log('第' + s +'块 ' + 'req : pipe')
	})

	stream.pipe(req)
}

