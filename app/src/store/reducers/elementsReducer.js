import createReducer from '../../helpers/create-reducer';
import { DefaultColors, ElementTypes, MidiTypes, SliderOrientation } from '../../constants/genericConstants';
import {
  CREATE_BUTTON,
  CREATE_LABEL,
  CREATE_SLIDER, DELETE_ELEMENT, DELETE_ELEMENTS_FROM_TAB,
  HANDLE_EDIT_ELEMENT, IMPORT_ELEMENTS_FROM_FILE,
  LOAD_ELEMENTS,
  LOCK_ELEMENT,
  RESET_BOARD,
  SAVE_ELEMENT_FORM,
  UPDATE_ELEMENT_POS,
  UPDATE_ELEMENT_SIZE
} from '../../constants/actionConstants';
import { uuidGen } from '../../helpers/uuid-generator';

const initialState = {
  elements: [],
  editedElementId: '',
  isStyleColorPickerOpen: false,
  isLabelColor: false,
};

export default createReducer(initialState, {
  [RESET_BOARD]: () => ({ ...initialState }),
  [CREATE_BUTTON]: (state, action) => {
    const id = uuidGen();
    const element = {
      id,
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      static: false,
      label: 'Label',
      tab: action.payload,
      type: ElementTypes.BTN,
      midiType: MidiTypes.NOTE,
      channel: 1,
      value: 0,
      styleColor: DefaultColors.STYLE_COLOR,
      labelColor: DefaultColors.TEXT_COLOR
    };
    return {
      ...state,
      elements: [...state.elements, element]
    };
  },
  [CREATE_SLIDER]: (state, action) => {
    const id = uuidGen();
    const element = {
      id,
      x: 0,
      y: 0,
      w: 100,
      h: 300,
      static: false,
      label: 'Label',
      tab: action.payload,
      type: ElementTypes.SLIDER,
      midiType: MidiTypes.CC,
      channel: 1,
      ccValue: 0,
      styleColor: DefaultColors.STYLE_COLOR,
      labelColor: DefaultColors.TEXT_COLOR,
      minCcValue: 0,
      maxCcValue: 127,
      minPitchValue: -1,
      maxPitchValue: 1,
      orientation: SliderOrientation.VERTICAL
    };
    return {
      ...state,
      elements: [...state.elements, element]
    };
  },
  [CREATE_LABEL]: (state, action) => {
    const id = uuidGen();
    const element = {
      id,
      x: 0,
      y: 0,
      w: 100,
      h: 50,
      static: false,
      label: 'label',
      tab: action.payload,
      type: ElementTypes.LABEL,
      color: DefaultColors.LABEL_TEXT_COLOR,
      textAlign: 'center'
    };
    return {
      ...state,
      elements: [...state.elements, element]
    };
  },
  [UPDATE_ELEMENT_POS]: (state, action) => ({
    ...state,
    elements: state.elements.map(
      el =>
        el.id === action.payload.id
          ? {
            ...el,
            x: el.x + action.payload.pos.deltaX,
            y: el.y + action.payload.pos.deltaY
          }
          : el
    )
  }),
  [UPDATE_ELEMENT_SIZE]: (state, action) => ({
    ...state,
    elements: state.elements.map(
      el =>
        el.id === action.payload.id
          ? {
            ...el,
            w: action.payload.ref.style.width,
            h: action.payload.ref.style.height
          }
          : el
    )
  }),
  [LOCK_ELEMENT]: (state, action) => ({
    ...state,
    elements: state.elements.map(
      el => (el.id === action.payload ? { ...el, static: !el.static } : el)
    )
  }),
  [SAVE_ELEMENT_FORM]: (state, action) => ({
    ...state,
    elements: state.elements.map(
      o => (o.id === action.payload.id ? action.payload : o)
    )
  }),
  [LOAD_ELEMENTS]: (state, action) => ({
    ...state,
    elements: action.payload
  }),
  [HANDLE_EDIT_ELEMENT]: (state, action) => ({
    ...state,
    editedElementId: action.payload
  }),
  [IMPORT_ELEMENTS_FROM_FILE]: (state, action) => ({
    ...state,
    elements: action.payload
  }),
  [DELETE_ELEMENT]: (state, action) => ({
    ...state,
    elements: state.elements.filter(el => el.id !== action.payload),
  }),
  [DELETE_ELEMENTS_FROM_TAB]: (state, action) => ({
    ...state,
    elements: state.elements.filter(el => el.tab.id !== action.payload),
  })
});
