# Node Modules

## Redux

**`TODO`** This module is going to be merged into one folder named `redux`, `serve` folder removed.

There are five reducers currently defined:

* config
* server
* login **`TODO`** mdns refactoring
* media
* setting

## Lib
### adapter.js **`review`**
This module periodically send adapted server side redux store to window.

### async.js 
This module exports a bunch of promisified library functions

### command.js and commandTaskCreator.js **`doc`** **`refactor`**
These modules implement a request-response mode message passing based on node/electron IPC. Node is the provider. Browser window is the user.
It is a command pattern.

### config.js **`discussion`** **`redesign`**
Configuration. 

Open Questions:
1. What is the difference between config and setting?
2. Should something be personal (per user)?

### download.js
owned by Liu Hua.

### filehash.js
owned by Liu Hua. Supposed to be file hash calculator, running as child process (fork).

### file.js **`???`**
Implemnents a bunch of file operations, but not sure how browser window uses it.

### login.js **`detailed design`**
simple login module, update redux store. 

### mdns.js **`refactoring`**
### media.js **`???`**
### migration.js **`TO BE REMOVED`**
Migration function is going to be removed after file explorer supporting system folder.

### misc.js
### newUpload
owned by Liu Hua

### server.js
Wrapped API for accessing server restful API

### system.js **`obsolete??`**
Implement boot and system function such as mkfs, install and run; probably obsolete.

### testHook.js **`obsolete??`**
Originally planned for UI testing. It is not useful any more since we abandoned redux.

### upload.js && uploadTaskCreater.js
Owned by Liu Hua

### util.js **`???`**
Providing some methods for processing data, quickSort, etc.

### window.js
Initialize main window. Get or create new window

1. `initMainWindow` 
2. `getMainWindow`
3. `newWebWindow` (IPC only)




# Web Modules

