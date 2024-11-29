// audioFeedback.js
export class AudioFeedback {
  constructor() {
    this.lastSpokenObjects = [];
  }

  updateAndSpeak(detections) {
    const currentObjects = detections.map(d => d.class);
    const newObjects = currentObjects.filter(obj => !this.lastSpokenObjects.includes(obj));
    const removedObjects = this.lastSpokenObjects.filter(obj => !currentObjects.includes(obj));
    
    if (newObjects.length > 0 || removedObjects.length > 0) {
      let text = '';
      if (newObjects.length > 0) {
        text += `Detected: ${newObjects.join(', ')}. `;
      }
      if (removedObjects.length > 0) {
        text += `No longer visible: ${removedObjects.join(', ')}.`;
      }
      this.speak(text);
      this.lastSpokenObjects = currentObjects;
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported in this browser');
    }
  }
}
