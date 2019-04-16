import React, {Component} from 'react';
import {connect} from 'react-redux';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faLock, faLockOpen, faPen, faEllipsisH, faExpand, faCogs} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import {DrawerForms, ConnectionStatus} from '../constants/genericConstants';
import Drawer from '../components/Drawer';
import Header from './Header';
import Footer from '../components/Footer';
import Elements from './Elements';
import * as boardActions from '../store/actions/boardActions';
import * as elementActions from '../store/actions/elementsAction';
import {
    getStatus
} from '../store/selectors/devicesSelectors';
import {
    getEditingMode,
    getLoading,
    isOpenDrawer,
    formRequested,
    getSettings,
    getPublicIp
} from '../store/selectors/boardSelectors';
import * as sendersActions from '../store/actions/devicesActions';
import TabForm from './TabForm';
import ButtonForm from './ButtonForm';
import SliderForm from './SliderForm';
import Tabs from './Tabs';
import {getEditedElement, getElements} from '../store/selectors/elementsSelectors';
import {getCurrentTab, getTabs} from '../store/selectors/tabsSelectors';
import LabelForm from './LabelForm';
import SettingsForm from './SettingsForm';
import io from 'socket.io-client';

library.add(faLock, faLockOpen, faPen, faEllipsisH, faExpand, faCogs);

let socket;

class Board extends Component {
    constructor(props) {
        super(props);
        this.sendOSC = this.sendOSC.bind(this);
        this.sendMidiFromButtons = this.sendMidiFromButtons.bind(this);
        this.sendMidiFromSliders = this.sendMidiFromSliders.bind(this);
    }

    componentDidMount() {
        this.props.sendConnectionStatus(ConnectionStatus.CONNECTING);
        const localIp = process.env.NODE_ENV === 'production' ? window.location.href : 'localhost:9000';
        socket = io(localIp);
        this.props.setPublicIp(localIp);
        this.props.initBoard();
        this.props.sendConnectionStatus(ConnectionStatus.CONNECTED);
        socket.on('importBackupDone', () => {
            this.props.initBoard();
        });
    }

    sendOSC(obj, value) {
        const tabAddress = this.props.currentTab.label.replace(/\s+/g, '').toLowerCase();
        const address = `/${tabAddress}/${obj.oscValue}`;
        const data = {
            address,
            value
        };
        socket.emit('osc', data);
    }

    sendMidiFromButtons(obj) {
        const data = {
            midiType: obj.midiType,
            channel : obj.channel,
            value   : obj.value,
        };
        socket.emit('MIDIBTN', data);
    }

    sendMidiFromSliders(obj, v) {
        this.props.sendSliderMessage(v, obj.id);
        const data = {
            midiType: obj.midiType,
            channel : obj.channel,
            ccValue : obj.ccValue,
            value   : v,
        };
        socket.emit('MIDISLIDER', data);
    }

    sendBtnMsg(obj) {
        this.sendOSC(obj, obj.value);
        this.sendMidiFromButtons(obj);
    }

    sendSliderMsg(obj, v) {
        this.sendOSC(obj, v);
        this.sendMidiFromSliders(obj, v);
    }

    render() {
        const boardWrapper = classNames({'board-wrapper': true, 'editing-mode': this.props.isEditingMode});
        const drawerTypes = {
            [DrawerForms.BUTTON_FORM]  : <ButtonForm/>,
            [DrawerForms.SLIDER_FORM]  : <SliderForm/>,
            [DrawerForms.TAB_FORM]     : <TabForm/>,
            [DrawerForms.LABEL_FORM]   : <LabelForm/>,
            [DrawerForms.SETTINGS_FORM]: <SettingsForm/>
        };
        return (
            <div className="board">
                <Header/>
                <Drawer open={this.props.isOpenDrawer}>
                    {drawerTypes[this.props.formRequested]}
                </Drawer>
                <Tabs/>
                <div className={boardWrapper} data-tid="container">
                    {this.props.loading ? <div className="loader">Loading...</div> : null}
                    <Elements
                        sendBtnMsg={(obj) => this.sendBtnMsg(obj)}
                        sendSliderMsg={(v, obj) => this.sendSliderMsg(obj, v)}/>
                </div>
                <Footer
                    status={this.props.status}
                    midiOut={this.props.settings.midiOutDevice}
                    midiIn={this.props.settings.midiInDevice}
                    loading={this.props.loading}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    obj          : getEditedElement(state),
    status       : getStatus(state),
    elements     : getElements(state),
    tabs         : getTabs(state),
    isEditingMode: getEditingMode(state),
    isOpenDrawer : isOpenDrawer(state),
    formRequested: formRequested(state),
    loading      : getLoading(state),
    currentTab   : getCurrentTab(state),
    settings     : getSettings(state),
    publicIp     : getPublicIp(state),
});

const mapDispatchToProps = dispatch => ({
    toggleStatic        : obj => dispatch(elementActions.lockElement(obj)),
    exitEditingMode     : () => dispatch(boardActions.exitEditingMode()),
    sendMidiOutDevice   : devices => dispatch(sendersActions.sendMidiOutDevice(devices)),
    sendMidiInDevice    : devices => dispatch(sendersActions.sendMidiInDevice(devices)),
    sendConnectionStatus: status => dispatch(sendersActions.sendConnectionStatus(status)),
    sendSliderMessage   : (value, id) => dispatch(sendersActions.sendSliderMessage(value, id)),
    initBoard           : () => dispatch(boardActions.initBoard()),
    importFromBkp       : objs => dispatch(boardActions.importFromBkp(objs)),
    setPublicIp         : ip => dispatch(boardActions.setPublicIp(ip))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Board);
