const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const isDev = !app.isPackaged;

const port = 3000;

async function createWindow() {
  if (!isDev) await fork(path.join(app.getAppPath(), 'server.js'));

  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  
  win.loadURL(`http://localhost:${port}`);
  
  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // 关闭 server.js 子进程
  if (global.serverProcess && !global.serverProcess.killed) {
    global.serverProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
