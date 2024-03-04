import React from 'react';

function PlayerOptions() {
  return (
    <>
      <div className="question"><h4>You are</h4></div>
      <div className="container-for-players">
        <label><input type="radio" name="color" value="black" defaultChecked /> First (Black)</label>
        <label><input type="radio" name="color" value="white" /> Second (White)</label>
      </div>
    </>
  );
}

export default PlayerOptions;