const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zdravo', {
  dbQuery: (sql, params = []) => ipcRenderer.invoke('db:query', { sql, params }),
});
