import React, {memo} from 'react';
import { connect } from 'react-redux';
import { Rnd } from 'react-rnd';
import { getEditingMode } from '../store/selectors/boardSelectors';
import * as elementsAction from '../store/actions/elementsAction';
import { getCurrentTab } from '../store/selectors/tabsSelectors';
import { getElements } from '../store/selectors/elementsSelectors';
import Element from '../components/Element';

const Elements = ({
  isEditingMode,
  toggleStatic,
  updateElementSize,
  updateElementPos,
  currentTab,
  editElement,
  elements,
  socket
}) =>
  elements.map(
    obj =>
      obj.tab.id === currentTab.id ? (
        <Rnd
          key={obj.id}
          size={{ width: obj.w, height: obj.h }}
          minWidth="50"
          minHeight="50"
          position={{ x: obj.x, y: obj.y }}
          resizeGrid={[25, 25]}
          dragGrid={[25, 25]}
          bounds=".board-wrapper"
          onDrag={obj.static ? null : (e, d) => updateElementPos(d, obj.id)}
          onResize={
            obj.static
              ? null
              : (e, direction, ref) => updateElementSize(ref, obj.id)
          }
          dragHandleClassName="draggable"
          resizeHandleClasses={{ bottomRight: 'resizable' }}
          enableResizing={{
            top: false,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: !obj.static && isEditingMode,
            bottomLeft: false,
            topLeft: false
          }}
          disableDragging={obj.static || !isEditingMode}
        >
          <Element
            socket={socket}
            obj={obj}
            isEditingMode={isEditingMode}
            editElement={(id) => editElement(id)}
            toggleStatic={() => toggleStatic(obj)}
          />
        </Rnd>
      ) : null
  );

const mapStateToProps = state => ({
  isEditingMode: getEditingMode(state),
  currentTab: getCurrentTab(state),
  elements: getElements(state)
});

const mapDispatchToProps = dispatch => ({
  toggleStatic: obj => dispatch(elementsAction.lockElement(obj)),
  updateElementSize: (ref, id) =>
    dispatch(elementsAction.updateElementSize(ref, id)),
  updateElementPos: (pos, id) =>
    dispatch(elementsAction.updateElementPos(pos, id)),
  editElement: id => dispatch(elementsAction.editElement(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(Elements));
