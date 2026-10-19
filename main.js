const { create } = require("domain");
const fs = require("node:fs");
const path = require("node:path");

const {
    app,
    BrowserWindow,
    WebContentsView,
    ipcMain
} = require("electron");

let dataPath = path.join(__dirname, "data.json")
/*
function readData() {
    try {
        const rawData = fs.readFileSync(dataPath, "utf8")
        const data = JSON.parse(rawData)

        return {
            history: Array.isArray(data.history) ? data.history : [],
            bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : []
        };
    } catch (error) {
        const initialData = {
            history: [],
            bookmarks: []
        };

        writeData(initialData);
        return initialData;
    }
};

function addData([title, url, visitedAt, duration], type) {
    if (type === "history") {
        const data = readData();
        data.history.unshift({
            title: title,
            url: url,
            visitedAt: visitedAt,
            duration: duration
        });
        fs.writeFileSync(
            dataPath,
            JSON.stringify(data, null, 2),
            "utf8"
        );
    }

    if (type === "bookmarks") {
        const data = readData();
        data.bookmarks.unshift({
            title: title,
            url: url
        });

        fs.writeFileSync(
            dataPath,
            JSON.stringify(data, null, 2),
            "utf8"
        );
    }
};
*/
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

    win.on("enter-full-screen", () => {
        win.webContents.send("movetrafficlights", true)
    });

    win.on("leave-full-screen", () => {
        win.webContents.send("movetrafficlights", false)
    });

    webView = new WebContentsView();

    win.contentView.addChildView(webView);

    webView.webContents.loadURL("https://google.com");

    webView.webContents.on("did-finish-load", () => {
        win.webContents.send("urlchanged", webView.webContents.getURL())
    });
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