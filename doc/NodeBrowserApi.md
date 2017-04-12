
**copyright 上海闻上科技 (wisnuc) 2014-2017**

---

# Node-Browser communication protocol documentation

**author**
* lixinwei

**version**
* 2017-04-12


## Table of Content
[TOC]

## Introduction

List of apis for Node-Browser communication in fruitmix-desktop

## Main

### adapter

transmit node state to browser state, including following state:

+ config
+ server
+ login
+ login2
+ setting
+ media
+ share

if the last five state(login, login2, setting, media, share) changed, Node would send a new adapter message.

```
// send message in node/lib/adapter.js
mainWindow.webContents.send('adapter',adapter())

// receive message in src/app/fruitmix.js
ipcRenderer.on('adapter', (err, data) => {...}
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

### getThumb

Get a list of thumbnails. When download successfully, path of thumbnails would be updated to store (window.store.getState().media.date[N].path)

Parameters: a list of digest (hash) of image

```
ipcRenderer.send('getThumb', this.photos.map(item => ({ digest: item.digest })))
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
