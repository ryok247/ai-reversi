import React from 'react';
import { connect } from 'react-redux';
import { toggleVisibility } from './actions/visibilityActions';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const GameTabs = ({ isVisible, toggleVisibility }) => {
    return (
    <Tabs>
        <TabList>
        <Tab>Title 1</Tab>
        <Tab>Title 2</Tab>
        {isVisible && <Tab>Title 3</Tab>}
        </TabList>

        <TabPanel>
        <h2>Any content 1</h2>
        </TabPanel>
        <TabPanel>
        <h2>Any content 2</h2>
        </TabPanel>
        {isVisible && <TabPanel>
        <h2>Any content 3</h2>
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

export default connect(mapStateToProps, mapDispatchToProps)(GameTabs);
