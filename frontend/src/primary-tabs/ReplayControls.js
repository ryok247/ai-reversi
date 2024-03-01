import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFastBackward, faStepBackward, faPlay, faPause, faStepForward, faFastForward } from '@fortawesome/free-solid-svg-icons';

function ReplayControls() {
  // ReplayAnimatorインスタンスのメソッドを呼び出すイベントハンドラーをここに定義します。
  
  return (
    <div className="controls">
      <button type="button" className="btn btn-primary" id="restart-animation-btn"><FontAwesomeIcon icon={faFastBackward} /></button>
      <button type="button" className="btn btn-primary" id="backward-step-btn"><FontAwesomeIcon icon={faStepBackward} /></button>
      <button type="button" className="btn btn-primary" id="start-animation-btn"><FontAwesomeIcon icon={faPlay} /></button>
      <button type="button" className="btn btn-primary" id="pause-animation-btn"><FontAwesomeIcon icon={faPause} /></button>
      <button type="button" className="btn btn-primary" id="forward-step-btn"><FontAwesomeIcon icon={faStepForward} /></button>
      <button type="button" className="btn btn-primary" id="skip-to-end-btn"><FontAwesomeIcon icon={faFastForward} /></button>
    </div>
  );
}

export default ReplayControls;
