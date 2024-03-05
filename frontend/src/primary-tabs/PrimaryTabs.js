import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import GameOptions from './GameOptions.js';
import Replay from './Replay.js';
import Dashboard from './Dashboard.js';
import { isUserLoggedIn } from '../manage-game.js';

const PrimaryTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // スタイル定義: 非アクティブなタブのコンテンツを隠す
  const hiddenStyle = { display: 'none' };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs value={activeTab} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Game" />
          <Tab label="Replay" />
          {/* ダッシュボードタブにアイコンを追加 */}
          <Tab 
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                Dashboard
                {/* ユーザーがログインしていない場合にのみアイコンを表示 */}
                {!isUserLoggedIn() && <FontAwesomeIcon icon={faLock} style={{ marginLeft: 5 }} />}
              </div>
            } 
            disabled={!isUserLoggedIn()}
          />
        </Tabs>
      </Box>
      <div style={activeTab === 0 ? {} : hiddenStyle}>
        <GameOptions />
      </div>
      <div style={activeTab === 1 ? {} : hiddenStyle}>
        <Replay />
      </div>
      <div style={activeTab === 2 && isUserLoggedIn() ? {} : hiddenStyle}>
        <Dashboard />
      </div>
    </Box>
  );
};

export default PrimaryTabs;
