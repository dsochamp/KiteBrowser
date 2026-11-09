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
let webViews = [];

let activeTabIndex = 0;

let currentBounds = { x: 0, y: 0, width: 800, height: 600 };

function handleNewTab(view, win) {
    view.webContents.setWindowOpenHandler(({ url }) => {
        win.webContents.send("new-tab", url);

        return { action: "deny" };
    });
}

function createWindow() {
    let win = BrowserWindow.getFocusedWindow() || new BrowserWindow({
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

    const intitialView = new WebContentsView();

    handleNewTab(intitialView, win);

    webViews.push(intitialView);

    win.contentView.addChildView(intitialView);

    intitialView.webContents.loadURL("https://google.com");

    intitialView.webContents.on("did-finish-load", () => {
        win.webContents.send("urlchanged", intitialView.webContents.getURL());
        win.webContents.send("get-title", intitialView.webContents.getTitle())
    });

}

ipcMain.on("set-page-bounds", (event, bounds) => {

    currentBounds = bounds;
    if (webViews.length === 0) return;

    webViews.forEach((view) => {
        if (view) {
            view.setBounds({
                x: Math.round(bounds.x),
                y: Math.round(bounds.y),
                width: Math.round(bounds.width),
                height: Math.round(bounds.height)
            });
        }
    });
});

ipcMain.on("reload-page", () => {
    const activeView = webViews[activeTabIndex];
    if (activeView && activeView.webContents) {
        activeView.webContents.reload();
    }
});

ipcMain.on("search-domain", (event, data) => {
    const targetIndex = data.number ?? activeTabIndex;
    const targetView = webViews[targetIndex];

    if (targetView && targetView.webContents) {
        targetView.webContents.loadURL(data.domain);
    }
})

ipcMain.on("forward-domain", (event, data) => {
    const activeView = webViews[activeTabIndex];
    if(activeView && activeView.webContents) {
        activeView.webContents.loadURL(data.domain);
    }
})

ipcMain.on("switch-tab", (event, data) => {
    const win = BrowserWindow.getFocusedWindow();
    activeTabIndex = data.number;
    const activeView = webViews[activeTabIndex];

    if (activeView) {
        win.contentView.removeChildView(activeView);
        win.contentView.addChildView(activeView);
        win.webContents.send("urlchanged", activeView.webContents.getURL());
        win.webContents.send("get-title", activeView.webContents.getTitle());
    }
});

ipcMain.on("close-tab", (event, data) => {
    const win = BrowserWindow.getFocusedWindow();
    const index = data.number;

    if (!win || !webViews[index]) return;

    const closeView = webViews[index];

    win.contentView.removeChildView(closeView);

    closeView.webContents.close();

    webViews.splice(index, 1);

    if (webViews.length === 0) {
        activeTabIndex = -1;
        return;
    }

    if (activeTabIndex === index) {
        activeTabIndex = Math.min(index, webViews.length - 1);
    } else if (activeTabIndex > index) {
        activeTabIndex --;
    }
});

ipcMain.on("add-tab", (event, data) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    if (data.boolean) {
        const newView = new WebContentsView();

        handleNewTab(newView, win);

        newView.setBounds({ 
            x: Math.round(currentBounds.x),
            y: Math.round(currentBounds.y),
            width: Math.round(currentBounds.width),
            height: Math.round(currentBounds.height)
        });

        webViews.push(newView);

        win.contentView.addChildView(newView);

        activeTabIndex = webViews.length - 1;

        newView.webContents.loadURL(data.domain || "https://google.com");

        newView.webContents.on("did-finish-load", () => {
            win.webContents.send("urlchanged", newView.webContents.getURL());
        });
    }
})


app.whenReady().then(createWindow);