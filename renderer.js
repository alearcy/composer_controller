let midiOutDevices = [];

console.log("renderer started");

ipcRenderer.on("midiOutputDevice", (data) => {
  console.log("entro", data);
  data.forEach((o) => {
    $("#midiOutputDevices").append(new Option(o.name, o.name));
  });
});

$("#midiOutputDevices").change((e) => {
  ipcRenderer.send("setMidiOutputDevice", e.target.value);
});

$("#exportBackup").on("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("exportBackup");
  console.log("export pressed");
});

$("#importBackup").on("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("importBackup");
});

ipcRenderer.on("MESSAGE", (msg) => {
  messageHandler(msg);
});

ipcRenderer.on("ERROR_MESSAGE", (msg) => {
  errorMessageHandler(msg);
});

ipcRenderer.on("START_MESSAGE", (msg) => {
  startMessageHandler(msg);
});

function messageHandler(msg) {
  const div = $("#code");
  div.append("<div>" + msg + "</div><br />");
  div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}

function errorMessageHandler(msg) {
  const div = $("#code");
  div.append('<div class="error-message">' + msg + "</div><br />");
  div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}

function startMessageHandler(msg) {
  const div = $("#code");
  div.append('<div class="start-message">' + msg + "</div><br />");
  div.animate({ scrollTop: div.prop("scrollHeight") }, 5);
}
