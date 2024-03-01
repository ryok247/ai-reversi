import React, { useEffect } from 'react';
import NavigationBar from './NavigationBar';
import PrimaryTabs from './PrimaryTabs';
import Modal from './Modal';
import { RecentGames, FavoriteGames } from './GameTable';

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
