const electron = require('electron')
const menubar = require('menubar')
const {Menu, Tray} = require('electron')
const AutoLaunch = require('auto-launch');
const MenuTemplate = require('./src/clipboard.js').template
const Keymap = require('./src/keymap.js')
const ipc = electron.ipcMain;

require('electron-reload')(__dirname);
require('electron-debug')({showDevTools: false});


var platform = require('os').platform();  
var trayImage;  
var imageFolder = __dirname + '/assets';

if (platform == 'darwin') {  
  trayImage = imageFolder + '/keepTemplate.png';
}

const menuBarConfiguration = {
  width: 400, 
  height: 600,
  icon: __dirname + '/assets/keepTemplate.png',
  preloadWindow: false
}

const mb = menubar(menuBarConfiguration)

mb.on('after-create-window', function ready () {
  mb.window.focus();
  var appPath = mb.app.getPath('exe').split('.app/Content')[0] + '.app';

  var keeptronAutostart = new AutoLaunch({
    name: mb.app.getName(),
    path: appPath,
  });

  keeptronAutostart.enable().then(function(isEnabled){
   console.log(isEnabled)
 });

  keeptronAutostart.isEnabled()
  .then(function(isEnabled){
   console.log(isEnabled)
   if(isEnabled){
    return;
  }
  keeptronAutostart.enable();
})
  .catch(function(err){
   console.log(err)
 });
})

mb.app.on('ready', () => {
  var appIcon = new Tray(trayImage);

  if (platform == "darwin") {  
    appIcon.setPressedImage(imageFolder + '/keepHighlight.png');
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(MenuTemplate(mb.app)));
  Keymap.initializeKeymap(electron.globalShortcut, 
    [
    {shorcut: 'CommandOrControl+Alt+K', function: mb.showWindow},
    {shorcut: 'Esc', function: mb.hideWindow}
    ]
    )
})

mb.app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    mb.app.quit()
  }
})

mb.app.on('will-quit', () => {
  electron.globalShortcut.unregisterAll()
})