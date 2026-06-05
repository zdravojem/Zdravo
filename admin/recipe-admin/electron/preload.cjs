const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('zdravoAdmin', {
  platform: process.platform,
});
