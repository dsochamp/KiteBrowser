const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    setPageBounds: (bounds) => {
        ipcRenderer.send("set-page-bounds", bounds);
    }
});