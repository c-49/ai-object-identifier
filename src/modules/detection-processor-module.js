// detectionProcessor.js
export class DetectionProcessor {
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold || 0.5;
    this.nmsThreshold = options.nmsThreshold || 0.3;
    this.historyLength = options.historyLength || 5;
    this.objectTimeout = options.objectTimeout || 3000;
    this.detectionHistory = {};
  }

  process(detections, timestamp) {
    const smoothedDetections = this.applyTemporalSmoothing(detections, timestamp);
    const thresholdedDetections = this.applyConfidenceThreshold(smoothedDetections);
    const nmsDetections = this.applyNMS(thresholdedDetections);
    this.removeTimedOutObjects(timestamp);
    return nmsDetections;
  }

  applyTemporalSmoothing(detections, timestamp) {
    detections.forEach(detection => {
      if (!this.detectionHistory[detection.class]) {
        this.detectionHistory[detection.class] = [];
      }
      this.detectionHistory[detection.class].push({ ...detection, timestamp });
      if (this.detectionHistory[detection.class].length > this.historyLength) {
        this.detectionHistory[detection.class].shift();
      }
    });

    return Object.entries(this.detectionHistory).map(([className, history]) => {
      const avgScore = history.reduce((sum, det) => sum + det.score, 0) / history.length;
      const avgBbox = history.reduce((sum, det) => {
        sum.x += det.bbox[0];
        sum.y += det.bbox[1];
        sum.width += det.bbox[2];
        sum.height += det.bbox[3];
        return sum;
      }, { x: 0, y: 0, width: 0, height: 0 });

      return {
        class: className,
        score: avgScore,
        bbox: [
          avgBbox.x / history.length,
          avgBbox.y / history.length,
          avgBbox.width / history.length,
          avgBbox.height / history.length
        ],
        timestamp
      };
    });
  }

  applyConfidenceThreshold(detections) {
    return detections.filter(det => det.score >= this.confidenceThreshold);
  }

  applyNMS(detections) {
    detections.sort((a, b) => b.score - a.score);
    const selected = [];
    const rejected = new Set();

    for (let i = 0; i < detections.length; i++) {
      if (rejected.has(i)) continue;
      selected.push(detections[i]);
      for (let j = i + 1; j < detections.length; j++) {
        if (rejected.has(j)) continue;
        const iou = this.calculateIoU(detections[i].bbox, detections[j].bbox);
        if (iou > this.nmsThreshold) {
          rejected.add(j);
        }
      }
    }

    return selected;
  }

  calculateIoU(box1, box2) {
    const [x1, y1, w1, h1] = box1;
    const [x2, y2, w2, h2] = box2;

    const xA = Math.max(x1, x2);
    const yA = Math.max(y1, y2);
    const xB = Math.min(x1 + w1, x2 + w2);
    const yB = Math.min(y1 + h1, y2 + h2);

    const intersectionArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const box1Area = w1 * h1;
    const box2Area = w2 * h2;

    return intersectionArea / (box1Area + box2Area - intersectionArea);
  }

  removeTimedOutObjects(currentTimestamp) {
    Object.keys(this.detectionHistory).forEach(className => {
      this.detectionHistory[className] = this.detectionHistory[className].filter(
        det => currentTimestamp - det.timestamp < this.objectTimeout
      );
      if (this.detectionHistory[className].length === 0) {
        delete this.detectionHistory[className];
      }
    });
  }
}
