const express = require('express');
const path = require('path');
const app = express();
const WebMidi = require('webmidi');
const low = require('lowdb');
const remote = require('electron').remote;
const electronApp = remote.app;
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(electronApp.getPath('appData') + '/ControllerComposerOptions.json');
const db = low(adapter);
const cors = require('cors');
const  fs = require('fs');
const os = require('os');

const port = 9000;

let ip = undefined;
let counter = 0;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'app', 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'app', 'build', 'index.html'));
});

db.defaults(
    {
        options: {
            elements: [],
            tabs    : [],
            settings: {}
        }
    })
    .write();

let midiOutputDevice = db.get('options.settings.midiOutDevice').value() || undefined;

// GET /posts/:id
app.get('/db', (req, res) => {
    const settings = db.get('options').value();
    res.send(settings)
});

// POST /db
app.post('/db', (req, res) => {
    db.set('options', req.body).write();
    res.send("ok");
});

const server = app.listen(port, "0.0.0.0");
const io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {
    // prevent messages on every client connection
    counter ++;
    if (counter === 1) {
        checkIpAddress();
    }

    if (midiOutputDevice !== undefined) {
        io.sockets.emit('midiOutputDevice', midiOutputDevice);
    }

    socket.on('MIDIBTN', (msg) => {
        if (midiOutputDevice !== undefined) {
            socket.broadcast.emit('MIDIBTN', msg);
            const midi = WebMidi.getOutputByName(midiOutputDevice);
            if (midi) {
                if (msg.midiType === 'cc') {
                    // sendControlChange ( controller  [value=0]  [channel=all]  [options={}] )
                    midi.sendControlChange(msg.value, 127, msg.channel);
                } else {
                    // playNote ( note  [channel=all]  [options={}] )
                    midi.playNote(msg.value, msg.channel, {duration: 100});
                }
            }
        } else {
            io.sockets.emit('ERROR_MESSAGE', 'ERROR: Please, set a MIDI device first');
        }
    });

    socket.on('MIDISLIDER', (msg) => {
        if (midiOutputDevice !== undefined) {
            socket.broadcast.emit('MIDISLIDER', msg);
            const midi = WebMidi.getOutputByName(midiOutputDevice);
            if (midi) {
                if (msg.midiType === 'pitch') {
                    midi.sendPitchBend(msg.value, msg.channel);
                } else {
                    // sendControlChange ( controller  [value=0]  [channel=all]  [options={}] )
                    midi.sendControlChange(msg.ccValue, msg.value, msg.channel);
                }
            }
        } else {
            io.sockets.emit('ERROR_MESSAGE', 'ERROR: Please, set a MIDI device first');
        }
    });

    socket.on('setMidiOutputDevice', (msg) => {
        db.set('options.settings.midiOutDevice', msg).write();
        midiOutputDevice = db.get('options.settings.midiOutDevice').value();
    });

    socket.on('exportBackup', () => {
        const dialog = remote.dialog;
        dialog.showSaveDialog({
            filters: [
                {name: 'Backup', extensions: ['json']}
            ]
        }, (fileName) => {
            if (fileName === undefined) {
                return;
            }
            const elements = db.get('options.elements').value();
            const tabs = db.get('options.tabs').value();
            const settings = db.get('options.settings').value();
            const content = JSON.stringify({elements, tabs, settings});
            fs.writeFile(fileName, content, (err) => {
                if (err) {
                    io.sockets.emit('ERROR_MESSAGE', 'ERROR: An error occurred exporting backup file');
                    return;
                }
                io.sockets.emit('MESSAGE', 'Backup successfully exported')
            });
        });
    });

    socket.on('importBackup', () => {
        const dialog = remote.dialog;
        dialog.showOpenDialog({
            filters: [
                {name: '', extensions: ['json']}
            ]
        }, (file) => {
            if (file === undefined) {
                return;
            }
            fs.readFile(file[0], (err, data) => {
                if (err) {
                    io.sockets.emit('ERROR_MESSAGE', 'ERROR: An error occurred importing backup file');
                    return;
                }
                const objs = JSON.parse(data);
                db.set('options.settings', objs.settings).write();
                db.set('options.tabs', objs.tabs).write();
                db.set('options.elements', objs.elements).write();
                io.sockets.emit('importBackupDone');
                io.sockets.emit('MESSAGE', 'Backup successfully loaded')
            });
        });
    });
});

function checkIpAddress() {
    const connections = os.networkInterfaces();
    connections.en0.forEach(conn => {
        if (conn.family === 'IPv4') {
            ip = conn.address + ':' + port;
            io.sockets.emit('START_MESSAGE', `Ready! Open your browser and go to ${ip}`);
        }
    });
}
