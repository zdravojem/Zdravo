const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const seedIngredients = require('./database/seed-ingredients');
const seedRecipes = require('./database/seed-recipes');

let dbPath;
let db;
let isQuitting = false;

if (process.platform === 'win32') {
  app.setAppUserModelId('si.zdravo.jem');
}

function getDatabasePath() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'zdravo-jem.db');
  }

  return path.join(__dirname, 'database', 'zdravo-jem.db');
}

function initDatabase() {
  dbPath = getDatabasePath();
  const firstRun = !fs.existsSync(dbPath);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new Database(dbPath);

  if (firstRun) {
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    db.exec(schema);
    seedIngredients(db);
    seedRecipes(db);
  }
}

function registerIpc() {
  ipcMain.handle('db:query', (event, { sql, params }) => {
    if (typeof sql !== 'string') {
      throw new Error('Invalid SQL');
    }
    const trimmed = sql.trim().toLowerCase();
    if (!trimmed.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }
    const stmt = db.prepare(sql);
    return stmt.all(params || []);
  });
}

function closeDatabase() {
  if (!db) {
    return;
  }

  try {
    db.close();
  } catch (error) {
    console.warn('Failed to close database cleanly', error);
  } finally {
    db = undefined;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    backgroundColor: '#2C4220',
    icon: path.join(__dirname, 'assets', 'icons', 'zdravo-jem-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  win.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (!app.isPackaged) {
      return;
    }
    const key = (input.key || '').toLowerCase();
    const isBlocked =
      key === 'f12' ||
      key === 'f5' ||
      (input.control && key === 'r') ||
      (input.control && input.shift && key === 'i') ||
      (input.alt && key === 'f4') ||
      input.control ||
      input.alt ||
      input.meta;

    if (isBlocked) {
      event.preventDefault();
    }
  });
}

function relaunchApp() {
  if (!app.isPackaged || isQuitting) {
    return;
  }

  app.relaunch();
  app.exit(0);
}

function shouldRelaunch(details) {
  if (isQuitting) {
    return false;
  }

  const reason = details?.reason;
  return Boolean(reason) && reason !== 'clean-exit' && reason !== 'killed';
}

app.whenReady().then(() => {
  initDatabase();
  registerIpc();
  createWindow();
});

app.on('before-quit', () => {
  isQuitting = true;
  closeDatabase();
});

app.on('render-process-gone', (_event, _webContents, details) => {
  if (shouldRelaunch(details)) {
    relaunchApp();
  }
});

app.on('child-process-gone', (_event, details) => {
  if (shouldRelaunch(details)) {
    relaunchApp();
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', error);
  if (!isQuitting) {
    relaunchApp();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
