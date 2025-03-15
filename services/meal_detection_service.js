class MealDetectionService {
  constructor() {
    this.vertexAIService = null;
    this.isTracking = false;
    this.checkInterval = null;
    
    // Import the Vertex AI service
    import('./vertex_ai_service.js')
      .then(module => {
        this.vertexAIService = module.default;
        this.initialize();
      })
      .catch(error => {
        console.error('Error importing Vertex AI service:', error);
      });
  }

  async initialize() {
    // Check if camera is enabled
    chrome.storage.sync.get(['cameraEnabled'], async (result) => {
      if (result.cameraEnabled) {
        await this.startTracking();
      }
    });

    // Listen for changes to camera permission
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.cameraEnabled) {
        if (changes.cameraEnabled.newValue) {
          this.startTracking();
        } else {
          this.stopTracking();
        }
      }
    });
  }

  async startTracking() {
    if (this.isTracking || !this.vertexAIService) return;
    
    try {
      await this.vertexAIService.initialize();
      await this.vertexAIService.startTracking();
      this.isTracking = true;
      
      // Override the showWellnessCheck method to use our custom implementation
      this.vertexAIService.showWellnessCheck = this.showWellnessCheck.bind(this);
      
      console.log('Meal detection tracking started');
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  }

  stopTracking() {
    if (!this.isTracking || !this.vertexAIService) return;
    
    this.vertexAIService.stopTracking();
    this.isTracking = false;
    console.log('Meal detection tracking stopped');
  }

  showWellnessCheck() {
    // Send a message to the background script to open the popup
    chrome.runtime.sendMessage({ 
      action: 'openPopup',
      systemMessage: 'I am eating. Ask me how I am doing and how my day is'
    });
  }
}

// Initialize the service
const mealDetectionService = new MealDetectionService();
export default mealDetectionService; 