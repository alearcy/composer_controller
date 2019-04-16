import * as messageActions from '../../constants/actionConstants';

export function sendMidiOutDevice(devices) {
  return {
    type: messageActions.SEND_MIDI_OUT_DEVICE,
    payload: devices,
  };
}

export function sendMidiInDevice(devices) {
  return {
    type: messageActions.SEND_MIDI_IN_DEVICE,
    payload: devices,
  };
}

export function sendSliderMessage(value, obj) {
  return {
    type: messageActions.SEND_SLIDER_MESSAGE,
    payload: { value, obj },
  };
}

export function sendConnectionStatus(value) {
  return {
    type: messageActions.SEND_STATUS_MESSAGE,
    payload: value,
  };
}
