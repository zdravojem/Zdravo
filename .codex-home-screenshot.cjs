const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-features', 'NetworkServiceSandbox');

const runtimeDir = path.join(process.env.TEMP || process.cwd(), 'zdravo-electron-profile');
fs.mkdirSync(runtimeDir, { recursive: true });
app.setPath('userData', runtimeDir);
app.setPath('sessionData', path.join(runtimeDir, 'session'));

let db;

app.whenReady().then(async () => {
  db = new Database(path.join(process.cwd(), 'database', 'zdravo-jem.db'));

  ipcMain.handle('db:query', (_event, { sql, params }) => db.prepare(sql).all(params || []));
  ipcMain.handle('shell:open-external', () => null);
  ipcMain.handle('qr:generate-svg', () => '');

  const win = new BrowserWindow({
    width: 1654,
    height: 921,
    x: -10000,
    y: -10000,
    show: true,
    focusable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(process.cwd(), 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await win.loadFile(path.join(process.cwd(), 'renderer', 'index.html'));
  await new Promise((resolve) => setTimeout(resolve, 700));
  await win.webContents.executeJavaScript(
    "document.querySelector('.screen--welcome')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))"
  );
  await new Promise((resolve) => setTimeout(resolve, 900));
  const scrollInfo = await win.webContents.executeJavaScript(`
    (() => {
      const screen = document.querySelector('.screen--home');
      const games = document.querySelector('.home-section--games');
      screen.innerHTML = games.outerHTML;
      screen.scrollTop = 0;
      return {
        scrollTop: screen.scrollTop,
        gamesTop: games.offsetTop,
        scrollHeight: screen.scrollHeight,
        clientHeight: screen.clientHeight
      };
    })()
  `);
  console.log(JSON.stringify(scrollInfo));
  fs.writeFileSync(
    path.join(process.env.TEMP || process.cwd(), 'zdravo-home-games-scroll.json'),
    JSON.stringify(scrollInfo, null, 2)
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  const image = await win.webContents.capturePage();
  const out = path.join(process.env.TEMP || process.cwd(), 'zdravo-home-games.png');
  fs.writeFileSync(out, image.toPNG());
  console.log(out);

  db.close();
  app.quit();
}).catch((error) => {
  console.error(error);
  if (db) {
    db.close();
  }
  app.quit();
});
