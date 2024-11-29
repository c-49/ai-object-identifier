// camera.js
export class Camera {
  constructor() {
    this.video = null;
    this.stream = null;
  }

  async setup() {
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('muted', '');
    this.video.setAttribute('playsinline', '');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      this.video.srcObject = this.stream;
      
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(resolve);
        };
      });

      // Wait for the video to have valid dimensions
      await this.waitForValidDimensions();

    } catch (error) {
      throw new Error(`Failed to access camera: ${error.message}`);
    }
  }

  async waitForValidDimensions(timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timeout waiting for video to have valid dimensions');
  }

  getVideoElement() {
    return this.video;
  }

  isVideoReady() {
    return this.video && 
           this.video.readyState === 4 && 
           this.video.videoWidth > 0 && 
           this.video.videoHeight > 0;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}