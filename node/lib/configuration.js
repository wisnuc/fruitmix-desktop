const os = require('os')
const path = require('path')
const Promise = require('bluebird')
const app = require('electron').app
const validator = require('validator')
const fs = Promise.promisifyAll(require('fs'))
const mkdirpAsync = Promise.promisify(require('mkdirp'))
const createPersistenceAsync = require('./persistence')

class Config {
  constructor (config, persistence) {
    this.config = config
    this.persistence = persistence
  }

  getConfig () {
    return this.config
  }

  setConfig (props) {
    this.config = Object.assign({}, props)
    this.persistence.save(this.config)
  }
}

class UserConfig {
  constructor (config, persistence, userUUID) {
    this.config = config
    this.persistence = persistence
    this.userUUID = userUUID
  }

  getConfig () {
    return Object.assign({}, this.config, { userUUID: this.userUUID })
  }

  setConfig (props) {
    this.config = Object.assign({}, props)
    this.persistence.save(this.config)
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
  constructor (root) {
    this.root = path.join(root, 'wisnuc')
  }

  /*
     synchronous methods for abspath
  */

  getGlobalConfigPath () {
    return path.join(this.root, 'config.json')
  }

  // public
  getTmpTransDir () {
    return path.join(this.root, 'tmpTrans')
  }

  // public
  getTmpDir () {
    return path.join(this.root, 'tmp')
  }

  // public
  getThumbnailDir () {
    return path.join(this.root, 'thumbnail')
  }

  // public
  getImageCacheDir () {
    return path.join(this.root, 'imagecache')
  }

  getBoxDir () {
    return path.join(this.root, 'IndexedDB')
  }

  getVersion () {
    return app.getVersion()
  }

  getPlatform () {
    return os.platform()
  }

  getUsersDir () {
    return path.join(this.root, 'users')
  }

  getUserDir (uuid) {
    return path.join(this.root, 'users', uuid)
  }

  getUserConfigFilePath (uuid) {
    return path.join(this.root, 'users', uuid, 'config.json')
  }

  // public
  getUserDownloadDir (uuid) {
    return path.join(this.root, 'users', uuid, 'download')
  }

  // public
  getUserDatabaseDir (uuid) {
    return path.join(this.root, 'users', uuid, 'database')
  }

  // currently only two USER directories supported
  // public
  getWisnucDownloadsDir () {
    return path.join(app.getPath('downloads'), 'wisnuc')
  }

  // public
  getWisnucPicturesDir () {
    return path.join(app.getPath('pictures'), 'wisnuc')
  }

  /*
    prepare directories for user or global
  */

  async makeWisnucDirsAsync () {
    await mkdirpAsync(this.getWisnucDownloadsDir())
    await mkdirpAsync(this.getWisnucPicturesDir())
  }

  async makeUserDirsAsync (uuid) {
    await mkdirpAsync(this.getUserDir(uuid))
    // await mkdirpAsync(this.getUserDownloadDir(uuid))
    // await mkdirpAsync(this.getUserDatabaseDir(uuid))
  }

  // init global dirs during startup
  async makeGlobalDirsAsync () {
    await mkdirpAsync(this.getUsersDir())
    await mkdirpAsync(this.getTmpTransDir())
    await mkdirpAsync(this.getTmpDir())
    await mkdirpAsync(this.getThumbnailDir())
    await mkdirpAsync(this.getImageCacheDir())
    await mkdirpAsync(this.getBoxDir())
  }

  // load a js object from given path, return null if any error
  async loadObjectAsync (fpath) {
    let obj = null
    // console.log('Loading config...')
    try { obj = JSON.parse(await fs.readFileAsync(fpath)) } catch (e) {
      console.log(e)
      return null
    }
    // console.log('config:', obj)
    return typeof obj === 'object' ? obj : null
  }

  // load or create config for single user
  async initUserConfigAsync (userUUID) {
    await this.makeUserDirsAsync(userUUID)

    const configPath = this.getUserConfigFilePath(userUUID)
    const config = await this.loadObjectAsync(configPath) || {}
    const tmpdir = this.getTmpDir()
    const persistence = await createPersistenceAsync(configPath, tmpdir)

    return new UserConfig(config, persistence, userUUID)
  }

  // update user config
  async updateUserConfigAsync (userUUID, newConfig) {
    await this.makeUserDirsAsync(userUUID)

    const userConfigPath = this.getUserConfigFilePath(userUUID)
    const userPreConfig = await this.loadObjectAsync(userConfigPath) || {}
    const userConfig = Object.assign({}, userPreConfig, newConfig)
    const tmpdir = this.getTmpDir()
    const persistence = await createPersistenceAsync(userConfigPath, tmpdir)
    const handle = new UserConfig(userConfig, persistence, userUUID)
    handle.setConfig(userConfig)
    const index = this.userConfigs.findIndex(uc => uc.getConfig() && uc.getConfig().userUUID === userUUID)
    if (index > -1) this.userConfigs.splice(index, 1)
    this.userConfigs.push(handle)
    // console.log('updateUserConfigAsync', userUUID, newConfig, userConfig)
    global.dispatch({
      type: 'USER_CONFIG_UPDATE',
      data: this.userConfigs.map(uc => uc.getConfig())
    })
    return userConfig
  }

  // load or create global config
  async initGlobalConfigAsync () {
    const configPath = this.getGlobalConfigPath()
    const config = await this.loadObjectAsync(configPath) || {}
    const tmpdir = this.getTmpDir()
    const persistence = await createPersistenceAsync(configPath, tmpdir)

    return new Config(config, persistence)
  }

  // update global config
  async updateGlobalConfigAsync (newConfig) {
    const configPath = this.getGlobalConfigPath()
    const oldConfig = await this.loadObjectAsync(configPath) || {}
    const config = Object.assign({}, oldConfig, newConfig)
    const tmpdir = this.getTmpDir()
    const persistence = await createPersistenceAsync(configPath, tmpdir)
    this.globalConfig = new Config(config, persistence)
    this.globalConfig.setConfig(config)

    /* init custom download path */
    const downloadPath = this.globalConfig.getConfig().downloadPath || this.getWisnucDownloadsDir()
    await mkdirpAsync(downloadPath)

    global.dispatch({
      type: 'CONFIG_UPDATE',
      data: {
        downloadPath,
        boxPath: this.getBoxDir(),
        tmpTransPath: this.getTmpTransDir(),
        tmpPath: this.getTmpDir(),
        thumbPath: this.getThumbnailDir(),
        imagePath: this.getImageCacheDir(),
        lastDevice: this.globalConfig.getConfig().lastDevice,
        noCloseConfirm: this.globalConfig.getConfig().noCloseConfirm,
        enableSleep: this.globalConfig.getConfig().enableSleep
      }
    })
    return config
  }

  // init
  async initAsync () {
    // prepare directories
    await this.makeWisnucDirsAsync()
    await this.makeGlobalDirsAsync()

    // load global config
    const globalConfig = await this.initGlobalConfigAsync()

    // filter out all UUID entries inside users dir
    const UUIDs = (await fs.readdirAsync(this.getUsersDir()))
      .filter(entry => validator.isUUID(entry))

    //
    const userConfigs = []
    for (let i = 0; i < UUIDs.length; i++) {
      try { userConfigs.push(await this.initUserConfigAsync(UUIDs[i])) } catch (e) { console.log(e) }
    }

    this.globalConfig = globalConfig
    this.userConfigs = userConfigs

    /* init custom download path */
    const downloadPath = this.globalConfig.getConfig().downloadPath || this.getWisnucDownloadsDir()
    await mkdirpAsync(downloadPath)

    global.dispatch({
      type: 'CONFIG_INIT',
      data: {
        downloadPath,
        boxPath: this.getBoxDir(),
        tmpTransPath: this.getTmpTransDir(),
        tmpPath: this.getTmpDir(),
        thumbPath: this.getThumbnailDir(),
        imagePath: this.getImageCacheDir(),
        lastDevice: this.globalConfig.getConfig().lastDevice,
        noCloseConfirm: this.globalConfig.getConfig().noCloseConfirm,
        enableSleep: this.globalConfig.getConfig().enableSleep
      }
    })
  }

  getConfiguration () {
    return {
      boxPath: this.getBoxDir(),
      platform: this.getPlatform(),
      appVersion: this.getVersion(),
      global: this.globalConfig.getConfig(),
      defaultDownload: this.getWisnucDownloadsDir(),
      users: this.userConfigs.map(uc => uc.getConfig())
    }
  }
}

module.exports = Configuration
