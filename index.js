const WebMidi = require('webmidi');
const io = require('socket.io-client');
const socket = io('http://localhost:9000');
const { ipcRenderer } = require('electron');

let midiInDevices = [];
let midiOutDevices = [];
const select = selector => document.querySelector(selector);
let version = select('#version');

ipcRenderer.on('version', (event, text) => {
    version.innerText = text
});

// AUTO UPDATE IPC MESSAGES

// ipcRenderer.on('message', function(event, text) {
//     let container = document.getElementById('messages');
//     let message = document.createElement('div');
//     message.innerHTML = text;
//     container.appendChild(message);
// });

WebMidi.enable((err) => {
    if (err) {
        $('#errors').append(err);
        console.error(err);
    }
    midiOutDevices = WebMidi.outputs;
    midiInDevices = WebMidi.inputs;
    midiInDevices.forEach((i) => {
        $('#midiInputDevices').append(new Option(i.name, i.name))
    });

    midiInDevices.forEach((o) => {
        $('#midiOutputDevices').append(new Option(o.name, o.name))
    });
});

$('#midiInputDevices').change(e => {
    socket.emit('setMidiInputDevice', e.target.value);
});

$('#midiOutputDevices').change(e => {
    socket.emit('setMidiOutputDevice', e.target.value);
});

$('#exportBackup').on("click", (e) => {
    e.preventDefault();
    socket.emit('exportBackup');
});

$('#importBackup').on("click", (e) => {
    e.preventDefault();
    socket.emit('importBackup');
});

socket.on('midiInputDevice', (data) => {
    $("#midiInputDevices").val(data);
});

socket.on('midiOutputDevice', (data) => {
    $("#midiOutputDevices").val(data);
});

socket.on('MESSAGE', (msg) => {
    messageHandler(msg);
});

function messageHandler(msg) {
    const div = $('#code');
    div.append(msg + '<br />');
    div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}




