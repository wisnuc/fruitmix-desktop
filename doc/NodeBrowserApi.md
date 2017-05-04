
**copyright 上海闻上科技 (wisnuc) 2014-2017**

---

# Node-Browser communication protocol documentation

**author**
* lixinwei

**version**
* 2017-04-12
* 2017-05-03


## Table of Content
[TOC]

## Introduction

List of apis for Node-Browser communication in fruitmix-desktop

## Login

### LOGIN

When Browser sending this message, Node could get information of current acoount, such as ip address of server, token and so on.

Parameters:

device: device info // OBJECT
  { 
    boot: [Object],
    device: [Object],
    mdev: [Object],
    storage: [Object],
    token: [Object],
    users: [Object]
   }

user: user info //OBJECT
  {
    avatar
    unixUID
    username
    uuid
  }

```
ipcRenderer.send('LOGIN', this.props.device, this.props.user)
```

## Window

### newWebWindow

Open a new WebWindow.

Parameters: title and url

```
ipcRenderer.send('newWebWindow', '固件版本管理', `http://${this.device.address}:3001`)
```

## Mdns

### MDNS_SCAN

Browser can send this message to start mdns scan.

Parameters: session (uuid)

```
ipcRenderer.send('MDNS_SCAN', this.session)
```

### MDNS_UPDATE

When Node finish scaning mdns, `MDNS_SCAN` message would be sent.

Parameters:
session: uuid of session
device: list of device that found by mdns

```
ipcRenderer.on('MDNS_UPDATE',(event, session, device)=>{...})
```

## Media

### mediaShowThumb

Get a thumbnail. When download successfully,  message of 'getThumbSuccess' would be return

Parameters: 
session: uuid of session 
digest: hash of image
height: height of thumb
width: width of thumb

```
ipcRenderer.send('mediaShowThumb', session, digest, 210, 210)
```

### mediaSHideThumb
abort the request of thumbnail.

Parameters: 
session: uuid of session 

```
ipcRenderer.send('mediaHideThumb', session)
```
### mediaShowImage

Get the detail image. When download successfully,  message of 'donwloadMediaSuccess' would be return

Parameters: 
session: uuid of session 
digest: hash of image

```
ipcRenderer.send('mediaShowImage', session, digest)
```

### mediaSHideImage
abort the request of detail image

Parameters: 
session: uuid of session 

```
ipcRenderer.send('mediaSHideImage', session)
```

## File

### GET_TRANSMISSION

When Browser send a message of 'GET_TRANSMISSION', Node would resume the unfinished download or upload task.
Then, message of 'UPDATE_UPLOAD' and 'UPDATE_DOWNLOAD' would be sent.

Parameters: none

```
ipcRenderer.send('GET_TRANSMISSION')
```

### UPDATE_UPLOAD

When Node update the list of upload task, this message would be sent with userTasks and finishTasks.
And the Browser would update the store, including:

window.store.getState().transmission.downloadingTasks
window.store.getState().transmission.downloadedTasks

```
ipcRenderer.on('UPDATE_UPLOAD', (err, userTasks, finishTasks) => {...})
```

### UPDATE_DOWNLOAD

When Node update the list of download task, this message would be sent with userTasks and finishTasks.
And the Browser would update the store, including:

window.store.getState().transmission.downloadingTasks
window.store.getState().transmission.downloadedTasks

```
ipcRenderer.on('UPDATE_DOWNLOAD', (err, userTasks, finishTasks) => {...})
```

### PAUSE_DOWNLOADING

Pause a specific downloading task

Parameters: task uuid

```
ipcRenderer.send('PAUSE_DOWNLOADING', uuid)
```

### RESUME_DOWNLOADING

Resume a specific downloading task

Parameters: task uuid

```
ipcRenderer.send('RESUME_DOWNLOADING', uuid)
```
