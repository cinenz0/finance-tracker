const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');

// Disable hardware acceleration to prevent rendering artifacts (white lines, glitches)
app.disableHardwareAcceleration();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
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

// --- IPC Handlers for Backup System ---

const getBackupPath = () => {
    return path.join(app.getPath('documents'), 'FinanceTrackerBackups');
};

ipcMain.handle('save-backup', async (event, { data, filename }) => {
    try {
        const backupDir = getBackupPath();
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fileName = filename || `backup-${new Date().toISOString().split('T')[0]}.json`;
        const filePath = path.join(backupDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { success: true, path: filePath };
    } catch (error) {
        console.error('Backup failed:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-backup', async () => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'JSON', extensions: ['json'] }],
            defaultPath: getBackupPath()
        });

        if (result.canceled || result.filePaths.length === 0) {
            return { canceled: true };
        }

        const filePath = result.filePaths[0];
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return { success: true, data };
    } catch (error) {
        console.error('Restore failed:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('check-backup', async () => {
    try {
        const backupDir = getBackupPath();
        const today = new Date().toISOString().split('T')[0];
        const expectedFile = path.join(backupDir, `backup-${today}.json`);

        return fs.existsSync(expectedFile);
    } catch (error) {
        return false;
    }
});

// --------------------------------------

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
