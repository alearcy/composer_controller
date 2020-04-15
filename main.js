// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');

// Autoupdate from electron-builder library that automatically get from Github
const { autoUpdater } = require("electron-updater");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 480,
    minWidth: 400,
    minHeight: 480,
    maxWidth: 400,
    maxHeight: 480,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + '/public/icon/icon.png'
  });

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('version', app.getVersion())
  })
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
});

function sendUpdateStatus(text) {
  mainWindow.webContents.send('autoUpdate', text);
}

function sendUpdateReady(text) {
  mainWindow.webContents.send('updateReady', text);
}

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
autoUpdater.on('checking-for-update', () => {
  sendUpdateStatus('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  sendUpdateReady(`Version ${info.version} available.`);
});
autoUpdater.on('update-not-available', (info) => {
  sendUpdateStatus('All up to date');
});
