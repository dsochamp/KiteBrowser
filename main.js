const { create } = require("domain");
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

        titleBarStyle: "hidden",

        trafficLightPosition: { x: 20, y: 25 },
        webPreferences: {
            preload: __dirname + "/preload.js"
        }
    });

    win.loadFile("index.html");
    webView = new WebContentsView();

    win.contentView.addChildView(webView);

    webView.webContents.loadURL("https://google.com");
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

ipcMain.on("reload-page", () => {
    if (webView && webView.webContents) {
        webView.webContents.reload();
    }
});

ipcMain.on("search-domain", (event, data) => {
    if (webView && webView.webContents) {
        webView.webContents.loadURL(data.domain);
    }
})

ipcMain.on("forward-domain", (event, data) => {
    if(webView && webView.webContents) {
        webView.webContents.loadURL(data.domain);
    }
})

app.whenReady().then(createWindow);