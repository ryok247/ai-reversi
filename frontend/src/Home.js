import React from 'react';
import NavigationBar from './navigation-bar/NavigationBar';
import PrimaryTabs from './primary-tabs/PrimaryTabs';
import Modal from './modal/Modal';
import { RecentGames, FavoriteGames } from './games/GameTable';

function Home() {

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

export default Home;
