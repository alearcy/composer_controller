import * as messageActions from '../../constants/actionConstants';

export function sendConnectionStatus(value) {
  return {
    type: messageActions.SEND_STATUS_MESSAGE,
    payload: value,
  };
}

export function sendOSCMessage(msg) {
  return {
    type: messageActions.SEND_OSC_MESSAGE,
    payload: msg,
  };
}
