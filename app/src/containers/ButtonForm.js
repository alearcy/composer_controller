import React from 'react';
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import { CirclePicker } from 'react-color';
import * as boardActions from '../store/actions/boardActions';
import * as elementsActions from '../store/actions/elementsAction';
import { getEditedElement } from '../store/selectors/elementsSelectors';
import { getConfirmationStatus } from '../store/selectors/boardSelectors';
import { MidiTypes, StyleColors, LabelColors, MidiMap } from '../constants/genericConstants';

const basicButtonForm = (props) => {
  const {
    values,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    closeForm,
    deleteButton,
    handleConfirmation,
    isConfirmVisible,
    obj
  } = props;
  const handleStyleColor = (color) => {
    values.styleColor = color.hex;
  };
  const handleLabelColor = (color) => {
    values.labelColor = color.hex;
  };
  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Label:</label>
          <input name="label"
                 type="text"
                 value={values.label}
                 onChange={handleChange}
                 onBlur={handleBlur}/>
        </div>
        <div>
          <label>Style colors:</label>
          <CirclePicker
            id="styleColor"
            colors={StyleColors}
            color={values.styleColor}
            width="300px"
            onChangeComplete={handleStyleColor}/>
        </div>
        <div>
          <label>Label colors:</label>
          <CirclePicker
            id="labelColor"
            colors={LabelColors}
            color={values.labelColor}
            width="300px"
            onChangeComplete={handleLabelColor}/>
        </div>
        <div>
          <label>MIDI:</label>
          <select value={values.midiType} onChange={handleChange} id="midiType">
            <option value="">No midi signal</option>
            <option value={MidiTypes.CC}>Control change</option>
            <option value={MidiTypes.NOTE}>Note</option>
          </select>
        </div>
        <div>
          <label>Channel:</label>
          <input name="channel"
                 type="number"
                 value={values.channel}
                 onChange={handleChange}
                 onBlur={handleBlur}/>
        </div>
        <div>
          <label>Value: {values.midiType === MidiTypes.NOTE && "(60 = C3, 72 = C4)"}</label>
          <div className="note-value-box">
            <input name="value"
                   type="number"
                   value={values.value}
                   onChange={handleChange}
                   onBlur={handleBlur}/>
            <div className="note-name">
              {values.midiType === MidiTypes.NOTE ? MidiMap[values.value] : null}
            </div>
          </div>
        </div>
        <div className="submit-area">
          <button type="submit" disabled={isSubmitting} className="confirm">
            {isSubmitting ? 'Loading...' : 'Save'}
          </button>
          <button type="button" onPointerDown={closeForm} className="neutral">Cancel</button>
        </div>
      </form>
      <div className="extra-tools">
        {!isConfirmVisible &&
        <button type="button" onPointerDown={() => handleConfirmation(true)} className="danger">Delete</button>}
        {isConfirmVisible && <div className="confirmation-area">
          <div className="confirmation-area--label">Sure?</div>
          <button type="button" onPointerDown={() => deleteButton(obj.id)} className="danger">Yes</button>
          <button type="button" className="neutral" onPointerDown={() => handleConfirmation(false)}>No</button>
        </div>}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  obj             : getEditedElement(state),
  isConfirmVisible: getConfirmationStatus(state)
});

const mapDispatchToProps = dispatch => ({
  submitForm        : values => dispatch(elementsActions.saveElementForm(values)),
  closeForm         : () => dispatch(boardActions.exitEditingElement()),
  deleteButton      : id => dispatch(elementsActions.deleteElement(id)),
  handleConfirmation: status => dispatch(boardActions.handleConfirmation(status))
});

const enhancedForm = withFormik({
  mapPropsToValues  : props => props.obj,
  handleSubmit      : (values, { props, setSubmitting }) => {
    props.submitForm(values);
    setSubmitting(false);
  },
  enableReinitialize: true,
  displayName       : 'ButtonForm'
})(basicButtonForm);

const ButtonForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(enhancedForm);

export default ButtonForm;
