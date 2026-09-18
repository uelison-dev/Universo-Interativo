const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherApi', {
  startExperience: () => ipcRenderer.invoke('launcher:start-experience'),
  minimizeWindow: () => ipcRenderer.send('launcher:minimize'),
  closeWindow: () => ipcRenderer.send('launcher:close'),
  getMeta: () => ipcRenderer.invoke('launcher:get-meta')
});
