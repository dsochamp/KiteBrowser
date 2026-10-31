const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    setPageBounds: (bounds) => {
        ipcRenderer.send("set-page-bounds", bounds);
    },

    reloadPage: () => {
        ipcRenderer.send("reload-page");
    },

    searchDomain: (domain, number) => {
        ipcRenderer.send("search-domain", domain, number);
    },

    backPage: (domain) => {
        ipcRenderer.send("forward-domain", domain)
    },

    switchTab: (number) => {
        ipcRenderer.send("switch-tab", number)
    },

    trafficlightsChanged: (callback) => {
        ipcRenderer.on("movetrafficlights", (_event, isFullScreen) => callback(isFullScreen))
    },

    URLchanged: (callback) => {
        ipcRenderer.on("urlchanged", (_event, URLchanged) => callback(URLchanged))
    },
    addTab: (boolean, number) => {
        ipcRenderer.send("add-tab", boolean, number);
    },
    getTitle: (callback) => {
        ipcRenderer.on("get-title", (_event, getTitle) => callback(getTitle))
    },
    closeTab: (number) => {
        ipcRenderer.on("close-tab", number)
    }
});
