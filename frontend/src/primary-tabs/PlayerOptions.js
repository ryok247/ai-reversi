import React from 'react';
import { useSelector } from 'react-redux';

function PlayerOptions() {

  const language = useSelector((state) => state.language.language);

  return (
    <>
      <div className="question"><h4>{language==="en" ? "You are" : "色の選択"}</h4></div>
      <div className="container-for-players">
        <label><input type="radio" name="color" value="black" defaultChecked /> {language==="en" ? "First (Black)" : "黒（先手）"}</label>
        <label><input type="radio" name="color" value="white" /> {language==="en" ? "Second (White)" : "白（後手）"}</label>
      </div>
    </>
  );
}

export default PlayerOptions;