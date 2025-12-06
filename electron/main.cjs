const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Disable hardware acceleration to prevent rendering artifacts (white lines, glitches)
app.disableHardwareAcceleration();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: false
        },
        autoHideMenuBar: true,
        backgroundColor: '#191919', // Match dark theme to prevent white flashes/lines
        title: 'Personal Finance Tracker',
        icon: path.join(__dirname, '../public/favicon.ico'),
        show: false // Wait until ready to prevent focus issues
    });

    // Optimize view and ensure focus
    win.once('ready-to-show', () => {
        win.maximize();
        win.show();
        // Force focus with a slight delay to ensure it catches after the window manager animation
        setTimeout(() => {
            win.focus();
        }, 250);
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();

    // Open external links in browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
