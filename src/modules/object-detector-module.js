// objectDetector.js
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class ObjectDetector {
  constructor() {
    this.model = null;
  }

  async loadModel() {
    try {
      await tf.ready();
      this.model = await cocoSsd.load();
    } catch (error) {
      throw new Error(`Failed to load object detection model: ${error.message}`);
    }
  }

  async detect(video) {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }
    try {
      return await this.model.detect(video);
    } catch (error) {
      throw new Error(`Detection failed: ${error.message}`);
    }
  }
}
