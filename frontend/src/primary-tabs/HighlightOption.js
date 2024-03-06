import React from 'react';
import { sharedState } from '../game-shared';

function HighlightOption() {
  return (
    <div className="container">
      <form action="">
        <input type="checkbox" id="highlight" name="highlight" value="checked" onChange={()=>sharedState.settings.updateSettings("highlight")} defaultChecked />
        <label htmlFor="highlight"><h5 id="highlight-text">Highlight cells</h5></label>
      </form>
    </div>
  );
}

export default HighlightOption;