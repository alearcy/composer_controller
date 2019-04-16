import React from 'react';
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import * as boardActions from '../store/actions/boardActions';
import * as elementsActions from '../store/actions/elementsAction';
import { getEditedElement } from '../store/selectors/elementsSelectors';
import { getConfirmationStatus } from '../store/selectors/boardSelectors';

const basicLabelForm = (props) => {
  const {
    values,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    closeForm,
    obj,
    deleteLabel,
    handleConfirmation,
    isConfirmVisible,
  } = props;
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
          <label>Position:</label>
          <select value={values.textAlign} onChange={handleChange} id="textAlign">
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="submit-area">
          <button type="submit" disabled={isSubmitting} className="confirm">
            {isSubmitting ? 'Loading...' : 'Save'}
          </button>
          <button type="button" onClick={closeForm} className="neutral">Cancel</button>
        </div>
      </form>
      <div className="extra-tools">
        {!isConfirmVisible && <button type="button" onClick={() => handleConfirmation(true)} className="danger">Delete</button>}
        {isConfirmVisible && <div className="confirmation-area">
          <div className="confirmation-area--label">Sure?</div>
          <button type="button" onClick={() => deleteLabel(obj.id)} className="danger">Yes</button>
          <button type="button" className="neutral" onClick={() => handleConfirmation(false)}>No</button>
        </div>}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  obj: getEditedElement(state),
  isConfirmVisible: getConfirmationStatus(state),
});

const mapDispatchToProps = dispatch => ({
  submitForm : values => dispatch(elementsActions.saveElementForm(values)),
  closeForm  : () => dispatch(boardActions.exitEditingElement()),
  deleteLabel: id => dispatch(elementsActions.deleteElement(id)),
  handleConfirmation: status => dispatch(boardActions.handleConfirmation(status)),
});

const enhancedForm = withFormik({
  mapPropsToValues  : props => props.obj,
  handleSubmit      : (values, { props, setSubmitting }) => {
    props.submitForm(values);
    setSubmitting(false);
  },
  enableReinitialize: true,
  displayName       : 'LabelForm'
})(basicLabelForm);

const LabelForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(enhancedForm);

export default LabelForm;
