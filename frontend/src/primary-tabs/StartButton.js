import React from 'react';
import { useSelector } from 'react-redux';

function StartButton() {

  const language = useSelector((state) => state.language.language);

  return (
    <div className="container-for-button">
      <button type="button" className="btn btn-primary" id="confirmed-btn">{language==="en" ? "START" : "スタート"}</button>
    </div>
  );
}

export default StartButton;