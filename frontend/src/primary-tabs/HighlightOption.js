import React from 'react';

function HighlightOption() {
  return (
    <div className="container">
      <form action="">
        <input type="checkbox" id="highlight" name="highlight" value="checked" defaultChecked />
        <label htmlFor="highlight"><h5 id="highlight-text">Highlight</h5></label>
      </form>
    </div>
  );
}

export default HighlightOption;