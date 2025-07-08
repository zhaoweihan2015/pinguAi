const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const { utilityProcess, dialog } = require('electron');
const fs = require('fs');
const isDev = !app.isPackaged;

const port = 3000;

let serverProcess = null;

async function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (!isDev) {
    const serverPath = path.join(app.getAppPath(), 'standalone', 'server.js');

    const logFile = path.join(app.getPath('userData'), 'server.log');

    serverProcess = utilityProcess.fork(serverPath, [], {
      cwd: path.dirname(app.getAppPath(), "standalone"),
      stdio: 'pipe'                 // ⭐ 用 pipe 才能拿到流
    });

    // 把日志直接落盘，确保看得见
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // 记录日志
    serverProcess.stdout?.pipe(logStream);
    serverProcess.stderr?.pipe(logStream);

    // serverProcess.on('spawn', () => {
    //   dialog.showMessageBoxSync({
    //     type: 'info',
    //     message: `[server] spawned, pid: ${serverProcess.pid}`
    //   });
    // });
    // serverProcess.on('exit', (code) => {
    //   dialog.showMessageBoxSync({
    //     type: 'info',
    //     message: `[server] exit, code: ${code}`
    //   });
    // });
    // serverProcess.on('error', (err) => {
    //   console.error('[server] fatal', err);
    //   dialog.showErrorBox('Server error', String(err.stack ?? err));
    // });
  }

  win.loadURL(`http://localhost:${port}`);

  if (isDev) {
    win.webContents.openDevTools();
  } else {
    setTimeout(() => {
      win.loadURL(`http://localhost:${port}`);
    }, 3000);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }


  if (process.platform !== 'darwin') {
    app.quit();
  }
});
