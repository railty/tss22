// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
//console.log(config);

app.commandLine.appendSwitch('--log-level', '3');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: config.tsse.fullscreen,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.webContents.on('dom-ready', function() {
    let currentUrl = mainWindow.webContents.getURL();
    //console.log(config.reconnectTimeout);

    if (currentUrl.match(/file:\/\/(.*)\/reconnect\.html/)){
      setTimeout(()=>{
        mainWindow.loadURL(config.tsse.url)
      }, config.tsse.reconnectTimeout);
    }
    else{
      console.log(currentUrl);
      let title = mainWindow.webContents.getTitle();
      //console.log(title);
      if (title == 'TSS'){
      }
      else{
        mainWindow.loadFile('reconnect.html')      
      }
    }
  }); 

  mainWindow.setMenu(null);
  // Open the DevTools.
  if (config.tsse.openDevTools) mainWindow.webContents.openDevTools()

  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')
  //mainWindow.loadURL(config.tsse.url)
  mainWindow.loadFile('reconnect.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // On certificate error we disable default behaviour (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  callback(true);
});
