// imageClassifier.js
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export class ImageClassifier {
  constructor() {
    this.model = null;
  }

  async loadModel() {
    try {
      await tf.ready();
      this.model = await mobilenet.load();
    } catch (error) {
      throw new Error(`Failed to load image classification model: ${error.message}`);
    }
  }

  async classify(video) {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }
    try {
      const predictions = await this.model.classify(video);
      return predictions.map(pred => ({
        class: pred.className,
        score: pred.probability
      }));
    } catch (error) {
      throw new Error(`Classification failed: ${error.message}`);
    }
  }
}