import React from "react";
import { useSelector } from "react-redux";
import { isUserLoggedIn } from "../manage-game";

function GameTable({ games, type }) {
  return (
    <div id={`${type}-games`} style={type === "favorite" ? { display: "none" } : {}}>
      <div>
        <h2 className="toggle-section" data-target={`${type}-games-content`}>
          <button className="toggle-button">+</button>
          {type.charAt(0).toUpperCase() + type.slice(1) + " games"}
        </h2>
        <div id={`${type}-games-content`} style={{ display: "none" }}>
          <table className="table table-striped table-bordered border-primary table-sm">
            <thead>
              <tr>
                {isUserLoggedIn() && <th>Favorite</th>}
                <th>Replay</th>
                {isUserLoggedIn() && <th>Title</th>}
                {isUserLoggedIn() && <th>Edit</th>}
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
            <tbody id={`${type}-game-table-body`}>
              {games.map((game, index) => (
                <tr key={index}>
                  {isUserLoggedIn() && <td>game.favorite</td>}
                  <td>{game.replay}</td>
                  {isUserLoggedIn() && <td>game.title</td>}
                  {isUserLoggedIn() && <td>game.edit</td>}
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
          <div id={`${type}-games-pagination`} className="pagenation"></div>
        </div>
      </div>
    </div>
  );
}

function FavoriteGames({ games }) {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? <GameTable games={games} type="favorite" /> : null;
}

function RecentGames({ games }) {
  return <GameTable games={games} type="recent" />;
}

export { FavoriteGames, RecentGames };
