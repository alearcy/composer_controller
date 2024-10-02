import React, {memo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ElementTypes, MsgTypes } from '../constants/genericConstants';
import OscButton from './OscButton';
import Label from './Label';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import { sendOSCMessage } from "../store/actions";

const Element = ({
    obj,
    isEditingMode,
    editElement,
    toggleStatic,
    socket
}) => {

    const currentTab = useSelector(state => state.tabs.currentTab);
    const [currentValue, setCurrentValue] = useState(0)

    let dispatch = useDispatch();

    const handleResetPitch = (obj) => {
        if (obj.msgType === MsgTypes.PITCH) {
            setCurrentValue(0);
            sendOSC(obj, 0);
        }
    }

    const sendBtnMsg = (obj) => {
        sendOSC(obj, obj.value);
    }

    const sendSlideValue = (obj, v) => {
        const value = Array.isArray(v) ? parseFloat(v[0]) : parseFloat(v)
        setCurrentValue(value);
        sendOSC(obj, value);
    }

    const sendOSC = (obj, value) => {
        const tabAddress = currentTab.label.replace(/\s+/g, '').toLowerCase();
        const address = `/${tabAddress}/${obj.oscValue}`;
        const type = obj.msgType;
        const data = {
            type,
            address,
            value
        };
        socket.emit('osc', data);
        sendFormattedOscMessage(data);
    }

    const sendFormattedOscMessage = (data) => {
        let msg = '';
        if (data.type === MsgTypes.SLIDER || data.type === MsgTypes.BUTTON) {
            msg = `${data.address}, ${data.value}`;
        } else {
            msg = `${data.address}, ${Math.floor(data.value * 8191)}`;
        }
        dispatch(sendOSCMessage(msg));
    }

    const elementsMap = {
        [ElementTypes.BTN]: (
            <OscButton
                obj={obj}
                onPointerDown={isEditingMode ? null : () => sendBtnMsg(obj)}
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
                    start={currentValue}
                    behaviour="drag"
                    range={{
                        min: [obj.msgType === MsgTypes.SLIDER ? obj.minValue : obj.minPitchValue],
                        max: [obj.msgType === MsgTypes.SLIDER ? obj.maxValue : obj.maxPitchValue]
                    }}
                    direction='rtl'
                    step={0.001}
                    orientation={obj.orientation}
                    disabled={isEditingMode}
                    onSlide={(v) => sendSlideValue(obj, v)}
                    onEnd={() => handleResetPitch(obj)}
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

export default memo(Element);
