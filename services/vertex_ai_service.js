class VertexAIService {
  constructor() {
    this.modelEndpoint = 'VERTEX_AI_ENDPOINT';
    this.initialized = false;
    this.videoElement = null;
    this.canvas = null;
    this.ctx = null;
  }

  async initialize() {
    if (this.initialized) return;

    // Create hidden video and canvas elements
    this.videoElement = document.createElement('video');
    this.videoElement.style.display = 'none';
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'none';
    
    document.body.appendChild(this.videoElement);
    document.body.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    this.initialized = true;
  }

  async startTracking() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.srcObject = stream;
      await this.videoElement.play();
      
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
      
      this.trackingInterval = setInterval(() => this.detectEating(), 1000);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }

  async detectEating() {
    this.ctx.drawImage(this.videoElement, 0, 0);
    const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      const response = await fetch(this.modelEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData
        })
      });

      const result = await response.json();
      if (result.isEating) {
        this.showWellnessCheck();
      }
    } catch (error) {
      console.error('Error detecting eating:', error);
    }
  }

  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
  }

  showWellnessCheck() {
    if (document.getElementById('wellness-check')) return;

    const popup = document.createElement('div');
    popup.id = 'wellness-check';
    popup.innerHTML = `
      <div class="wellness-content">
        <div class="wellness-header">
          <i class="fas fa-utensils"></i>
          <h3>Enjoying your meal?</h3>
        </div>
        <textarea placeholder="How are you feeling right now?"></textarea>
        <div class="wellness-actions">
          <button class="skip-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i> Skip
          </button>
          <button class="submit-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-paper-plane"></i> Share
          </button>
        </div>
      </div>
    `;
    
    // Add the stylesheet if it doesn't exist
    if (!document.querySelector('link[href*="wellness_check.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('styles/wellness_check.css');
      document.head.appendChild(link);
    }
    
    document.body.appendChild(popup);
  }
}

export default new VertexAIService(); 