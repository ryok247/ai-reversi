import React from 'react';

function LevelOptions() {
  return (
    <div className="container-for-levels">
      <label><input type="radio" name="level" value="1" defaultChecked /> Very Easy</label>
      <label><input type="radio" name="level" value="2" /> Easy</label>
      <label><input type="radio" name="level" value="3" /> Medium</label>
    </div>
  );
}

export default LevelOptions;