const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: 'NetSecure Sim',
        icon: path.join(__dirname, '../public/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        // Modern frameless look (optional)
        // frame: false,
        // titleBarStyle: 'hiddenInset',
        backgroundColor: '#020617', // slate-950
        show: false // Don't show until ready
    });

    // Load the app
    if (isDev) {
        // Development: load from Vite dev server
        mainWindow.loadURL('http://localhost:3000');
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        // Production: load from built files
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create window when Electron is ready
app.whenReady().then(() => {
    createWindow();

    // On macOS, re-create window when dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for communication with React
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-platform', () => {
    return process.platform;
});
