// renderer.js
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(classifications) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (classifications && classifications.length > 0) {
      const prediction = classifications[0];
      
      // Draw a semi-transparent overlay
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw the class name
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(prediction.class, this.canvas.width / 2, 40);

      // Draw the confidence score
      this.ctx.font = '18px Arial';
      this.ctx.fillText(`${(prediction.score * 100).toFixed(2)}%`, this.canvas.width / 2, 70);
    } else {
      // Optional: Display a message when no high-confidence prediction is available
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('No high-confidence prediction', this.canvas.width / 2, this.canvas.height / 2);
    }
  }
}