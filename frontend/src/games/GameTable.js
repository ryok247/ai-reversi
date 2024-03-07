import React from "react";
import { useSelector } from "react-redux";
import { isUserLoggedIn } from "../manage-game";

function GameTable({ games, type }) {
  const language = useSelector((state) => state.language.language);

  let labelTable = "";
  if (language==="en"){
    if (type === "favorite") labelTable = "Favorite Games";
    else if (isUserLoggedIn()) labelTable = "Recent Games";
    else labelTable = "Recent 10 Games";
  } else if (language==="ja"){
    if (type === "favorite") labelTable = "お気に入りの対局";
    else if (isUserLoggedIn()) labelTable = "最近の対局";
    else labelTable = "最近の10局";
  } else console.assert(false, "Invalid language: " + language);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div id={`${type}-games`} style={type === "favorite" ? { display: "none" } : {}} className="favorite-recent-games">
            <div>
              <h3 className="toggle-section" data-target={`${type}-games-content`}>
                <button className="toggle-button btn-sm mx-1 btn-primary">+</button>
                {labelTable}
              </h3>
              <div id={`${type}-games-content`} style={{ display: "none" }}>
                <div className="attention">
                  <h6>{language==="en" ? 'Click "Replay" icons!' : '「リプレイ」アイコンをクリックするとリプレイウインドウが開きます'}</h6>
                </div>
                <table className="table-striped table-bordered table-sm">
                  <thead>
                    <tr>
                      {isUserLoggedIn() && <th>{language==="en" ? "Favorite" : "お気に入り"}</th>}
                      <th>{language==="en" ? "Replay" : "リプレイ"}</th>
                      {isUserLoggedIn() && <th>{language==="en" ? "Title" : "タイトル"}</th>}
                      {isUserLoggedIn() && <th>{language==="en" ? "Edit" : "編集"}</th>}
                      <th>{language==="en" ? "Date" : "年月日"}</th>
                      <th>{language==="en" ? "Time" : "時刻"}</th>
                      <th>{language==="en" ? "You" : "ユーザー"}</th>
                      <th>{language==="en" ? "Result" : "結果"}</th>
                      <th>{language==="en" ? "Black" : "黒"}</th>
                      <th>{language==="en" ? "White" : "白"}</th>
                      <th>{language==="en" ? "AI Level" : "AIのレベル"}</th>
                      <th>{language==="en" ? "Total Duration": "合計時間"}</th>
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
