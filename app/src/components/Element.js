import React from 'react';
import Slider from 'react-rangeslider';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import {ElementTypes, MidiTypes} from '../constants/genericConstants';
import OscButton from './OscButton';
import Label from './Label';

const Element = ({
                     obj,
                     isEditingMode,
                     sendBtnMsg,
                     sendSliderMsg,
                     editElement,
                     toggleStatic
                 }) => {
    const elementsMap = {
        [ElementTypes.BTN]   : (
            <OscButton
                obj={obj}
                onPointerDown={isEditingMode ? null : sendBtnMsg}
                className="button-wrapper"
            />
        ),
        [ElementTypes.SLIDER]: (
            <Slider
                orientation={obj.orientation}
                onChange={isEditingMode ? null : v => sendSliderMsg(v)}
                onChangeComplete={obj.midiType === MidiTypes.CC ? null : () => sendSliderMsg(0)}
                value={obj.type === ElementTypes.SLIDER ? obj.value : 0}
                min={obj.midiType === MidiTypes.CC ? obj.minCcValue : obj.minPitchValue}
                max={obj.midiType === MidiTypes.CC ? obj.maxCcValue : obj.maxPitchValue}
                tooltip={false}
                handleLabel={obj.label}
                step={obj.midiType === MidiTypes.CC ? 1 : 0.001}
            />
        ),
        [ElementTypes.LABEL] : <Label obj={obj}/>
    };
    const elementClass = classNames({
        oscButton  : obj.type === ElementTypes.BTN,
        slider     : obj.type === ElementTypes.SLIDER,
        label      : obj.type === ElementTypes.LABEL,
        editingMode: isEditingMode,
    });
    const elementStyles = {
        backgroundColor: obj.styleColor,
        color          : obj.labelColor,
    };
    return (
        <div className={elementClass} style={elementStyles}>
            {elementsMap[obj.type]}
            {isEditingMode ? (
                <div className="padlock" onPointerDown={() => toggleStatic(obj)}>
                    {obj.static ? (
                        <FontAwesomeIcon icon="lock"/>
                    ) : (
                        <FontAwesomeIcon icon="lock-open"/>
                    )}
                </div>
            ) : null}
            {isEditingMode && !obj.static ? (
                <div className="edit" onPointerDown={() => editElement(obj.id)}>
                    <FontAwesomeIcon icon="pen"/>
                </div>
            ) : null}
            {isEditingMode && !obj.static ? (
                <div className="draggable">
                    <FontAwesomeIcon icon="ellipsis-h"/>
                </div>
            ) : null}
            {isEditingMode && !obj.static ? (
                <div className="resizable">
                    <FontAwesomeIcon icon="expand"/>
                </div>
            ) : null}
        </div>
    );
};

export default Element;
