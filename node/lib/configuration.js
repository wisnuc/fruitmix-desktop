const path = require('path')
const fs = Promisy.promisifyAll(require('fs'))
const mkdirpAsync = Promise.promisify(require('mkdirp'))
const validator = require('validator')

class Config {

  constructor(config, persistence) {
    this.config = config
    this.persistence = persistence
  }

  getConfig() {
    return config
  } 

  setConfig(props) {
    this.config = Object.assign({}, props)
    this.persistence.save(this.config)
  }
}

class UserConfig extends Config {

  constructor(config, persistence, userUUID) {
    super(config, persistence)
    this.userUUID = userUUID
  }
}


// 
// rootpath: app.getPath('appData')
// /wisnuc/users/<uuid>/config.json   user config
//                     /download/     user download folder // be careful of disk space
//                     /database/     user database folder
//        /config.json                global config
//        /redirection.json
//        /tmp/                       tmp folder
//        /thumbnail/                 thumbnail folder
//        /imagecache/                image folder
class Configuration {

  constructor(root) {
    this.root = root
  }

  /*
     synchronous methods for abspath
  */

  getGlobalConfigPath() {
    return path.join(this.root, 'config.json')
  }

  // public
  getTmpDir() {
    return path.join(this.root, 'tmp')
  }

  // public
  getThumbnailDir() {
    return path.join(this.root, 'thumbnail')
  }

  // public
  getImageCacheDir() {
    return path.join(this.root, 'imagecache')
  }

  getUsersDir() {
    return path.join(this.root, 'users')
  }

  getUserDir(uuid) {
    return path.join(this.root, 'users', uuid)
  }

  getUserConfigFilePath(uuid) {
    return path.join(this.root, 'users', uuid, 'config.json')
  }

  // public
  getUserDownloadDir(uuid) {
    return path.join(this.root, 'users', uuid, 'download')
  } 

  // public
  getUserDatabaseDir(uuid) {
    return path.join(this.root, 'users', uuid, 'database')
  }

  /*
    prepare directories for user or global 
  */

  makeUserDirsAsync(uuid) {
    await mkdirpAsync(this.getUserDir())
    await mkdirpAsync(this.getUserDownloadDir(uuid))
    await mkdirpAsync(this.getUserDatabaseDir(uuid))
  }

  // init global dirs during startup
  makeGlobalDirsAsync() {
    await mkdirpAsync(this.getUsersDir())
    await mkdirpAsync(this.getTmpDir())
    await mkdirpAsync(this.getThumbnailDir())
    await mkdirpAsync(this.getImageCacheDir())
  }

  // load a js object from given path, return null if any error
  loadObjectAsync(fpath) {

    let obj = null
    try { obj = JSON.parse(await fs.readFileAsync(fpath)) }
    catch (e) { return null } 
    return typeof obj === 'object' ? obj : null
  }

  // load or create config for single user
  initUserConfigAsync(userUUID) {

    await this.makeUserDirsAsync(userUUID)

    let configPath = this.getUserConfigFilePath(userUUID)
    let config = await this.loadObjectAsync(configpath) || {}
    let tmpdir = this.getTmpDir()
    let persistence = createPersistenceAsync(configPath, tmpdir)
    
    return new UserConfig(config, persistence, userUUID)
  }

  // load or create global config
  initGlobalConfigAsync() {

    let configPath = this.getGlobalConfigPath()
    let config = await this.loadObjectAsync(configPath) || {} 
    let tmpdir = this.getTmpDir()
    let persistence = createPersistenceAsync(configPath, tmpdir)

    return new Config(config, persistence)
  }

  // init
  initAsync() {

    // prepare directories
    await this.makeGobalDirsAsync()

    // load global config
    let globalConfig = await this.initGlobalConfigAsync()

    // filter out all UUID entries inside users dir
    let UUIDs = (await fs.readdirAsync(this.getUsersDir()))
      .filter(entry => validator.isUUID(entry))

    // 
    let userConfigs = []
    for (let i = 0; i < UUIDs.length; i++) {
      try { userConfigs.push(await this.initUserConfigAsync(UUIDs[i])) }
      catch (e) {}
    }

    this.globalConfig = globalConfig
    this.userConfigs = userConfigs
  }

  getConfiguration() {
    return {
      global: this.globalConfig,
      users: this.userConfigs.map(uc => uc.getConfig())
    }
  }
}

module.exports = Configuration

