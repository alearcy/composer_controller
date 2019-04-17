const WebMidi = require('webmidi');
const io = require('socket.io-client');
const socket = io('http://localhost:9000');
const { ipcRenderer } = require('electron');

let midiInDevices = [];
let midiOutDevices = [];

const select = selector => document.querySelector(selector);

let container = select('#messages');
let progressBar = select('#progressBar');
let version = select('#version');

ipcRenderer.on('message', (event, text) => {
    console.log('text');
    let message = document.createElement('div');
    message.innerHTML = text;
    container.appendChild(message)
});

ipcRenderer.on('version', (event, text) => {
    version.innerText = text
});

ipcRenderer.on('download-progress', (event, text) => {
    console.log('text');
    progressBar.style.width = `${text}%`
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
    socket.emit('midiInputDevice', e.target.value);
});

$('#midiOutputDevices').change(e => {
    socket.emit('midiOutputDevice', e.target.value);
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

socket.on('MIDIBTN', (data) => {
    messageButtonHandler(data);
});

socket.on('MIDISLIDER', (data) => {
    messageSliderHandler(data);
});

socket.on('ipMessage', (data) => {
    ipAddressHandler(data);
});

function messageButtonHandler(msg) {
    const div = $('#code');
    div.append(`Type: ${msg.midiType} Value: ${msg.value} Channel: ${msg.channel}` + '<br />');
    div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}

function messageSliderHandler(msg) {
    const div = $('#code');
    div.append(`Type ${msg.midiType} CC Number: ${msg.ccValue} Value: ${msg.value} Channel: ${msg.channel}` + '<br />');
    div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}

function ipAddressHandler(ip) {
    const ipAddress = ip;
    $('#ip').html('<p class="ip">Ready to ' + ipAddress + '</p>');
}




