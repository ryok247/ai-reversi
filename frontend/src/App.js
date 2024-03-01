import React, { useEffect } from 'react';
import NavigationBar from './navigation-bar/NavigationBar';
import PrimaryTabs from './primary-tabs/PrimaryTabs';
import Modal from './modal/Modal';
import { RecentGames, FavoriteGames } from './games/GameTable';

function App() {
  return (
    <div>
      <NavigationBar />
      <PrimaryTabs />
      <Modal />
      <FavoriteGames games={[]} />
      <RecentGames games={[]} />
    </div>
  );
}

export default App;
