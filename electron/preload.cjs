const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    saveBackup: (data, filename) => ipcRenderer.invoke('save-backup', { data, filename }),
    loadBackup: () => ipcRenderer.invoke('load-backup'),
    checkDailyBackup: () => ipcRenderer.invoke('check-backup')
});
