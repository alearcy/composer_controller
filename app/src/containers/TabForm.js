import React from 'react';
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import { getEditedTab } from '../store/selectors/tabsSelectors';
import * as boardActions from '../store/actions/boardActions';
import * as tabsActions from '../store/actions/tabsActions';
import { getConfirmationStatus } from '../store/selectors/boardSelectors';

const basicTabForm = (props) => {
  const {
    tab,
    handleSubmit,
    handleBlur,
    handleChange,
    isSubmitting,
    closeForm,
    deleteTab,
    values,
    isConfirmVisible,
    handleConfirmation
  } = props;
  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <label>Label:</label>
        <input type="text"
               name="label"
               value={values.label}
               onChange={handleChange}
               onBlur={handleBlur}/>
        <div className="submit-area">
          <button type="submit" disabled={isSubmitting} className="confirm">
            Submit
          </button>
          <button type="button" onPointerDown={closeForm} className="neutral">Cancel</button>
        </div>
        <div className="extra-tools">
          {!isConfirmVisible &&
          <button type="button" onPointerDown={() => handleConfirmation(true)} className="danger">Delete</button>}
          {isConfirmVisible && <div className="confirmation-area">
            <div className="confirmation-area--label">Sure?</div>
            <button type="button" onPointerDown={() => deleteTab(tab.id)} className="danger">Yes</button>
            <button type="button" className="neutral" onPointerDown={() => handleConfirmation(false)}>No</button>
          </div>}
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = state => ({
  tab             : getEditedTab(state),
  isConfirmVisible: getConfirmationStatus(state)
});

const mapDispatchToProps = dispatch => ({
  submitForm        : values => dispatch(tabsActions.saveTabForm(values)),
  closeForm         : () => dispatch(boardActions.exitEditingElement()),
  deleteTab         : id => dispatch(tabsActions.deleteTab(id)),
  handleConfirmation: status => dispatch(boardActions.handleConfirmation(status))
});

const enhancedForm = withFormik({
  mapPropsToValues  : props => props.tab,
  handleSubmit      : (values, { props, setSubmitting }) => {
    props.submitForm(values);
    setSubmitting(false);
  },
  enableReinitialize: true,
  displayName       : 'TabsForm'
})(basicTabForm);

const TabForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(enhancedForm);

export default TabForm;
