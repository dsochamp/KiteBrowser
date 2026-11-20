const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    retrieveJSON: (callback) => {
        ipcRenderer.once("send-history", (_event, jsoninfo) => {
            callback(jsoninfo);
        });

        ipcRenderer.send("request-history");
    },
    
    searchDomain: (domain, number) => {
        ipcRenderer.send("search-domain", domain, number);
    }
});