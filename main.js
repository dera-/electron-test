// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Object.defineProperty(app, 'isPackaged', {
//   get() {
//     return true;
//   }
// });

// アップデートに関する情報をログファイルへ出力
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // アップデートをチェック
  autoUpdater.checkForUpdates();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//-------------------------------------------
// 自動アップデート関連のイベント処理
//-------------------------------------------
// アップデートをチェック開始
autoUpdater.on('checking-for-update', () => {
  log.info(process.pid, 'checking-for-update...');
})

// アップデートがあるとき
autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    message: "アップデートがあります",
    buttons: ["OK"],
  });
});

// アップデートがないとき
autoUpdater.on("update-not-available", () => {
  dialog.showMessageBox({
    message: "アップデートはありません",
    buttons: ["OK"],
  });
});

// エラーが発生したとき
autoUpdater.on("error", () => {
  dialog.showMessageBox({
    message: "アップデートエラーが起きました",
    buttons: ["OK"],
  });
});

// アップデートのダウンロードが完了
autoUpdater.on('update-downloaded', async() => {
  const returnValue = await dialog.showMessageBox({
    type: "info",
    message: "アップデートあり",
    detail: "再起動してインストールできます。",
    buttons: ["再起動", "後で"],
  });
  if (returnValue.response === 0) {
    autoUpdater.quitAndInstall();  // アプリを終了してインストール
  }
});
