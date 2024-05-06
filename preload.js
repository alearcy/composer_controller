const { contextBridge, ipcRenderer } = require("electron");
// const { WebMidi } = require("webmidi");

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) =>
    ipcRenderer.on(channel, (event, ...args) => callback(...args)),
});

// contextBridge.exposeInMainWorld("webMidi", {
//   enable: (callback) => WebMidi.enable((e) => {
//     if (e) { callback(e)}
//   }),
//   outputs: () => WebMidi.outputs,
// });