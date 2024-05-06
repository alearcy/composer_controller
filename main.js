// Modules to control application life and create native browser window
import electron, { app, BrowserWindow, ipcMain } from "electron";
const remote = electron.remote;
// EXPRESS IMPORTS
import express from "express";
import path from "path";
import { WebMidi } from "webmidi";
import { Server } from "socket.io";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import cors from "cors";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import http from 'http';

const dbDefaults ={
  options: {
    elements: [],
    tabs: [],
    settings: {},
  },
};

const db = new LowSync(
  new JSONFileSync("ControllerComposerOptions.json"),
  dbDefaults
);
db.write();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 480,
    minWidth: 400,
    minHeight: 480,
    maxWidth: 400,
    maxHeight: 480,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: __dirname + "/public/icon/icon.png",
  });

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// mainWindow.webContents.session.setPermissionRequestHandler(
//   (webContents, permission, callback, details) => {
//     if (permission === "midi" || permission === "midiSysex") {
//       callback(true);
//     } else {
//       callback(false);
//     }
//   }
// );

// mainWindow.webContents.session.setPermissionCheckHandler(
//   (webContents, permission, requestingOrigin) => {
//     if (permission === "midi" || permission === "midiSysex") {
//       return true;
//     }
//     return false;
//   }
// );

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
});


// EXPRESSSSSS
const expressApp = express();
const port = 9000;

let ip = undefined;
let counter = 0;

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(express.static(path.join(__dirname, "app", "build")));

expressApp.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "app", "build", "index.html"));
});

const {options} = db.data;
let midiOutputDevice = options.settings.midiOutDevice || WebMidi.outputs;

// GET /posts/:id
expressApp.get("/db", (req, res) => {
  const settings = db.data.options;
  res.send(settings);
});

// POST /db
expressApp.post("/db", (req, res) => {
  db.data.options = req.body;
  db.write();
  res.send("ok");
});

const server = http.createServer(expressApp);

server.listen(port, () => {
  console.log("listening on *:", port);
});

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});


io.sockets.on("connection", (socket) => {
  console.log("connesso");
  // prevent messages on every client connection
  counter++;
  if (counter === 1) {
    checkIpAddress();
  }

  if (midiOutputDevice !== undefined) {
    console.log("invio i midi");
    mainWindow.webContents.send("midiOutputDevice", midiOutputDevice);
  }

  socket.on("MIDIBTN", (msg) => {
    console.log("emitto bottone", msg);
    if (midiOutputDevice !== undefined) {
      socket.broadcast.emit("MIDIBTN", msg);
      const midi = WebMidi.getOutputByName(midiOutputDevice);
      if (midi) {
        if (msg.midiType === "cc") {
          // sendControlChange ( controller  [value=0]  [channel=all]  [options={}] )
          midi.sendControlChange(msg.value, 127, msg.channel);
        } else {
          // playNote ( note  [channel=all]  [options={}] )
          midi.playNote(msg.value, msg.channel, { duration: 100 });
        }
      }
    } else {
      io.sockets.emit(
        "ERROR_MESSAGE",
        "ERROR: Please, set a MIDI device first"
      );
    }
  });

  socket.on("MIDISLIDER", (msg) => {
    console.log("emitto slider", msg);
    if (midiOutputDevice !== undefined) {
      socket.broadcast.emit("MIDISLIDER", msg);
      const midi = WebMidi.getOutputByName(midiOutputDevice);
      if (midi) {
        if (msg.midiType === "pitch") {
          midi.sendPitchBend(msg.value, msg.channel);
        } else {
          // sendControlChange ( controller  [value=0]  [channel=all]  [options={}] )
          midi.sendControlChange(msg.ccValue, msg.value, msg.channel);
        }
      }
    } else {
      io.sockets.emit(
        "ERROR_MESSAGE",
        "ERROR: Please, set a MIDI device first"
      );
    }
  });

  
});

ipcMain.on("setMidiOutputDevice", (msg) => {
  db.data.options.settings.midiOutDevice =msg;
  db.write();
  midiOutputDevice = db.data.options.settings.midiOutDevice;
});

ipcMain.on("exportBackup", () => {
  const dialog = remote.dialog;
  dialog.showSaveDialog(
    {
      filters: [{ name: "Backup", extensions: ["json"] }],
    },
    (fileName) => {
      if (fileName === undefined) {
        return;
      }
      const elements = db.data.options.elements;
      const tabs = db.data.options.tabs;
      const settings = db.data.options.settings;
      const content = JSON.stringify({ elements, tabs, settings });
      fs.writeFile(fileName, content, (err) => {
        if (err) {
          mainWindow.webContents.send(
            "ERROR_MESSAGE",
            "ERROR: An error occurred exporting backup file"
          );
          return;
        }
        mainWindow.webContents.send("MESSAGE", "Backup successfully exported");
      });
    }
  );
});

ipcMain.on("importBackup", () => {
  const dialog = remote.dialog;
  dialog.showOpenDialog(
    {
      filters: [{ name: "", extensions: ["json"] }],
    },
    (file) => {
      if (file === undefined) {
        return;
      }
      fs.readFile(file[0], (err, data) => {
        if (err) {
          mainWindow.webContents.send(
            "ERROR_MESSAGE",
            "ERROR: An error occurred importing backup file"
          );
          return;
        }
        const objs = JSON.parse(data);
        db.data.options.settings = objs.settings;
        db.data.options.tabs = objs.tabs;
        db.data.options.elements = objs.elements;
        db.write();
        mainWindow.webContents.send("importBackupDone");
        mainWindow.webContents.send("MESSAGE", "Backup successfully loaded");
      });
    }
  );
});

const checkIpAddress = () => {
  const connections = os.networkInterfaces();
  connections.en0.forEach((conn) => {
    if (conn.family === "IPv4") {
      ip = conn.address + ":" + port;
      mainWindow.webContents.send(
        "START_MESSAGE",
        `Ready! Open your browser and go to ${ip}`
      );
    }
  });
}
