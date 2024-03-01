import React from 'react';

function PlayerOptions() {
  return (
    <div className="container-for-players">
      <label><input type="radio" name="color" value="black" defaultChecked /> First (Black)</label>
      <label><input type="radio" name="color" value="white" /> Second (White)</label>
    </div>
  );
}

export default PlayerOptions;