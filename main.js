// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

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
  autoUpdater.checkForUpdatesAndNotify();

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
// アップデートが見つかった
autoUpdater.on('update-available', (ev, info) => {
  log.info(process.pid, 'Update available.');
})
// アップデートがなかった（最新版だった）
autoUpdater.on('update-not-available', (ev, info) => {
  log.info(process.pid, 'Update not available.');
})
// アップデートのダウンロードが完了
autoUpdater.on('update-downloaded', (info) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['更新して再起動', 'あとで'],
    message: 'アップデート',
    detail: '新しいバージョンをダウンロードしました。再起動して更新を適用しますか？'
  }

  // ダイアログを表示しすぐに再起動するか確認
  dialog.showMessageBox(mainWin, dialogOpts).then((returnValue) => {
    if (returnValue.response === 0){
      autoUpdater.quitAndInstall()
    }
  })
});
// エラーが発生
autoUpdater.on('error', (err) => {
  log.error(process.pid, err);
})
