// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = join(__dirname, '../dist');
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public');

import { join } from 'path';
import { app, BrowserWindow, session } from 'electron';
import { ElectronBlocker } from '@cliqz/adblocker-electron';

// simply "import fetch from 'cross-fetch'" make error, I don't know any reason
import 'cross-fetch/polyfill';

let win: BrowserWindow | null;
// Here, you can also use other preload
const preload = join(__dirname, './preload.js');
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
// const url = process.env['VITE_DEV_SERVER_URL']
const url = 'https://www.youtube.com/watch?v=HLvCnvXQizQ';

async function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 960,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload,
    },
  });

  const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
  blocker.enableBlockingInSession(session.defaultSession);

  win.on('ready-to-show', () => {
    win?.webContents.openDevTools();
  });

  if (url) {
    win.loadURL(url);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(join(process.env.DIST, 'index.html'));
  }
}

app.on('window-all-closed', async () => {
  await session.defaultSession.clearCache();
  win = null;
});

app.whenReady().then(createWindow);
