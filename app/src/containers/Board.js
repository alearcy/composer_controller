import React, { Component } from 'react';
import { connect } from 'react-redux';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLock, faLockOpen, faPen, faEllipsisH, faExpand, faCogs } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { DrawerForms, ConnectionStatus, MidiTypes } from '../constants/genericConstants';
import Drawer from '../components/Drawer';
import Header from './Header';
import Footer from '../components/Footer';
import Elements from './Elements';
import * as boardActions from '../store/actions/boardActions';
import * as elementActions from '../store/actions/elementsAction';
import {
    getStatus,
    getMidiMsg,
    getOscMsg,
} from '../store/selectors/devicesSelectors';
import {
    getEditingMode,
    getLoading,
    isOpenDrawer,
    formRequested,
    getSettings,
    getPublicIp
} from '../store/selectors/boardSelectors';
import * as devicesActions from '../store/actions/devicesActions';
import TabForm from './TabForm';
import ButtonForm from './ButtonForm';
import SliderForm from './SliderForm';
import Tabs from './Tabs';
import { getEditedElement, getElements } from '../store/selectors/elementsSelectors';
import { getCurrentTab, getTabs } from '../store/selectors/tabsSelectors';
import LabelForm from './LabelForm';
import io from 'socket.io-client';
import { isArray } from 'util';

library.add(faLock, faLockOpen, faPen, faEllipsisH, faExpand, faCogs);

let socket;

class Board extends Component {
    constructor(props) {
        super(props);
        this.sendOSC = this.sendOSC.bind(this);
        this.sendMidiFromButtons = this.sendMidiFromButtons.bind(this);
        this.sendMidiFromSliders = this.sendMidiFromSliders.bind(this);
        this.handleResetPitch = this.handleResetPitch.bind(this);
    }

    componentDidMount() {
        this.props.sendConnectionStatus(ConnectionStatus.CONNECTING);
        const localIp = process.env.NODE_ENV === 'production' ? window.location.href : 'localhost:9000';
        socket = io(localIp);
        this.props.setPublicIp(localIp);
        this.props.initBoard();
        socket.on('importBackupDone', () => {
            this.props.initBoard();
        });
        socket.on('connect', () => {
            this.props.sendConnectionStatus(ConnectionStatus.CONNECTED);
        });
        socket.on('disconnect', () => {
            this.props.sendConnectionStatus(ConnectionStatus.DISCONNECTED);
        });
    }

    sendOSC(obj, value) {
        const tabAddress = this.props.currentTab.label.replace(/\s+/g, '').toLowerCase();
        const address = `/${tabAddress}/${obj.oscValue}`;
        const type = obj.midiType;
        const data = {
            type,
            address,
            value
        };
        socket.emit('osc', data);
        this.sendFormattedOscMessage(data);
    }

    sendMidiFromButtons(obj) {
        const data = {
            midiType: obj.midiType,
            channel: obj.channel,
            value: obj.value,
        };
        socket.emit('MIDIBTN', data);
        this.sendFormattedMidiButtonMessage(data);
    }

    sendMidiFromSliders(obj, v) {
        this.props.sendSliderMessage(v, obj.id);
        const data = {
            midiType: obj.midiType,
            channel: obj.channel,
            ccValue: obj.ccValue,
            value: obj.midiType === MidiTypes.PITCH ? v : Math.floor(v),
        };
        socket.emit('MIDISLIDER', data);
        this.sendFormattedMidiSliderMessage(data);
    }

    sendBtnMsg(obj) {
        this.sendOSC(obj, obj.value);
        this.sendMidiFromButtons(obj);
    }

    sendSliderMsg(obj, v) {
        const value = Array.isArray(v) ? v[0] : 0
        this.sendOSC(obj, value);
        this.sendMidiFromSliders(obj, value);
    }

    sendFormattedOscMessage(data) {
        let msg = '';
        if (data.type === MidiTypes.CC || data.type === MidiTypes.NOTE) {
            msg = `${data.address}, ${Math.floor(data.value)}`;
        } else {
            msg = `${data.address}, ${Math.floor(data.value * 8191)}`;
        }
        this.props.sendOscMessage(msg);
    }

    sendFormattedMidiSliderMessage(data) {
        let msg = '';
        if (data.midiType === MidiTypes.CC || data.type === MidiTypes.NOTE) {
            msg = `Type: ${data.midiType}, Channel: ${data.channel}, value1: ${data.ccValue}, value2: ${data.value}`;
        } else {
            msg = `Type: ${data.midiType}, Channel: ${data.channel}, value: ${Math.floor(data.value * 8191)}`;
        }
        this.props.sendMidiMessage(msg);
    }

    sendFormattedMidiButtonMessage(data) {
        const msg = `Type: ${data.midiType}, Channel: ${data.channel}, value: ${data.value}`;
        this.props.sendMidiMessage(msg);
    }

    handleResetPitch(obj) {
        if (obj.midiType === MidiTypes.PITCH) {
            this.sendSliderMsg(obj, 0)
        }
    }

    render() {
        const boardWrapper = classNames({ 'board-wrapper': true, 'editing-mode': this.props.isEditingMode });
        const drawerTypes = {
            [DrawerForms.BUTTON_FORM]: <ButtonForm />,
            [DrawerForms.SLIDER_FORM]: <SliderForm />,
            [DrawerForms.TAB_FORM]: <TabForm />,
            [DrawerForms.LABEL_FORM]: <LabelForm />,
        };
        return (
            <div className="board">
                <Header />
                <Drawer open={this.props.isOpenDrawer}>
                    {drawerTypes[this.props.formRequested]}
                </Drawer>
                <Tabs />
                <div className={boardWrapper} data-tid="container">
                    <Elements
                        sendBtnMsg={(obj) => this.sendBtnMsg(obj)}
                        sendSliderMsg={(v, obj) => this.sendSliderMsg(obj, v)}
                        resetPitch={(obj) => this.handleResetPitch(obj)}
                    />
                </div>
                <Footer
                    status={this.props.status}
                    midiMsg={this.props.midiMsg}
                    oscMsg={this.props.oscMsg}
                    loading={this.props.loading}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    obj: getEditedElement(state),
    status: getStatus(state),
    elements: getElements(state),
    tabs: getTabs(state),
    isEditingMode: getEditingMode(state),
    isOpenDrawer: isOpenDrawer(state),
    formRequested: formRequested(state),
    loading: getLoading(state),
    currentTab: getCurrentTab(state),
    settings: getSettings(state),
    publicIp: getPublicIp(state),
    oscMsg: getOscMsg(state),
    midiMsg: getMidiMsg(state),
});

const mapDispatchToProps = dispatch => ({
    toggleStatic: obj => dispatch(elementActions.lockElement(obj)),
    exitEditingMode: () => dispatch(boardActions.exitEditingMode()),
    sendMidiOutDevice: devices => dispatch(devicesActions.sendMidiOutDevice(devices)),
    sendMidiInDevice: devices => dispatch(devicesActions.sendMidiInDevice(devices)),
    sendConnectionStatus: status => dispatch(devicesActions.sendConnectionStatus(status)),
    sendSliderMessage: (value, id) => dispatch(devicesActions.sendSliderMessage(value, id)),
    sendOscMessage: value => dispatch(devicesActions.sendOSCMessage(value)),
    sendMidiMessage: value => dispatch(devicesActions.sendMIDIMessage(value)),
    initBoard: () => dispatch(boardActions.initBoard()),
    importFromBkp: objs => dispatch(boardActions.importFromBkp(objs)),
    setPublicIp: ip => dispatch(boardActions.setPublicIp(ip))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Board);
