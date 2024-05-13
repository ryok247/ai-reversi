import React from 'react';
import { useSelector } from 'react-redux';

function LevelOptions() {

  const language = useSelector((state) => state.language.language);

  return (
    <>
      <div className="question"><h4>{language==="en" ? "Level" : "レベル"}</h4></div>
      <div className="container-for-levels">
        <label><input type="radio" name="level" value="1" defaultChecked />{language==="en" ? "Very Easy" : "とてもやさしい"}</label>
        <label><input type="radio" name="level" value="2" />{language==="en" ? "Easy" : "やさしい"}</label>
        <label><input type="radio" name="level" value="3" />{language==="en" ? "Medium" : "普通"}</label>
        <label><input type="radio" name="level" value="4" />{language==="en" ? "Hard" : "難しい"}</label>
        <label><input type="radio" name="level" value="5" />{language==="en" ? "Very Hard" : "とても難しい"}</label>
        <br/><h7 className="attention">{language==="en" ? "If you choose 'Very Hard', it may take a few seconds to initialize" : "「とても難しい」の場合、初期化に数秒かかる場合があります"}</h7>
      </div>
    </>
  );
}

export default LevelOptions;