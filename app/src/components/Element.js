import React from 'react';
// import Slider from 'react-rangeslider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ElementTypes, MidiTypes } from '../constants/genericConstants';
import OscButton from './OscButton';
import Label from './Label';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

const Element = ({
    obj,
    isEditingMode,
    sendBtnMsg,
    sendSliderMsg,
    editElement,
    toggleStatic,
    resetPitch
}) => {

    const elementsMap = {
        [ElementTypes.BTN]: (
            <OscButton
                obj={obj}
                onPointerDown={isEditingMode ? null : sendBtnMsg}
                className="button-wrapper"
            />
        ),
        [ElementTypes.SLIDER]: (
            <div>
                <Nouislider
                    key={obj.id}
                    id={obj.id}
                    connect
                    animate={false}
                    start={obj.value}
                    behaviour="drag"
                    range={{
                        min: [obj.midiType === MidiTypes.CC ? obj.minCcValue : obj.minPitchValue],
                        max: [obj.midiType === MidiTypes.CC ? obj.maxCcValue : obj.maxPitchValue]
                    }}
                    direction='rtl'
                    step={obj.midiType === MidiTypes.CC ? 1 : 0.001}
                    orientation={obj.orientation}
                    disabled={isEditingMode}
                    onSlide={sendSliderMsg}
                    onEnd={resetPitch}
                />
                <div className='slider-label' style={{ color: obj.labelColor }}>{obj.label}</div>
            </div>

        ),
        [ElementTypes.LABEL]: <Label obj={obj} />
    };
    const elementClass = classNames({
        oscButton: obj.type === ElementTypes.BTN,
        slider: obj.type === ElementTypes.SLIDER,
        label: obj.type === ElementTypes.LABEL,
        editingMode: isEditingMode,
    });
    const elementStyles = {
        backgroundColor: obj.type === ElementTypes.SLIDER ? null : obj.styleColor,
        borderColor: obj.type === ElementTypes.SLIDER ? obj.styleColor : null,
        color: obj.labelColor,
    };
    return (
        <div className={elementClass} style={elementStyles}>
            {elementsMap[obj.type]}
            {isEditingMode ? (
                <div className="padlock" onPointerDown={() => toggleStatic(obj)}>
                    {obj.static ? (
                        <FontAwesomeIcon icon="lock" />
                    ) : (
                            <FontAwesomeIcon icon="lock-open" />
                        )
                    }
                </div>
            ) : null}
            {isEditingMode && !obj.static ? (
                <div className="edit" onPointerDown={() => editElement(obj.id)}>
                    <FontAwesomeIcon icon="pen" />
                </div>
            ) : null}
            {isEditingMode && !obj.static ? (
                <div className="draggable">
                    <FontAwesomeIcon icon="ellipsis-h" />
                </div>
            ) : null}
            {isEditingMode && !obj.static ? (
                <div className="resizable">
                    <FontAwesomeIcon icon="expand" />
                </div>
            ) : null}
        </div>
    );
};

export default Element;
