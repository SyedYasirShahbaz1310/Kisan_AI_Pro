const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

console.log('🌾 Kisan AI - Crop Risk Prediction Model Training');
console.log('================================================\n');

// Generate synthetic training data for Pakistani agriculture conditions
function generateTrainingData(numSamples = 2000) {
  const data = [];
  const labels = [];

  for (let i = 0; i < numSamples; i++) {
    // Random weather conditions
    const temperature = Math.random() * 40 + 10; // 10-50°C
    const rainfall = Math.random() * 500; // 0-500mm
    const soilMoisture = Math.random() * 100; // 0-100%

    // Normalize inputs
    const normalizedTemp = (temperature - 10) / 40;
    const normalizedRainfall = rainfall / 500;
    const normalizedMoisture = soilMoisture / 100;

    data.push([normalizedTemp, normalizedRainfall, normalizedMoisture]);

    // Determine label based on conditions (5 classes)
    // 0: optimal_conditions
    // 1: fungus_risk
    // 2: drought_risk
    // 3: flood_risk
    // 4: heat_stress

    let label;

    if (temperature > 40 && soilMoisture < 30) {
      // Heat stress
      label = 4;
    } else if (rainfall > 300 && soilMoisture > 80) {
      // Flood risk
      label = 3;
    } else if (soilMoisture < 20 && rainfall < 50) {
      // Drought risk
      label = 2;
    } else if (soilMoisture > 65 && temperature > 25 && temperature < 35 && rainfall > 100) {
      // Fungus risk
      label = 1;
    } else {
      // Optimal conditions
      label = 0;
    }

    // One-hot encode
    const oneHot = [0, 0, 0, 0, 0];
    oneHot[label] = 1;
    labels.push(oneHot);
  }

  return { data, labels };
}

async function trainModel() {
  console.log('📊 Generating synthetic training data...');
  
  const { data, labels } = generateTrainingData(3000);
  
  // Split into training and validation sets
  const splitIndex = Math.floor(data.length * 0.8);
  
  const trainData = data.slice(0, splitIndex);
  const trainLabels = labels.slice(0, splitIndex);
  const valData = data.slice(splitIndex);
  const valLabels = labels.slice(splitIndex);

  console.log(`✅ Training samples: ${trainData.length}`);
  console.log(`✅ Validation samples: ${valData.length}`);

  // Create tensors
  const xTrain = tf.tensor2d(trainData);
  const yTrain = tf.tensor2d(trainLabels);
  const xVal = tf.tensor2d(valData);
  const yVal = tf.tensor2d(valLabels);

  console.log('\n🏗️ Building neural network model...');

  // Create model
  const model = tf.sequential();

  // Input layer + Hidden layer 1
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu',
    inputShape: [3], // temperature, rainfall, soil moisture
    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Hidden layer 2
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Hidden layer 3
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu'
  }));

  // Output layer (5 classes)
  model.add(tf.layers.dense({
    units: 5,
    activation: 'softmax'
  }));

  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  console.log('\n📋 Model Summary:');
  model.summary();

  console.log('\n🚀 Training model...\n');

  // Train model
  const history = await model.fit(xTrain, yTrain, {
    epochs: 100,
    batchSize: 32,
    validationData: [xVal, yVal],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if ((epoch + 1) % 10 === 0) {
          console.log(
            `Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, ` +
            `accuracy = ${(logs.acc * 100).toFixed(1)}%, ` +
            `val_accuracy = ${(logs.val_acc * 100).toFixed(1)}%`
          );
        }
      }
    }
  });

  console.log('\n📈 Training completed!');
  console.log(`Final Training Accuracy: ${(history.history.acc[history.history.acc.length - 1] * 100).toFixed(1)}%`);
  console.log(`Final Validation Accuracy: ${(history.history.val_acc[history.history.val_acc.length - 1] * 100).toFixed(1)}%`);

  // Save model
  const modelDir = path.join(__dirname, '..', 'models', 'crop_model');
  
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  // Save model architecture and weights manually for pure tfjs
  const modelJSON = model.toJSON();
  fs.writeFileSync(path.join(modelDir, 'model.json'), JSON.stringify(modelJSON, null, 2));
  
  // Save weights
  const weights = model.getWeights();
  const weightsData = weights.map(w => ({
    name: w.name,
    shape: w.shape,
    data: Array.from(w.dataSync())
  }));
  fs.writeFileSync(path.join(modelDir, 'weights.json'), JSON.stringify(weightsData, null, 2));
  
  console.log(`\n💾 Model saved to: ${modelDir}`);

  // Test the model with sample predictions
  console.log('\n🧪 Testing model with sample inputs:\n');

  const testCases = [
    { temp: 25, rain: 100, moisture: 50, expected: 'Optimal' },
    { temp: 30, rain: 200, moisture: 75, expected: 'Fungus Risk' },
    { temp: 35, rain: 20, moisture: 15, expected: 'Drought Risk' },
    { temp: 28, rain: 400, moisture: 90, expected: 'Flood Risk' },
    { temp: 45, rain: 10, moisture: 20, expected: 'Heat Stress' }
  ];

  const classNames = [
    'Optimal Conditions',
    'Fungus Risk',
    'Drought Risk',
    'Flood Risk',
    'Heat Stress'
  ];

  for (const testCase of testCases) {
    const input = tf.tensor2d([[
      (testCase.temp - 10) / 40,
      testCase.rain / 500,
      testCase.moisture / 100
    ]]);

    const prediction = model.predict(input);
    const predArray = await prediction.data();
    const maxIndex = predArray.indexOf(Math.max(...predArray));
    const confidence = (Math.max(...predArray) * 100).toFixed(1);

    console.log(`Temperature: ${testCase.temp}°C, Rainfall: ${testCase.rain}mm, Moisture: ${testCase.moisture}%`);
    console.log(`  → Predicted: ${classNames[maxIndex]} (${confidence}% confidence)`);
    console.log(`  → Expected: ${testCase.expected}\n`);

    input.dispose();
    prediction.dispose();
  }

  // Cleanup
  xTrain.dispose();
  yTrain.dispose();
  xVal.dispose();
  yVal.dispose();

  console.log('\n✅ Model training and testing complete!');
  console.log('You can now start the server with: npm start');
}

// Run training
trainModel().catch(console.error);
