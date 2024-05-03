export function loadModel() {
  try {
    const modelPath = window.location.origin + '/static/tfjs_model/model.json';
    const model = window.tf.loadLayersModel(modelPath);
    
    /*
    const inputData = window.tf.tensor([[
      [[0, 0, 0, 0, 0, 0, 0, 0],
       [0, 0, 0, 0, 0, 0, 0, 0],
       [0, 0, 0, 0, 0, 1, 0, 0],
       [0, 0, 0, 0, 0, 1, 0, 0],
       [0, 0, 0, 0, 0, 1, 0, 0],
       [0, 0, 0, 0, 0, 1, 0, 0],
       [0, 0, 0, 0, 0, 0, 0, 0],
       [0, 0, 0, 0, 0, 0, 0, 0]],
      [[0, 0, 0, 1, 0, 0, 0, 0],
       [0, 0, 0, 1, 0, 0, 0, 0],
       [0, 1, 0, 1, 0, 0, 0, 0],
       [0, 0, 1, 1, 1, 0, 1, 0],
       [0, 0, 0, 1, 1, 0, 0, 0],
       [0, 0, 0, 0, 1, 0, 0, 0],
       [0, 0, 0, 0, 1, 0, 0, 0],
       [0, 0, 0, 0, 0, 0, 0, 0]]
    ]]);

    const transposedData = inputData.transpose([0, 2, 3, 1]);
    const yPred = model.predict(transposedData);
    console.log(yPred.arraySync());
    */

    return model;

  } catch (error) {
    console.error('Error loading model:', error);
  }
}

export function constructInputTensor(logic, player) {
  const MyBoard = [];
  const OpponentBoard = [];
  for (let i = 0; i < 8; i++){
    MyBoard.push([]);
    OpponentBoard.push([]);
    for (let j = 0; j < 8; j++){
      if (logic.board[i][j] === player) {
        MyBoard[i].push(1);
        OpponentBoard[i].push(0);
      }
      else if (logic.board[i][j] === (player^1)) {
        OpponentBoard[i].push(1);
        MyBoard[i].push(0);
      }
      else {
        MyBoard[i].push(0);
        OpponentBoard[i].push(0);
      }
    }
  }

  let inputTensor = window.tf.tensor([[MyBoard, OpponentBoard]]);
  inputTensor = inputTensor.transpose([0, 2, 3, 1]);
  return inputTensor;
}