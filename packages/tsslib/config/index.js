const config = require('../../../config.json');
/*
const appRoot = require('app-root-path');
const path = require('path');

config.sqlite.tss = path.join(appRoot.path, config.sqlite.tss);
config.sqlite.punch = path.join(appRoot.path, config.sqlite.punch);
config.photoPath = path.join(appRoot.path, config.photoPath);
config.sync.syncPhotoPath =  path.join(appRoot.path, config.sync.syncPhotoPath);
config.camera.path = path.join(appRoot.path, config.camera.path);
config.sync.syncCameraPath = path.join(appRoot.path, config.sync.syncCameraPath);
*/

exports.config = config;