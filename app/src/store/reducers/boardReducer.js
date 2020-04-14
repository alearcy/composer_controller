import createReducer from '../../helpers/create-reducer';
import {
    HANDLE_EDITING_MODE,
    HANDLE_VISIBILITY_MODE,
    RESET_BOARD,
    HANDLE_LOADING,
    HANDLE_CLOSE_DRAWER,
    EXIT_EDITING_MODE,
    HANDLE_OPEN_DRAWER,
    ELEMENT_FORM_REQUEST,
    TAB_FORM_REQUEST,
    SAVE_SETTINGS_FORM,
    LOAD_SETTINGS,
    IMPORT_SETTINGS_FROM_FILE,
    HANDLE_CONFIRMATION,
    SET_IP
} from '../../constants/actionConstants';

const initialState = {
    isEditingMode   : false,
    isVisibilityMode   : false,
    loading         : false,
    isOpenDrawer    : false,
    formRequested   : '',
    isConfirmVisible: false,
    publicIp        : '',
    settings        : {
        midiInDevice : '',
        midiOutDevice: '',
    }
};

export default createReducer(initialState, {
    [RESET_BOARD]              : () => ({...initialState}),
    [HANDLE_EDITING_MODE]      : (state) => ({
        ...state,
        isEditingMode: !state.isEditingMode
    }),
    [HANDLE_VISIBILITY_MODE]      : (state) => ({
        ...state,
        isVisibilityMode: !state.isVisibilityMode
    }),
    [EXIT_EDITING_MODE]        : (state, action) => ({
        ...state,
        isEditingMode: action.payload
    }),
    [HANDLE_LOADING]           : (state, action) => ({
        ...state,
        loading: action.payload
    }),
    [HANDLE_CLOSE_DRAWER]      : (state) => ({
        ...state,
        isOpenDrawer: false
    }),
    [HANDLE_OPEN_DRAWER]       : (state) => ({
        ...state,
        isOpenDrawer: true
    }),
    [ELEMENT_FORM_REQUEST]     : (state, action) => ({
        ...state,
        isOpenDrawer : true,
        formRequested: action.payload
    }),
    [TAB_FORM_REQUEST]         : (state, action) => ({
        ...state,
        isOpenDrawer : true,
        formRequested: action.payload
    }),
    [SAVE_SETTINGS_FORM]       : (state, action) => ({
        ...state,
        settings: action.payload
    }),
    [LOAD_SETTINGS]            : (state, action) => ({
        ...state,
        settings: action.payload
    }),
    [IMPORT_SETTINGS_FROM_FILE]: (state, action) => ({
        ...state,
        settings: action.payload
    }),
    [HANDLE_CONFIRMATION]      : (state, action) => ({
        ...state,
        isConfirmVisible: action.payload
    }),
    [SET_IP]                   : (state, action) => ({
        ...state,
        publicIp: action.payload
    })
});
