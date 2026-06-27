const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zdravo', {
  dbQuery: (sql, params = []) => ipcRenderer.invoke('db:query', { sql, params }),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  generateQrSvg: (text, options = {}) => ipcRenderer.invoke('qr:generate-svg', text, options),
  getRecipeShareUrl: (recipeId, options = {}) => ipcRenderer.invoke('recipe-share:get-url', { recipeId, options }),
  sendRecipeEmail: (toEmail, recipe) => ipcRenderer.invoke('send-recipe-email', { toEmail, recipe }),
  getSyncStatus: () => ipcRenderer.invoke('sync:status'),
  onSyncStatus: (callback) => {
    if (typeof callback !== 'function') {
      return () => {};
    }

    const listener = (_event, status) => callback(status);
    ipcRenderer.on('sync:status-changed', listener);

    return () => {
      ipcRenderer.removeListener('sync:status-changed', listener);
    };
  },
  syncWithSupabase: (trigger = 'manual', options = {}) => ipcRenderer.invoke('sync:run', trigger, options)
});
