import React, { useEffect } from 'react';
//import { initializeGame } from '../../../loginApp/static/js/manage-game';
import { sharedState } from '../game-shared.js';

function StartButton() {

  /*
  const buttonRef = useRef(null);

  useEffect(() => {


    const handleClick = () => {

      // ここにクリック時の処理を書く
      // TODO: 以下はmain.jsをコピーしたもの。どう変更する？

      initializeGame(historyElement);
      // Check game mode and make a computer move if necessary
      if (sharedState.settings.mode == "cp" && sharedState.settings.color == "white") await sharedState.board.makeComputerMove();
      // Highlight possible cells
      sharedState.board.highlightPossibleCells();

    };

    // currentプロパティを通じてDOM要素にアクセス
    const button = buttonRef.current;
    button.addEventListener('click', handleClick);

    // コンポーネントのクリーンアップ時にイベントリスナーを削除
    return () => {
      button.removeEventListener('click', handleClick);
    };
  }, []); // 空の依存配列を指定して、コンポーネントのマウント時にのみ実行する
  */

  return (
    <div className="container-for-button">
      <button type="button" className="btn btn-primary" id="confirmed-btn">START</button>
    </div>
  );
}

export default StartButton;