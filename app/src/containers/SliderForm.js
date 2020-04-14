import React from 'react';
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import { CirclePicker } from 'react-color';
import * as boardActions from '../store/actions/boardActions';
import * as elementsActions from '../store/actions/elementsAction';
import { getEditedElement } from '../store/selectors/elementsSelectors';
import { MidiTypes, StyleColors, LabelColors, MidiMap } from '../constants/genericConstants';
import { getConfirmationStatus } from '../store/selectors/boardSelectors';

const basicSliderForm = (props) => {
  const {
    values,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    closeForm,
    deleteSlider,
    obj,
    handleConfirmation,
    isConfirmVisible
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
            <option value={MidiTypes.PITCH}>Pitch</option>
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
        {values.midiType === MidiTypes.CC &&
        <div>
          <div>
            <label>Control change value:</label>
            <input name="ccValue"
                   type="number"
                   value={values.ccValue}
                   onChange={handleChange}
                   onBlur={handleBlur}/>
            {values.midiType === MidiTypes.NOTE ? MidiMap[values.value] : null}
          </div>
          <div>
            <label>Min value:</label>
            <input name="minCcValue"
                   type="number"
                   value={values.minCcValue}
                   onChange={handleChange}
                   onBlur={handleBlur}/>
          </div>
          <div>
            <label>Max value:</label>
            <input name="maxCcValue"
                   type="number"
                   value={values.maxCcValue}
                   onChange={handleChange}
                   onBlur={handleBlur}/>
          </div>
        </div>
        }
        <div className="submit-area">
          <button type="submit" disabled={isSubmitting} className="confirm">
            {isSubmitting ? 'Loading...' : 'Save'}
          </button>
          <button type="button" onClick={closeForm} className="neutral">Cancel</button>
        </div>
      </form>
      <div className="extra-tools">
        {!isConfirmVisible &&
        <button type="button" onClick={() => handleConfirmation(true)} className="danger">Delete</button>}
        {isConfirmVisible && <div className="confirmation-area">
          <div className="confirmation-area--label">Sure?</div>
          <button type="button" onClick={() => deleteSlider(obj.id)} className="danger">Yes</button>
          <button type="button" className="neutral" onClick={() => handleConfirmation(false)}>No</button>
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
  deleteSlider      : id => dispatch(elementsActions.deleteElement(id)),
  handleConfirmation: status => dispatch(boardActions.handleConfirmation(status)),
});

const enhancedForm = withFormik({
  mapPropsToValues  : props => props.obj,
  handleSubmit      : (values, { props, setSubmitting }) => {
    props.submitForm(values);
    setSubmitting(false);
  },
  enableReinitialize: true,
  displayName       : 'SliderForm'
})(basicSliderForm);

const SliderForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(enhancedForm);

export default SliderForm;
