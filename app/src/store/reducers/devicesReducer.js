import createReducer from '../../helpers/create-reducer';
import {
  SEND_STATUS_MESSAGE,
  SEND_MIDI_IN_DEVICE,
  SEND_MIDI_OUT_DEVICE,
  SEND_OSC_MESSAGE,
  SEND_MIDI_MESSAGE,
} from '../../constants/actionConstants';
import { ConnectionStatus } from '../../constants/genericConstants';

const initialState = {
  status        : ConnectionStatus.DISCONNECTED,
  midiInDevices : [],
  midiOutDevices: [],
  oscMsg: '',
  midiMsg: '',
};

export default createReducer(initialState, {
  [SEND_STATUS_MESSAGE]    : (state, action) => ({
    ...state,
    status: action.payload,
  }),
  [SEND_OSC_MESSAGE]    : (state, action) => ({
    ...state,
    oscMsg: action.payload,
  }),
  [SEND_MIDI_MESSAGE]    : (state, action) => ({
    ...state,
    midiMsg: action.payload,
  }),
  [SEND_MIDI_OUT_DEVICE]: (state, action) => ({
    ...state,
    midiOutDevices: action.payload,
  }),
  [SEND_MIDI_IN_DEVICE] : (state, action) => ({
    ...state,
    midiInDevices: action.payload,
  }),
});
