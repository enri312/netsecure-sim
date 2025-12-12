const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;
let loadRetries = 0;
const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds

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
            preload: path.join(__dirname, 'preload.cjs')
        },
        backgroundColor: '#020617', // slate-950
        show: true // Show immediately to prevent appearing "closed"
    });

    // Handle load errors (server not ready, network issues, etc.)
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error(`Failed to load: ${errorDescription} (${errorCode})`);

        if (isDev && loadRetries < MAX_RETRIES) {
            loadRetries++;
            console.log(`Retry ${loadRetries}/${MAX_RETRIES} in ${RETRY_DELAY}ms...`);

            // Show loading message
            mainWindow.loadURL(`data:text/html;charset=utf-8,
                <html>
                <head>
                    <style>
                        body {
                            background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            font-family: 'Segoe UI', system-ui, sans-serif;
                            color: #94a3b8;
                        }
                        .spinner {
                            width: 50px;
                            height: 50px;
                            border: 4px solid #1e293b;
                            border-top: 4px solid #3b82f6;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin-bottom: 20px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        h1 { color: #e2e8f0; margin-bottom: 10px; }
                        p { margin: 5px 0; }
                        .retry { color: #fbbf24; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="spinner"></div>
                    <h1>NetSecure Sim</h1>
                    <p>Esperando al servidor de desarrollo...</p>
                    <p class="retry">Intento ${loadRetries}/${MAX_RETRIES}</p>
                </body>
                </html>
            `);

            // Retry after delay
            setTimeout(() => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.loadURL('http://localhost:3000');
                }
            }, RETRY_DELAY);
        } else if (loadRetries >= MAX_RETRIES) {
            // Max retries reached, show error
            mainWindow.loadURL(`data:text/html;charset=utf-8,
                <html>
                <head>
                    <style>
                        body {
                            background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            font-family: 'Segoe UI', system-ui, sans-serif;
                            color: #94a3b8;
                            text-align: center;
                            padding: 20px;
                        }
                        .error-icon {
                            width: 80px;
                            height: 80px;
                            border: 4px solid #ef4444;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 20px;
                            font-size: 40px;
                            color: #ef4444;
                        }
                        h1 { color: #e2e8f0; margin-bottom: 10px; }
                        p { margin: 10px 0; max-width: 400px; }
                        code { 
                            background: #1e293b; 
                            padding: 3px 8px; 
                            border-radius: 4px;
                            color: #3b82f6;
                        }
                        button {
                            margin-top: 20px;
                            padding: 12px 24px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                        }
                        button:hover { background: #2563eb; }
                    </style>
                </head>
                <body>
                    <div class="error-icon">!</div>
                    <h1>Error de Conexión</h1>
                    <p>No se pudo conectar al servidor de desarrollo en <code>http://localhost:3000</code></p>
                    <p>Asegurate de que el servidor esté corriendo con <code>npm run dev</code></p>
                    <button onclick="location.reload()">Reintentar</button>
                </body>
                </html>
            `);
        }
    });

    // Prevent window from closing on renderer crash
    mainWindow.webContents.on('crashed', () => {
        console.error('Renderer process crashed');
    });

    // Load the app
    if (isDev) {
        // Development: load from Vite dev server
        mainWindow.loadURL('http://localhost:3000');
        // Open DevTools for debugging
        mainWindow.webContents.openDevTools();
    } else {
        // Production: load from built files
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

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
