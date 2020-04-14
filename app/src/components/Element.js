import React, {memo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ElementTypes, MidiTypes } from '../constants/genericConstants';
import OscButton from './OscButton';
import Label from './Label';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {sendMIDIMessage, sendOSCMessage} from "../store/actions";

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
        if (obj.midiType === MidiTypes.PITCH) {
            setCurrentValue(0);
        }
    }

    const sendBtnMsg = (obj) => {
        sendOSC(obj, obj.value);
        sendMidiFromButtons(obj);
    }

    const sendMidiFromButtons = (obj) => {
        const data = {
            midiType: obj.midiType,
            channel: obj.channel,
            value: obj.value,
        };
        socket.emit('MIDIBTN', data);
        sendFormattedMidiButtonMessage(data);
    }

    const sendFormattedMidiButtonMessage = (data) => {
        const msg = `Type: ${data.midiType}, Channel: ${data.channel}, value: ${data.value}`;
        dispatch(sendMIDIMessage(msg));
    }

    const sendSlideValue = (obj, v) => {
        const value = Array.isArray(v) ? v[0] : 0
        setCurrentValue(value);
        sendOSC(obj, value);
        sendMidiFromSliders(obj, value);
    }

    const sendOSC = (obj, value) => {
        const tabAddress = currentTab.label.replace(/\s+/g, '').toLowerCase();
        const address = `/${tabAddress}/${obj.oscValue}`;
        const type = obj.midiType;
        const data = {
            type,
            address,
            value
        };
        socket.emit('osc', data);
        sendFormattedOscMessage(data);
    }

    const sendMidiFromSliders = (obj, v) => {
        const data = {
            midiType: obj.midiType,
            channel: obj.channel,
            ccValue: obj.ccValue,
            value: obj.midiType === MidiTypes.PITCH ? v : Math.floor(v),
        };
        socket.emit('MIDISLIDER', data);
        sendFormattedMidiSliderMessage(data);
    }

    const sendFormattedMidiSliderMessage = (data) => {
        let msg = '';
        if (data.midiType === MidiTypes.CC || data.type === MidiTypes.NOTE) {
            msg = `Type: ${data.midiType}, Channel: ${data.channel}, value1: ${data.ccValue}, value2: ${data.value}`;
        } else {
            msg = `Type: ${data.midiType}, Channel: ${data.channel}, value: ${Math.floor(data.value * 8191)}`;
        }
        dispatch(sendMIDIMessage(msg))
    }

    const sendFormattedOscMessage = (data) => {
        let msg = '';
        if (data.type === MidiTypes.CC || data.type === MidiTypes.NOTE) {
            msg = `${data.address}, ${Math.floor(data.value)}`;
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
                        min: [obj.midiType === MidiTypes.CC ? obj.minCcValue : obj.minPitchValue],
                        max: [obj.midiType === MidiTypes.CC ? obj.maxCcValue : obj.maxPitchValue]
                    }}
                    direction='rtl'
                    step={obj.midiType === MidiTypes.CC ? 1 : 0.001}
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
