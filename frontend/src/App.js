import React from 'react';
import NavigationBar from './NavigationBar';
import GameTabs from './GameTabs';
import Modal from './Modal';

function App() {
  return (
    <div>
      <NavigationBar />
      <GameTabs />
      <Modal />
    </div>
  );
}

export default App;
