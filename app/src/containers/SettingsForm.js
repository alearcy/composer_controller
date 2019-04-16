import React from 'react';
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import * as boardActions from '../store/actions/boardActions';
import { getMidiInDevices, getMidiOutDevices } from '../store/selectors/devicesSelectors';
import { getConfirmationStatus, getSettings } from '../store/selectors/boardSelectors';

const basicSettingsForm = (props) => {
  const {
    values,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    closeForm,
    midiOutDevices,
    midiInDevices,
    resetBoard,
    openExportModal,
    openImportModal,
    rescan,
    handleConfirmation,
    isConfirmVisible
  } = props;

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        {/*<div>*/}
        {/*  <label>MIDI-IN device:</label>*/}
        {/*  <select value={values.midiInDevice} onChange={handleChange} id="midiInDevice">*/}
        {/*    <option value=''>No midi in device</option>*/}
        {/*    {midiInDevices.map(device => <option key={device.id} value={device.name}>{device.name}</option>)}*/}
        {/*  </select>*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*  <label>MIDI-OUT device</label>*/}
        {/*  <select value={values.midiOutDevice} onChange={handleChange} id="midiOutDevice">*/}
        {/*    <option value=''>No midi out device</option>*/}
        {/*    {midiOutDevices.map(device => <option key={device.id} value={device.name}>{device.name}</option>)}*/}
        {/*  </select>*/}
        {/*</div>*/}
        {/*<button type='button' onPointerDown={rescan} className="rescan-btn">Rescan MIDI</button>*/}
        {/*<div>*/}
        {/*  <label>Input port:</label>*/}
        {/*  <input name="midiInPort"*/}
        {/*         type="number"*/}
        {/*         value={values.midiInPort}*/}
        {/*         onChange={handleChange}*/}
        {/*         onBlur={handleBlur}/>*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*  <label>Output port:</label>*/}
        {/*  <input name="miniOutPort"*/}
        {/*         type="number"*/}
        {/*         value={values.miniOutPort}*/}
        {/*         onChange={handleChange}*/}
        {/*         onBlur={handleBlur}/>*/}
        {/*</div>*/}
        <div className="submit-area">
          {/*<button type="submit" disabled={isSubmitting} className="confirm">*/}
          {/*  {isSubmitting ? 'Loading...' : 'Save'}*/}
          {/*</button>*/}
          <button type="button" onPointerDown={closeForm} className="formCancel neutral">Cancel</button>
        </div>
      </form>
      <div className="extra-tools">
        {/*<button type="button" onPointerDown={openExportModal}>*/}
        {/*  Export backup*/}
        {/*</button>*/}
        {/*<button type="button" onPointerDown={openImportModal}>*/}
        {/*  Import backup*/}
        {/*</button>*/}
        {!isConfirmVisible &&
        <button type="button" onPointerDown={() => handleConfirmation(true)} className="danger">RESET ALL</button>}
        {isConfirmVisible && <div className="confirmation-area">
          <div className="confirmation-area--label">Sure?</div>
          <button type="button" onPointerDown={resetBoard} className="danger">Yes</button>
          <button type="button" className="neutral" onPointerDown={() => handleConfirmation(false)}>No</button>
        </div>}
      </div>
    </div>


  );
};

const mapStateToProps = state => ({
  obj             : getSettings(state),
  midiOutDevices  : getMidiOutDevices(state),
  midiInDevices   : getMidiInDevices(state),
  isConfirmVisible: getConfirmationStatus(state)
});

const mapDispatchToProps = dispatch => ({
  submitForm        : values => dispatch(boardActions.saveSettingsForm(values)),
  closeForm         : () => dispatch(boardActions.exitEditingElement()),
  resetBoard        : () => dispatch(boardActions.resetBoard()),
  handleConfirmation: status => dispatch(boardActions.handleConfirmation(status))
});

const enhancedForm = withFormik({
  mapPropsToValues  : props => props.obj,
  handleSubmit      : (values, { props, setSubmitting }) => {
    props.submitForm(values);
    setSubmitting(false);
  },
  enableReinitialize: true,
  displayName       : 'SettingsForm'
})(basicSettingsForm);

const SettingsForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(enhancedForm);

export default SettingsForm;
