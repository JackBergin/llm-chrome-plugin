// Function to apply theme
function applyTheme(isDarkMode) {
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// Apply theme on page load
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['darkMode'], function (result) {
    // Default to true if not set
    const isDarkMode = result.darkMode !== undefined ? result.darkMode : true;
    applyTheme(isDarkMode);
  });
});

// Listen for theme change messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'themeChanged') {
    applyTheme(request.darkMode);
  }
}); 