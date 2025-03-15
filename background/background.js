// Listen for messages from content scripts or other extension components
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ... existing code ...
  
  // Handle opening the popup with a system message
  if (message.action === 'openPopup' && message.systemMessage) {
    // Store the system message to be used when the popup opens
    chrome.storage.local.set({ 
      pendingSystemMessage: message.systemMessage,
      popupTriggeredByMealDetection: true
    });
    
    // Open the popup
    chrome.windows.create({
      url: 'popup/popup.html',
      type: 'popup',
      width: 400,
      height: 600
    });
  }
}); 