const electron = require('electron');
const path = require('node:path');
const packageJson = require('./package.json');

if (typeof electron === 'string') {
  throw new Error(
    'As APIs do Electron não estão disponíveis. Verifique se ELECTRON_RUN_AS_NODE não está definido.'
  );
}

const { app, BrowserWindow, ipcMain } = electron;
const { getActiveSatelliteCatalog } = require('./src/data/artificial_satellite_cache');
const applicationIcon = path.join(
  __dirname,
  process.platform === 'win32' ? 'logo_atom.ico' : 'logo_atom.png'
);

if (process.platform === 'win32') {
  app.setAppUserModelId('com.vuenar.universointerativo');
}

let launcherWindow = null;
let mainWindow = null;
let blackHoleWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 900,
    show: false,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    icon: applicationIcon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createLauncherWindow() {
  launcherWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1180,
    minHeight: 760,
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    resizable: true,
    backgroundColor: '#04060a',
    autoHideMenuBar: true,
    icon: applicationIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  launcherWindow.loadFile(path.join(__dirname, 'public', 'launcher.html'));

  launcherWindow.once('ready-to-show', () => {
    launcherWindow.show();
  });

  launcherWindow.on('closed', () => {
    launcherWindow = null;
  });
}

function createBlackHoleWindow(data) {
  blackHoleWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 680,
    show: false,
    backgroundColor: '#020305',
    autoHideMenuBar: true,
    icon: applicationIcon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  blackHoleWindow.loadFile(path.join(__dirname, 'public', 'black-hole.html'));
  blackHoleWindow.once('ready-to-show', () => {
    blackHoleWindow.show();
    blackHoleWindow.focus();
  });
  blackHoleWindow.webContents.once('did-finish-load', () => {
    blackHoleWindow?.webContents.send('black-hole:data', data);
  });
  blackHoleWindow.on('closed', () => {
    mainWindow?.webContents.send('dedicated-viewer:closed');
    blackHoleWindow = null;
  });
}

app.whenReady().then(() => {
  ipcMain.handle('launcher:get-meta', () => ({
    version: `Versão ${packageJson.version}`
  }));

  ipcMain.handle('launcher:start-experience', async () => {
    if (!mainWindow) {
      createMainWindow();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    if (launcherWindow) {
      launcherWindow.close();
    }
  });

  ipcMain.on('launcher:minimize', () => {
    launcherWindow?.minimize();
  });

  ipcMain.on('launcher:close', () => {
    app.quit();
  });

  ipcMain.handle('black-hole:open', (_event, data) => {
    if (blackHoleWindow) {
      blackHoleWindow.webContents.send('black-hole:data', data);
      blackHoleWindow.show();
      blackHoleWindow.focus();
      return;
    }

    createBlackHoleWindow(data);
  });

  ipcMain.on('black-hole:close', () => {
    blackHoleWindow?.close();
  });

  ipcMain.handle('satellites:active:get', () => getActiveSatelliteCatalog(app.getPath('userData')));

  createLauncherWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (mainWindow) {
        mainWindow.show();
      } else {
        createLauncherWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
