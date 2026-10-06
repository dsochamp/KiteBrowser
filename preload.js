const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    setPageBounds: (bounds) => {
        ipcRenderer.send("set-page-bounds", bounds);
    },

    reloadPage: () => {
        ipcRenderer.send("reload-page");
    },

    searchDomain: (domain) => {
        ipcRenderer.send("search-domain", domain);
    },

    backPage: (domain) => {
        ipcRenderer.send("forward-domain", domain)
    }
});
