export function loadModel() {
  try {
    const model = window.tf.loadLayersModel('/static/tfjs_model/model.json');
    
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
