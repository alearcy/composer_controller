// Modules to control application life and create native browser window
import { app, BrowserWindow, dialog, ipcMain } from "electron";
// EXPRESS IMPORTS
import cors from "cors";
import express from "express";
import fs from "fs";
import http from 'http';
import { JSONFilePreset } from "lowdb/node";
import os from "os";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import OSC from 'osc-js';

const dbDefaults = {
  options: {
    elements: [],
    tabs: [],
    settings: {
      oscInPort: 9003,
      oscOutPort: 9002,
    },
  },
  time: null,
};

const db = await JSONFilePreset("db.json", dbDefaults);
await db.write();

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
    icon: __dirname + "/public/icon.png",
  });

  mainWindow.menuBarVisible = false;

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  mainWindow.webContents.on("dom-ready", () => {
    startExpressServer();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//if (require("electron-squirrel-startup")) app.quit();
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(err => console.error(err));

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

const startExpressServer = () => {
  // EXPRESSSSSS
  const expressApp = express();
  const port = 9000;
  const oscInPort = 9002;
  const oscOutPort = 9003;

  let ip = undefined;
  let counter = 0;

  expressApp.use(cors());
  expressApp.use(express.json());
  expressApp.use(express.static(path.join(__dirname, "app", "build")));

  expressApp.get("/", function (_, res) {
    res.sendFile(path.join(__dirname, "app", "build", "index.html"));
  });

  // GET
  expressApp.get("/db", (req, res) => {
    const settings = db.data.options;
    res.send(settings);
  });

  // POST /db
  expressApp.post("/db", async (req, res) => {
    db.data.options = req.body;
    await db.write();
    res.send(db.data);
  });

  const server = http.createServer(expressApp);
  const osc = new OSC({ plugin: new OSC.DatagramPlugin() });
  osc.open();

  const checkIpAddress = () => {
    const connections = os.networkInterfaces();
    connections.Ethernet.forEach((conn) => {
      if (conn.family === "IPv4") {
        ip = conn.address + ":" + port;
        mainWindow.webContents.send(
          "START_MESSAGE",
          `Ready! Open your browser and go to ${ip}`
        );
      }
    });
  };

  server.listen(port, () => {
    checkIpAddress();
    io.sockets.emit(
      "MESSAGE",
      `OSC input: ${oscInPort}, OSC output: ${oscOutPort}`
    );
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.sockets.on("connection", (socket) => {
    // prevent messages on every client connection
    counter++;

    socket.on("osc", (msg) => {
      osc.send(new OSC.Message(msg.address, msg.value), { port: oscOutPort });
    });
  });


  // IMPORT AND EXPORT BACKUP
  ipcMain.on("exportBackup", () => {
    dialog
      .showSaveDialog({
        filters: [{ name: "", extensions: ["json"] }],
      })
      .then((file) => {
        if (file === undefined) {
          mainWindow.webContents.send(
            "ERROR_MESSAGE",
            "ERROR: An error occurred exporting backup file: undefined"
          );
          return;
        }
        const elements = db.data.options.elements;
        const tabs = db.data.options.tabs;
        const settings = db.data.options.settings;
        const timeStamp = (db.data.time = new Date());
        const content = JSON.stringify({ elements, tabs, settings, timeStamp });
        const { filePath } = file;
        fs.writeFile(filePath, content, (err) => {
          if (err) {
            mainWindow.webContents.send(
              "ERROR_MESSAGE",
              "ERROR: An error writing file: " + err
            );
            return;
          }
          mainWindow.webContents.send(
            "MESSAGE",
            "Backup successfully exported"
          );
        });
      })
      .catch((err) => {
        mainWindow.webContents.send(
          "ERROR_MESSAGE",
          "ERROR: An error occurred exporting backup file: " + err
        );
      });
  });

  ipcMain.on("importBackup", () => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "", extensions: ["json"] }],
      })
      .then((file) => {
        fs.readFile(file.filePaths[0], async (err, data) => {
          if (err) {
            mainWindow.webContents.send(
              "ERROR_MESSAGE",
              "ERROR: An error occurred importing backup file"
            );
          }
          const objs = JSON.parse(data);
          db.data.options.settings = objs.settings;
          db.data.options.tabs = objs.tabs;
          db.data.options.elements = objs.elements;
          await db.write();
          mainWindow.webContents.send("MESSAGE", "Backup successfully loaded. Please RELOAD THE BOARD!");
        });
      })
      .catch((err) => {
        mainWindow.webContents.send(
          "ERROR_MESSAGE",
          "ERROR: An error occurred importing backup file: " + err
        );
      });
  });
  }