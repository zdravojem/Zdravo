const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zdravo', {
  dbQuery: (sql, params = []) => ipcRenderer.invoke('db:query', { sql, params }),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  generateQrSvg: (text, options = {}) => ipcRenderer.invoke('qr:generate-svg', text, options)
});
