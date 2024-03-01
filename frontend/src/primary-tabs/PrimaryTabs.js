import React from 'react';
import { connect } from 'react-redux';
import { toggleVisibility } from '../actions/visibilityActions';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import GameOptions from './GameOptions';
import Replay from './Replay';
import Dashboard from './Dashboard';

const PrimaryTabs = ({ isVisible, toggleVisibility }) => {
    return (
    <Tabs>
        <TabList>
        <Tab>Game</Tab>
        <Tab>Replay</Tab>
        {isVisible && <Tab>Dashboard</Tab>}
        </TabList>

        <TabPanel>
        <GameOptions />
        </TabPanel>
        <TabPanel>
        <Replay />
        </TabPanel>
        {isVisible && <TabPanel>
        <Dashboard />
        </TabPanel>}
    </Tabs>
    );
};

const mapStateToProps = state => ({
  isVisible: state.visibility.isVisible
});

const mapDispatchToProps = {
  toggleVisibility
};

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryTabs);
