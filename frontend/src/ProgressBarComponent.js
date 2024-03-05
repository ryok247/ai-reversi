import React, { useEffect, useState } from 'react';
import ProgressBar from 'progressbar.js';

const ProgressBarComponent = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // プログレスバーのインスタンスを作成
    const bar = new ProgressBar.Line('#splash_text', {
      strokeWidth: 0.2,
      color: '#555',
      trailWidth: 0.2,
      trailColor: '#bbb',
      text: {
        style: {
          position: 'absolute',
          left: '50%',
          top: '50%',
          padding: '0',
          margin: '-30px 0 0 0',
          transform: 'translate(-50%, -50%)',
          'font-size': '1rem',
          color: '#fff',
        },
        autoStyleContainer: false
      },
      step: (state, bar) => {
        bar.setText(Math.round(bar.value() * 100) + ' %');
      }
    });

    // アニメーション開始
    bar.animate(1.0, 1000, () => {
      // アニメーション終了後にプログレスバーを非表示にする
      setProgress(100);
    });

    return () => bar.destroy();
  }, []);

  return (
    <div id="splash" style={{ display: progress === 100 ? 'none' : 'flex' }}>
      <div id="splash_text"></div>
    </div>
  );
};

export default ProgressBarComponent;
