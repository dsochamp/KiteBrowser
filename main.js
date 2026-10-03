const {
    app,
    BrowserWindow,
    WebContentsView,
    ipcMain
} = require("electron");

let webView;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,

        webPreferences: {
            preload: __dirname + "/preload.js"
        }
    });

    win.loadFile("index.html");
    webView = new WebContentsView();

    win.contentView.addChildView(webView);

    webView.webContents.loadURL("https://supernova-rsvp.vercel.app");
}

ipcMain.on("set-page-bounds", (event, bounds) => {
    if (!webView) return;

    webView.setBounds ({
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height)
    });
});

app.whenReady().then(createWindow);