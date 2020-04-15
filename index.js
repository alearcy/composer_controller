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
ipcRenderer.on('autoUpdate', function(event, text) {
    let container = document.getElementById('messages');
    let message = document.createElement('div');
    message.innerHTML = text;
    container.appendChild(message);
});

ipcRenderer.on('updateReady', function(event, text) {
    let container = document.getElementById('messages');
    let message = document.createElement('div');
    let link = document.createElement('a');
    message.innerHTML = text;
    link.href = "https://github.com/alearcy/composer_controller/releases";
    link.innerHTML = "Click here."
    container.appendChild(message);
});

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

socket.on('ERROR_MESSAGE', (msg) => {
    errorMessageHandler(msg);
});

socket.on('START_MESSAGE', (msg) => {
    startMessageHandler(msg);
});

function messageHandler(msg) {
    const div = $('#code');
    div.append('<div>' + msg + '</div><br />');
    div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}

function errorMessageHandler(msg) {
    const div = $('#code');
    div.append('<div class="error-message">' + msg + '</div><br />');
    div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}

function startMessageHandler(msg) {
    const div = $('#code');
    div.append('<div class="start-message">' + msg + '</div><br />');
    div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}



