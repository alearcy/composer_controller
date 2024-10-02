import createReducer from '../../helpers/create-reducer';
import {
  SEND_STATUS_MESSAGE,
  SEND_OSC_MESSAGE,
} from "../../constants/actionConstants";
import { ConnectionStatus } from '../../constants/genericConstants';

const initialState = {
  status: ConnectionStatus.DISCONNECTED,
  oscMsg: "",
};

export default createReducer(initialState, {
  [SEND_STATUS_MESSAGE]: (state, action) => ({
    ...state,
    status: action.payload,
  }),
  [SEND_OSC_MESSAGE]: (state, action) => ({
    ...state,
    oscMsg: action.payload,
  }),
});
