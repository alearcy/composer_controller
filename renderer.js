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
const OSC = require('osc-js');
const os = require('os');

const port = 9000;

let midiInputDevice = db.get('options.settings.midiInDevice').value() || undefined;
let midiOutputDevice = db.get('options.settings.midiOutDevice').value() || undefined;
let oscOutPort = db.get('options.settings.oscOutPort').value() || undefined;
let ip = undefined;

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

const osc = new OSC({ plugin: new OSC.DatagramPlugin() });
osc.open();

io.sockets.on('connection', (socket) => {
    checkIpAddress();

    if (midiInputDevice !== undefined) {
        io.sockets.emit('midiInputDevice', midiInputDevice);
    }
    if (midiOutputDevice !== undefined) {
        io.sockets.emit('midiOutputDevice', midiOutputDevice);
    }

    socket.on('osc', (msg) => {
        if (oscOutPort !== undefined) {
            osc.send(new OSC.Message(msg.address, msg.value), { port: oscOutPort })
        }else{
            error('OSC out port not configured');
        }
    });

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
            error('Please, set a MIDI device first')
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
            error('Please, set a MIDI device first')
        }
    });

    socket.on('midiInputDevice', (msg) => {
        db.set('options.settings.midiInDevice', msg).write();
    });

    socket.on('midiOutputDevice', (msg) => {
        db.set('options.settings.midiOutDevice', msg).write();
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
                if (err) console.error(err);
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
                const objs = JSON.parse(data);
                db.set('options.settings', objs.settings).write();
                db.set('options.tabs', objs.tabs).write();
                db.set('options.elements', objs.elements).write();
                io.sockets.emit('importBackupDone');
            });
        });
    });
});

function checkIpAddress() {
    const connections = os.networkInterfaces();
    connections.en0.forEach(conn => {
        if (conn.family === 'IPv4') {
            ip = conn.address + ':' + port;
            io.sockets.emit('ipMessage', ip);
        }
    });
}

function error(err) {
    io.sockets.emit('error', err);
}
