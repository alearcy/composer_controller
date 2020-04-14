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
    getPublicIp, getVisibilityMode
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
import TabletOverlay from "../components/TabletOverlay";

library.add(faLock, faLockOpen, faPen, faEllipsisH, faExpand, faCogs);

let socket;

class Board extends Component {
    constructor(props) {
        super(props);
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

    render() {
        const boardWrapper = classNames({ 'board-wrapper': true, 'editing-mode': this.props.isEditingMode, 'visibilityMode': this.props.isVisibilityMode });
        const drawerTypes = {
            [DrawerForms.BUTTON_FORM]: <ButtonForm />,
            [DrawerForms.SLIDER_FORM]: <SliderForm />,
            [DrawerForms.TAB_FORM]: <TabForm />,
            [DrawerForms.LABEL_FORM]: <LabelForm />,
        };
        return (
            <div className="board">
                {this.props.isEditingMode && this.props.isVisibilityMode && <TabletOverlay/>}
                <Header status={this.props.status} />
                <Drawer open={this.props.isOpenDrawer}>
                    {drawerTypes[this.props.formRequested]}
                </Drawer>
                <Tabs />
                <div className={boardWrapper} data-tid="container">
                    <Elements
                        socket={socket}
                    />
                </div>
                <Footer
                    status={this.props.status}
                    midiMsg={this.props.midiMsg}
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
    isVisibilityMode: getVisibilityMode(state),
    isOpenDrawer: isOpenDrawer(state),
    formRequested: formRequested(state),
    loading: getLoading(state),
    currentTab: getCurrentTab(state),
    settings: getSettings(state),
    publicIp: getPublicIp(state),
    midiMsg: getMidiMsg(state),
});

const mapDispatchToProps = dispatch => ({
    toggleStatic: obj => dispatch(elementActions.lockElement(obj)),
    exitEditingMode: () => dispatch(boardActions.exitEditingMode()),
    sendMidiOutDevice: devices => dispatch(devicesActions.sendMidiOutDevice(devices)),
    sendMidiInDevice: devices => dispatch(devicesActions.sendMidiInDevice(devices)),
    sendConnectionStatus: status => dispatch(devicesActions.sendConnectionStatus(status)),
    initBoard: () => dispatch(boardActions.initBoard()),
    importFromBkp: objs => dispatch(boardActions.importFromBkp(objs)),
    setPublicIp: ip => dispatch(boardActions.setPublicIp(ip))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Board);
