import React from "react";
import { useSelector } from "react-redux";

function GameTable({ games, title }) {
  return (
    <div>
      <h2 className="toggle-section" data-target={`${title.toLowerCase().replace(/\s+/g, '-')}-content`}>
        <button className="toggle-button">+</button>
        {title}
      </h2>
      <div id={`${title.toLowerCase().replace(/\s+/g, '-')}-content`} style={{ display: "none" }}>
        <table className="table table-striped table-bordered border-primary table-sm">
          <thead>
            <tr>
              <th>Favorite</th>
              <th>Replay</th>
              <th>Title</th>
              <th>Edit</th>
              <th>Date</th>
              <th>Time</th>
              <th>Your Color</th>
              <th>Result</th>
              <th>Black Score</th>
              <th>White Score</th>
              <th>AI Level</th>
              <th>User's Duration</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={index}>
                {/* 各セルに対応するデータを表示 */}
                <td>{game.favorite}</td>
                <td>{game.replay}</td>
                <td>{game.title}</td>
                <td>{game.edit}</td>
                <td>{game.date}</td>
                <td>{game.time}</td>
                <td>{game.color}</td>
                <td>{game.result}</td>
                <td>{game.blackScore}</td>
                <td>{game.whiteScore}</td>
                <td>{game.aiLevel}</td>
                <td>{game.userDuration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination"></div>
      </div>
    </div>
  );
}

function FavoriteGames({ games }) {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? <GameTable games={games} title="Favorite Games" /> : null;
}

function RecentGames({ games }) {
  return <GameTable games={games} title="Recent Games" />;
}

export { FavoriteGames, RecentGames };
